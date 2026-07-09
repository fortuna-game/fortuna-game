import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const symbols = ["🍎", "⭐", "💎", "🔥", "⚽", "🎯"];

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

  const { stake } = await req.json();
  const stakeAmount = Number(stake);

  const selected = shuffle(symbols).slice(0, 6);
  const cards = shuffle([...selected, ...selected]).map((symbol, index) => ({
    id: String(index),
    symbol,
  }));

  const { data: sessionId, error } = await supabaseAdmin.rpc("start_skill_game_atomic", {
    p_user_id: user.id,
    p_game_slug: "memory-match",
    p_stake: stakeAmount,
    p_payout: stakeAmount * 2,
    p_answers: {
      cards,
      maxMoves: 10,
    },
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({
    sessionId,
    cards,
    maxMoves: 10,
  });
}
