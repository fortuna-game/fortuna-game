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

export async function POST(req: Request) {
  try {
    const isAdmin = await requireAdmin(req);

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access denied." },
        { status: 403 }
      );
    }

    const { drawId } = await req.json();

    if (!drawId) {
      return NextResponse.json(
        { error: "Draw ID is required." },
        { status: 400 }
      );
    }

    const { data: draw, error: drawError } = await supabaseAdmin
      .from("lucky_draws")
      .select("id, title, status, prize_type")
      .eq("id", drawId)
      .maybeSingle();

    if (drawError) {
      return NextResponse.json(
        { error: drawError.message },
        { status: 500 }
      );
    }

    if (!draw) {
      return NextResponse.json(
        { error: "Lucky Draw not found." },
        { status: 404 }
      );
    }

    const status = String(draw.status || "").toLowerCase();

    if (status === "cancelled") {
      return NextResponse.json(
        {
          error:
            "This Lucky Draw was cancelled and cannot be completed.",
        },
        { status: 400 }
      );
    }

    if (
      status === "completed" ||
      status === "complete" ||
      status === "closed"
    ) {
      return NextResponse.json(
        { error: "This Lucky Draw has already been completed." },
        { status: 400 }
      );
    }

    const { count, error: ticketError } = await supabaseAdmin
      .from("lucky_draw_tickets")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("draw_id", drawId);

    if (ticketError) {
      return NextResponse.json(
        { error: ticketError.message },
        { status: 500 }
      );
    }

    if (!count || count < 1) {
      return NextResponse.json(
        {
          error:
            "Cannot select a winner because this Lucky Draw has no tickets.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin.rpc(
      "complete_lucky_draw_atomic",
      {
        p_draw_id: drawId,
      }
    );

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      result: data,
      message:
        draw.prize_type === "physical"
          ? "Winner selected successfully. The physical prize must now be arranged for delivery or collection."
          : "Winner selected and Lucky Draw completed successfully.",
    });
  } catch (error) {
    console.error("COMPLETE LUCKY DRAW ERROR:", error);

    return NextResponse.json(
      { error: "Could not complete Lucky Draw." },
      { status: 500 }
    );
  }
}
