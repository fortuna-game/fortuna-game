import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function maskUsername(username: string | null) {
  if (!username) return "Winner";

  const value = username.trim();

  if (!value) return "Winner";

  if (value.length === 1) {
    return `${value}****`;
  }

  if (value.length === 2) {
    return `${value.charAt(0)}****`;
  }

  if (value.length <= 4) {
    return `${value.slice(0, 2)}****`;
  }

  const visibleStart = value.slice(0, 2);
  const visibleEnd = value.slice(-2);

  return `${visibleStart}****${visibleEnd}`;
}

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
        draw_at,
        created_at,
        winner_user_id
      `)
      .eq("status", "completed")
      .not("winner_user_id", "is", null)
      .order("draw_at", { ascending: false });

    if (drawsError) {
      console.error("PUBLIC WINNERS DRAWS ERROR:", drawsError);

      return NextResponse.json(
        { error: "Could not load Lucky Draw results." },
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
      user_id: string;
      username: string | null;
    }[] = [];

    if (winnerIds.length > 0) {
      const { data: profileData, error: profilesError } =
        await supabaseAdmin
          .from("profiles")
          .select("user_id, username")
          .in("user_id", winnerIds);

      if (profilesError) {
        console.error(
          "PUBLIC WINNERS PROFILES ERROR:",
          profilesError
        );
      } else {
        profiles = profileData || [];
      }
    }

    const usernameMap = new Map(
      profiles.map((profile) => [
        profile.user_id,
        maskUsername(profile.username),
      ])
    );

    const results = (draws || []).map((draw) => ({
      id: draw.id,
      title: draw.title,
      prize_amount: draw.prize_amount,
      prize_type: draw.prize_type,
      prize_description: draw.prize_description,
      prize_image: draw.prize_image,
      prize_value: draw.prize_value,
      draw_at: draw.draw_at,
      created_at: draw.created_at,
      winner_username:
        usernameMap.get(draw.winner_user_id) || "Winner",
    }));

    return NextResponse.json({
      results,
    });
  } catch (error) {
    console.error("PUBLIC WINNERS API ERROR:", error);

    return NextResponse.json(
      { error: "Could not load Lucky Draw results." },
      { status: 500 }
    );
  }
}
