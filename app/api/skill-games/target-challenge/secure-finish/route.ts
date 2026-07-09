import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

  const { sessionId, shot } = await req.json();
  const shotValue = Number(shot);

  const { data: session } = await supabaseAdmin
    .from("skill_game_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .eq("game_slug", "target-challenge")
    .maybeSingle();

  if (!session) return NextResponse.json({ error: "Session not found." }, { status: 404 });
  if (session.status !== "started") return NextResponse.json({ error: "Game already completed." }, { status: 400 });

  const targetNumber = Number(session.answers?.targetNumber);
  const zones = session.answers?.zones || [1, 2, 3, 4, 5, 6, 7];

  const landedZoneIndex = Math.min(zones.length - 1, Math.max(0, Math.floor(shotValue / (100 / zones.length))));
  const landedNumber = Number(zones[landedZoneIndex]);
  const won = Number.isFinite(shotValue) && landedNumber === targetNumber;

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
    targetNumber,
    landedNumber,
    payout: Number(settled?.payout || 0),
  });
}
