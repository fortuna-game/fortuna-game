import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const { data: draw, error } = await supabaseAdmin
      .from("lucky_draws")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!draw) {
      return NextResponse.json(
        { error: "No Lucky Draw is currently open." },
        { status: 404 }
      );
    }

    const { count } = await supabaseAdmin
      .from("lucky_draw_tickets")
      .select("*", { count: "exact", head: true })
      .eq("draw_id", draw.id);

    return NextResponse.json({
      draw,
      totalTickets: count || 0,
    });
  } catch (error) {
    console.error("LUCKY DRAW GET ERROR:", error);

    return NextResponse.json(
      { error: "Could not load Lucky Draw." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const token = req.headers
      .get("authorization")
      ?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Please log in to buy a ticket." },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Invalid user session." },
        { status: 401 }
      );
    }

    const { drawId } = await req.json();

    if (!drawId) {
      return NextResponse.json(
        { error: "Lucky Draw not found." },
        { status: 400 }
      );
    }

    const { data: ticketId, error } = await supabaseAdmin.rpc(
      "buy_lucky_draw_ticket_atomic",
      {
        p_user_id: user.id,
        p_draw_id: drawId,
      }
    );

    if (error || !ticketId) {
      return NextResponse.json(
        { error: error?.message || "Could not buy ticket." },
        { status: 400 }
      );
    }

    const { data: ticket } = await supabaseAdmin
      .from("lucky_draw_tickets")
      .select("id, ticket_number, amount, created_at")
      .eq("id", ticketId)
      .single();

    return NextResponse.json({
      success: true,
      ticket,
      message: "Your Lucky Draw ticket was purchased successfully.",
    });
  } catch (error) {
    console.error("LUCKY DRAW PURCHASE ERROR:", error);

    return NextResponse.json(
      { error: "Could not buy ticket." },
      { status: 500 }
    );
  }
}
