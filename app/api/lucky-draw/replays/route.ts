import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const { data: draws, error } = await supabaseAdmin
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
      .eq("status", "completed")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("PUBLIC DRAW HISTORY ERROR:", error);

      return NextResponse.json(
        { error: "Could not load previous draws." },
        { status: 500 }
      );
    }

    const completedDraws = draws || [];
    const drawIds = completedDraws.map((draw) => draw.id);

    let winnerDrawIds = new Set<string>();

    if (drawIds.length > 0) {
      const { data: winners, error: winnersError } =
        await supabaseAdmin
          .from("lucky_draw_winners")
          .select("draw_id")
          .in("draw_id", drawIds);

      if (winnersError) {
        console.error(
          "PUBLIC DRAW WINNER HISTORY ERROR:",
          winnersError
        );

        return NextResponse.json(
          { error: "Could not load previous draw winners." },
          { status: 500 }
        );
      }

      winnerDrawIds = new Set(
        (winners || []).map((winner) => winner.draw_id)
      );
    }

    const realCompletedDraws = completedDraws.filter((draw) =>
      winnerDrawIds.has(draw.id)
    );

    return NextResponse.json({
      draws: realCompletedDraws,
      server_time: new Date().toISOString(),
    });
  } catch (error) {
    console.error("PUBLIC DRAW HISTORY ERROR:", error);

    return NextResponse.json(
      { error: "Could not load previous draws." },
      { status: 500 }
    );
  }
}
