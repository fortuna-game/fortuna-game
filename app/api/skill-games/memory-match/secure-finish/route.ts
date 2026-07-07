import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Move = [string, string];

export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

  const { sessionId, moves } = await req.json();

  const { data: session } = await supabaseAdmin
    .from("skill_game_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .eq("game_slug", "memory-match")
    .maybeSingle();

  if (!session) return NextResponse.json({ error: "Session not found." }, { status: 404 });
  if (session.status !== "started") return NextResponse.json({ error: "Game already completed." }, { status: 400 });

  const cards = session.answers?.cards || [];
  const maxMoves = Number(session.answers?.maxMoves || 10);
  const submittedMoves = Array.isArray(moves) ? moves as Move[] : [];

  const matched = new Set<string>();
  let score = 0;

  for (const move of submittedMoves.slice(0, maxMoves)) {
    const [a, b] = move;
    if (!a || !b || a === b || matched.has(a) || matched.has(b)) continue;

    const cardA = cards.find((c: any) => c.id === a);
    const cardB = cards.find((c: any) => c.id === b);

    if (cardA && cardB && cardA.symbol === cardB.symbol) {
      matched.add(a);
      matched.add(b);
      score += 1;
    }
  }

  const won = score >= 6 && submittedMoves.length <= maxMoves;

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
    total: 6,
    won,
    payout: Number(settled?.payout || 0),
  });
}
