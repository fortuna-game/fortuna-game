import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

  const { sessionId, reactionMs, tooEarly } = await req.json();

  const { data: session } = await supabaseAdmin
    .from("skill_game_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .eq("game_slug", "reaction-tap")
    .maybeSingle();

  if (!session) return NextResponse.json({ error: "Session not found." }, { status: 404 });
  if (session.status !== "started") return NextResponse.json({ error: "Game already completed." }, { status: 400 });

  const targetMs = Number(session.answers?.targetMs || 450);
  const reaction = Number(reactionMs);

  const won =
    !tooEarly &&
    Number.isFinite(reaction) &&
    reaction > 80 &&
    reaction <= targetMs;

  const { data: settlement, error } = await supabaseAdmin.rpc("settle_skill_game_atomic", {
    p_session_id: session.id,
    p_user_id: user.id,
    p_score: won ? 1 : 0,
    p_won: won,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const settled = Array.isArray(settlement) ? settlement[0] : null;

  return NextResponse.json({
    score: won ? 1 : 0,
    total: 1,
    won,
    reactionMs: Number.isFinite(reaction) ? reaction : null,
    payout: Number(settled?.payout || 0),
  });
}
