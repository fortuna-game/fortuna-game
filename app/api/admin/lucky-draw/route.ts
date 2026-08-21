import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function requireAdmin(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) return false;

  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser(token);

  if (!user) return false;

  const { data: role } = await supabaseAdmin
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  return Boolean(
    role && ["super_admin", "admin"].includes(role.role)
  );
}

export async function GET(req: Request) {
  try {
    const isAdmin = await requireAdmin(req);

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access denied." },
        { status: 403 }
      );
    }

    const { data: draws, error: drawsError } = await supabaseAdmin
      .from("lucky_draws")
      .select("*")
      .order("created_at", { ascending: false });

    if (drawsError) {
      return NextResponse.json(
        { error: drawsError.message },
        { status: 500 }
      );
    }

    // Automatically close expired draws.
    const expiredDrawIds = (draws || [])
      .filter(
        (draw) =>
          draw.status === "open" &&
          draw.ends_at &&
          new Date(draw.ends_at).getTime() <= Date.now()
      )
      .map((draw) => draw.id);

    if (expiredDrawIds.length > 0) {
      await supabaseAdmin
        .from("lucky_draws")
        .update({
          status: "ended",
          entries_locked_at: new Date().toISOString(),
        })
        .in("id", expiredDrawIds);

      for (const draw of draws || []) {
        if (expiredDrawIds.includes(draw.id)) {
          draw.status = "ended";
          draw.entries_locked_at =
            draw.entries_locked_at ||
            new Date().toISOString();
        }
      }
    }

    const drawIds = (draws || []).map((draw) => draw.id);

    let tickets: any[] = [];

    if (drawIds.length > 0) {
      const { data, error: ticketsError } = await supabaseAdmin
        .from("lucky_draw_tickets")
        .select("*")
        .in("draw_id", drawIds)
        .order("created_at", { ascending: false });

      if (ticketsError) {
        return NextResponse.json(
          { error: ticketsError.message },
          { status: 500 }
        );
      }

      tickets = data || [];
    }

    const userIds = [
      ...new Set((tickets || []).map((ticket) => ticket.user_id)),
    ];

    const { data: profiles } =
      userIds.length > 0
        ? await supabaseAdmin
            .from("profiles")
            .select("user_id, username, first_name, last_name, phone")
            .in("user_id", userIds)
        : { data: [] };

    const ticketRows = (tickets || []).map((ticket) => {
      const profile = (profiles || []).find(
        (item) => item.user_id === ticket.user_id
      );

      return {
        ...ticket,
        username: profile?.username || "Player",
        first_name: profile?.first_name || "",
        last_name: profile?.last_name || "",
        phone: profile?.phone || "",
      };
    });

    return NextResponse.json({
      draws: draws || [],
      tickets: ticketRows,
      totalTickets: ticketRows.length,
      totalRevenue: ticketRows.reduce(
        (sum, ticket) => sum + Number(ticket.amount || 0),
        0
      ),
    });
  } catch (error) {
    console.error("ADMIN LUCKY DRAW ERROR:", error);

    return NextResponse.json(
      { error: "Could not load Lucky Draw admin data." },
      { status: 500 }
    );
  }
}
