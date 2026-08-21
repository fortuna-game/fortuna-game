import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  try {
    const { data: draws, error } = await supabaseAdmin
      .from("lucky_draws")
      .select("*")
      .in("status", ["open", "paused", "suspended"]) // Cancelled draws are intentionally excluded
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const drawList = draws || [];

    if (drawList.length === 0) {
      return NextResponse.json({
        draws: [],
        myTicketCounts: {},
        userId: null,
      });
    }

    const drawIds = drawList.map((draw) => draw.id);

    const { data: tickets, error: ticketsError } =
      await supabaseAdmin
        .from("lucky_draw_tickets")
        .select("draw_id")
        .in("draw_id", drawIds);

    if (ticketsError) {
      return NextResponse.json(
        { error: ticketsError.message },
        { status: 500 }
      );
    }

    const ticketCounts: Record<string, number> = {};

    for (const draw of drawList) {
      ticketCounts[draw.id] = 0;
    }

    for (const ticket of tickets || []) {
      ticketCounts[ticket.draw_id] =
        (ticketCounts[ticket.draw_id] || 0) + 1;
    }

    const formattedDraws = drawList.map((draw) => ({
      ...draw,
      totalTickets: ticketCounts[draw.id] || 0,
      isUpcoming:
        Boolean(draw.starts_at) &&
        new Date(draw.starts_at).getTime() > Date.now(),
    }));

    const myTicketCounts: Record<string, number> = {};
    let userId: string | null = null;

    const token = req.headers
      .get("authorization")
      ?.replace("Bearer ", "");

    if (token) {
      const {
        data: { user },
      } = await supabaseAdmin.auth.getUser(token);

      if (user) {
        userId = user.id;

        const { data: myTickets, error: myTicketsError } =
          await supabaseAdmin
            .from("lucky_draw_tickets")
            .select("draw_id")
            .eq("user_id", user.id)
            .in("draw_id", drawIds);

        if (myTicketsError) {
          return NextResponse.json(
            { error: myTicketsError.message },
            { status: 500 }
          );
        }

        for (const draw of drawList) {
          myTicketCounts[draw.id] = 0;
        }

        for (const ticket of myTickets || []) {
          myTicketCounts[ticket.draw_id] =
            (myTicketCounts[ticket.draw_id] || 0) + 1;
        }
      }
    }

    return NextResponse.json({
      draws: formattedDraws,
      myTicketCounts,
      userId,
    });
  } catch (error) {
    console.error("LUCKY DRAW GET ERROR:", error);

    return NextResponse.json(
      { error: "Could not load Lucky Draws." },
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

    const { data: draw, error: drawError } =
      await supabaseAdmin
        .from("lucky_draws")
        .select("id, status, title, starts_at")
        .eq("id", drawId)
        .maybeSingle();

    if (drawError || !draw) {
      return NextResponse.json(
        { error: "Lucky Draw not found." },
        { status: 404 }
      );
    }

    if (draw.status === "paused") {
      return NextResponse.json(
        {
          error:
            "This Lucky Draw is currently paused. Ticket purchases are temporarily unavailable.",
        },
        { status: 400 }
      );
    }

    if (draw.status === "suspended") {
      return NextResponse.json(
        {
          error:
            "This Lucky Draw has been suspended. Ticket purchases are unavailable.",
        },
        { status: 400 }
      );
    }

    if (draw.status !== "open") {
      return NextResponse.json(
        {
          error:
            "This Lucky Draw is not currently accepting tickets.",
        },
        { status: 400 }
      );
    }

    if (
      draw.starts_at &&
      new Date(draw.starts_at).getTime() > Date.now()
    ) {
      return NextResponse.json(
        {
          error:
            "This Lucky Draw is upcoming. Ticket purchases will open when the draw starts.",
        },
        { status: 400 }
      );
    }

    const { data: ticketId, error } =
      await supabaseAdmin.rpc(
        "buy_lucky_draw_ticket_atomic",
        {
          p_user_id: user.id,
          p_draw_id: drawId,
        }
      );

    if (error || !ticketId) {
      return NextResponse.json(
        {
          error:
            error?.message || "Could not buy ticket.",
        },
        { status: 400 }
      );
    }

    const { data: ticket, error: ticketError } =
      await supabaseAdmin
        .from("lucky_draw_tickets")
        .select("id, ticket_number, amount, created_at")
        .eq("id", ticketId)
        .single();

    if (ticketError || !ticket) {
      return NextResponse.json(
        {
          error:
            "Ticket was purchased but could not be loaded.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      ticket,
      drawId,
      message:
        "Your Lucky Draw ticket was purchased successfully.",
    });
  } catch (error) {
    console.error("LUCKY DRAW PURCHASE ERROR:", error);

    return NextResponse.json(
      { error: "Could not buy ticket." },
      { status: 500 }
    );
  }
}
