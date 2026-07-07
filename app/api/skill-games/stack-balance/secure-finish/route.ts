import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

  const { sessionId, placements } = await req.json();

  const { data: session } = await supabaseAdmin
    .from("skill_game_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .eq("game_slug", "stack-balance")
    .maybeSingle();

  if (!session) return NextResponse.json({ error: "Session not found." }, { status: 404 });
  if (session.status !== "started") return NextResponse.json({ error: "Game already completed." }, { status: 400 });

  const targetBlocks = Number(session.answers?.targetBlocks || 8);
  const tolerance = Number(session.answers?.tolerance || 16);
  const drops = Array.isArray(placements) ? placements.map(Number) : [];

  let score = 0;
  let last = 50;

  for (const drop of drops.slice(0, targetBlocks)) {
    if (!Number.isFinite(drop) || drop < 0 || drop > 100) continue;

    const diff = Math.abs(drop - last);
    if (diff > tolerance) break;

    score += 1;
    last = drop;
  }

  const won = score >= targetBlocks;

  const { data: settlement, error } = await supabaseAdmin.rpc("settle_skill_game_atomic", {
    p_session_id: session.id,
    p_user_id: user.id,
    p_score: score,
    p_won: won,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const settled = Array.isArray(settlement) ? settlement[0] : null;

  return NextResponse.json({
    score,
    total: targetBlocks,
    won,
    payout: Number(settled?.payout || 0),
  });
}
