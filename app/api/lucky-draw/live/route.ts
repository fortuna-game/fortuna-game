import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const { data: draws, error: drawsError } = await supabaseAdmin
      .from("lucky_draws")
      .select(`
        id,
        title,
        prize_amount,
        prize_type,
        prize_description,
        prize_image,
        prize_value,
        status,
        winner_count,
        selection_started_at,
        draw_at,
        created_at
      `)
      .in("status", ["open", "selecting", "completed"])
      .order("created_at", { ascending: false })
      .limit(1);

    if (drawsError) {
      return NextResponse.json(
        { error: drawsError.message },
        { status: 500 }
      );
    }

    const draw = draws?.[0];

    if (!draw) {
      return NextResponse.json({
        draw: null,
        tickets: [],
        winners: [],
        server_time: new Date().toISOString(),
      });
    }

    const { data: tickets, error: ticketsError } = await supabaseAdmin
      .from("lucky_draw_tickets")
      .select("id, draw_id, user_id, ticket_number")
      .eq("draw_id", draw.id)
      .order("created_at", { ascending: true });

    if (ticketsError) {
      return NextResponse.json(
        { error: ticketsError.message },
        { status: 500 }
      );
    }

    const { data: winners, error: winnersError } = await supabaseAdmin
      .from("lucky_draw_winners")
      .select("id, draw_id, user_id, winner_position, selected_at")
      .eq("draw_id", draw.id)
      .order("winner_position", { ascending: true });

    if (winnersError) {
      return NextResponse.json(
        { error: winnersError.message },
        { status: 500 }
      );
    }

    const winnerUserIds = Array.from(
      new Set((winners || []).map((w) => w.user_id).filter(Boolean))
    );

    const { data: profiles } =
      winnerUserIds.length > 0
        ? await supabaseAdmin
            .from("profiles")
            .select("id, username, first_name, last_name")
            .in("id", winnerUserIds)
        : { data: [] };

    const profileMap = new Map(
      (profiles || []).map((profile) => [profile.id, profile])
    );

    const publicWinners = (winners || []).map((winner) => {
      const profile = profileMap.get(winner.user_id);

      const name =
        profile?.username ||
        [profile?.first_name, profile?.last_name]
          .filter(Boolean)
          .join(" ") ||
        "Winner";

      const ticket = (tickets || []).find(
        (t) => t.user_id === winner.user_id
      );

      return {
        ...winner,
        username: name,
        ticket_number: ticket?.ticket_number || null,
      };
    });

    return NextResponse.json({
      draw: {
        ...draw,
        participant_count: new Set(
          (tickets || []).map((ticket) => ticket.user_id)
        ).size,
        ticket_count: tickets?.length || 0,
      },
      tickets: (tickets || []).map((ticket) => ({
        id: ticket.id,
        ticket_number: ticket.ticket_number,
      })),
      winners: publicWinners,
      server_time: new Date().toISOString(),
    });
  } catch (error) {
    console.error("LIVE DRAW ERROR:", error);

    return NextResponse.json(
      { error: "Could not load live draw." },
      { status: 500 }
    );
  }
}
