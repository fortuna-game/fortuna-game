import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  try {
    const token = req.headers
      .get("authorization")
      ?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Please log in to view your wins." },
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

    const { data: wins, error } = await supabaseAdmin
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
        created_at
      `)
      .eq("winner_user_id", user.id)
      .eq("status", "completed")
      .order("draw_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      wins: wins || [],
    });
  } catch (error) {
    console.error("MY WINS ERROR:", error);

    return NextResponse.json(
      { error: "Could not load your wins." },
      { status: 500 }
    );
  }
}
