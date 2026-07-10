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

    const openDraw = (draws || []).find(
      (draw) => draw.status === "open"
    );

    let tickets: any[] = [];
    let ticketsError: any = null;

    if (openDraw) {
      const result = await supabaseAdmin
        .from("lucky_draw_tickets")
        .select("*")
        .eq("draw_id", openDraw.id)
        .order("created_at", { ascending: false });

      tickets = result.data || [];
      ticketsError = result.error;
    }

    if (ticketsError) {
      return NextResponse.json(
        { error: ticketsError.message },
        { status: 500 }
      );
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
