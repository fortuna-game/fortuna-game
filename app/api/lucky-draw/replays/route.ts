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

    return NextResponse.json({
      draws: draws || [],
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
