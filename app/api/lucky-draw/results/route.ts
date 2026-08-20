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
      .order("created_at", { ascending: false });

    if (drawsError) {
      return NextResponse.json(
        { error: drawsError.message },
        { status: 500 }
      );
    }

    const drawIds = (draws || []).map((draw) => draw.id);

    const { data: winners, error: winnersError } =
      drawIds.length > 0
        ? await supabaseAdmin
            .from("lucky_draw_winners")
            .select(`
              id,
              draw_id,
              user_id,
              winner_position,
              selected_at
            `)
            .in("draw_id", drawIds)
            .order("winner_position", { ascending: true })
        : { data: [], error: null };

    if (winnersError) {
      return NextResponse.json(
        { error: winnersError.message },
        { status: 500 }
      );
    }

    const winnerUserIds = Array.from(
      new Set(
        (winners || [])
          .map((winner) => winner.user_id)
          .filter(Boolean)
      )
    );

    const { data: profiles } =
      winnerUserIds.length > 0
        ? await supabaseAdmin
            .from("profiles")
            .select("id, first_name, last_name, username")
            .in("id", winnerUserIds)
        : { data: [] };

    const profileMap = new Map(
      (profiles || []).map((profile) => [
        profile.id,
        profile,
      ])
    );

    const { data: tickets } =
      drawIds.length > 0
        ? await supabaseAdmin
            .from("lucky_draw_tickets")
            .select("draw_id, user_id")
            .in("draw_id", drawIds)
        : { data: [] };

    const participantsMap = new Map<string, number>();

    for (const drawId of drawIds) {
      const participants = new Set(
        (tickets || [])
          .filter((ticket) => ticket.draw_id === drawId)
          .map((ticket) => ticket.user_id)
      );

      participantsMap.set(drawId, participants.size);
    }

    const results = (draws || []).map((draw) => {
      const drawWinners = (winners || [])
        .filter((winner) => winner.draw_id === draw.id)
        .map((winner) => {
          const profile = profileMap.get(winner.user_id);

          const name =
            profile?.username ||
            [profile?.first_name, profile?.last_name]
              .filter(Boolean)
              .join(" ") ||
            "Winner";

          return {
            id: winner.id,
            winner_position: winner.winner_position,
            selected_at: winner.selected_at,
            name,
          };
        });

      return {
        ...draw,
        participant_count:
          participantsMap.get(draw.id) || 0,
        selected_winners: drawWinners,
      };
    });

    return NextResponse.json({
      success: true,
      draws: results,
      server_time: new Date().toISOString(),
    });
  } catch (error) {
    console.error("PUBLIC LUCKY DRAW RESULTS ERROR:", error);

    return NextResponse.json(
      { error: "Could not load Lucky Draw results." },
      { status: 500 }
    );
  }
}
