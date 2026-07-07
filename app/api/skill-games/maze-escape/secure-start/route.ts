import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const walls = ["0-1", "1-1", "3-1", "1-3", "2-3", "3-3", "3-2"];

export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

  const { stake } = await req.json();
  const stakeAmount = Number(stake);

  const maze = {
    size: 5,
    walls,
    start: { x: 0, y: 0 },
    exit: { x: 4, y: 4 },
    maxMoves: 12,
    timeLimit: 45,
  };

  const { data: sessionId, error } = await supabaseAdmin.rpc("start_skill_game_atomic", {
    p_user_id: user.id,
    p_game_slug: "maze-escape",
    p_stake: stakeAmount,
    p_payout: stakeAmount * 2,
    p_answers: maze,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ sessionId, maze });
}
