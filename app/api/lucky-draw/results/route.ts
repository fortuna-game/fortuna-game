import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const { data: draws, error: drawsError } =
      await supabaseAdmin
        .from("lucky_draws")
        .select(`
          id,
          title,
          prize_amount,
          prize_type,
          prize_description,
          prize_image,
          prize_value,
          draw_at,
          created_at,
          winner_user_id
        `)
        .eq("status", "completed")
        .not("winner_user_id", "is", null)
        .order("draw_at", { ascending: false });

    if (drawsError) {
      console.error(
        "PUBLIC LUCKY DRAW RESULTS ERROR:",
        drawsError
      );

      return NextResponse.json(
        { error: drawsError.message },
        { status: 500 }
      );
    }

    const winnerIds = Array.from(
      new Set(
        (draws || [])
          .map((draw) => draw.winner_user_id)
          .filter(Boolean)
      )
    ) as string[];

    let profiles: {
      id: string;
      first_name: string | null;
      last_name: string | null;
      username: string | null;
    }[] = [];

    if (winnerIds.length > 0) {
      const {
        data: profileData,
        error: profilesError,
      } = await supabaseAdmin
        .from("profiles")
        .select("id, first_name, last_name, username")
        .in("id", winnerIds);

      if (profilesError) {
        console.error(
          "PUBLIC WINNER PROFILES ERROR:",
          profilesError
        );
      } else {
        profiles = profileData || [];
      }
    }

    const profileMap = new Map(
      profiles.map((profile) => [
        profile.id,
        profile,
      ])
    );

    const results = (draws || []).map((draw) => ({
      ...draw,
      winner: draw.winner_user_id
        ? profileMap.get(draw.winner_user_id) || null
        : null,
    }));

    return NextResponse.json({
      results,
    });
  } catch (error) {
    console.error(
      "PUBLIC LUCKY DRAW RESULTS SERVER ERROR:",
      error
    );

    return NextResponse.json(
      {
        error: "Could not load Lucky Draw results.",
      },
      { status: 500 }
    );
  }
}
