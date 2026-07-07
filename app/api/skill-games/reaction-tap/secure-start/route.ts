import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

  const { stake } = await req.json();
  const stakeAmount = Number(stake);

  const delayMs = Math.floor(1800 + Math.random() * 2200);
  const challenge = {
    delayMs,
    targetMs: 450,
    timeLimit: 8,
    createdAt: Date.now(),
  };

  const { data: sessionId, error } = await supabaseAdmin.rpc("start_skill_game_atomic", {
    p_user_id: user.id,
    p_game_slug: "reaction-tap",
    p_stake: stakeAmount,
    p_payout: stakeAmount * 2,
    p_answers: challenge,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({
    sessionId,
    delayMs,
    targetMs: challenge.targetMs,
    timeLimit: challenge.timeLimit,
  });
}
