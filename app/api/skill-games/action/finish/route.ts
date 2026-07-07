import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ACTION_GAMES } from "@/lib/skillActionGames";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Please log in." }, { status: 401 });
    }

    const { data: { user }, error: userError } =
      await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "Invalid user session." }, { status: 401 });
    }

    const { sessionId, score } = await req.json();
    const numericScore = Number(score);

    if (!sessionId || !Number.isFinite(numericScore)) {
      return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
    }

    const { data: session } = await supabaseAdmin
      .from("skill_game_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!session) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }

    if (session.status !== "started" || session.result !== "pending") {
      return NextResponse.json({ error: "Game already completed." }, { status: 400 });
    }

    const game = ACTION_GAMES[String(session.game_slug)];

    if (!game) {
      return NextResponse.json({ error: "Game rules not found." }, { status: 404 });
    }

    if (numericScore < 0 || numericScore > game.maxScore) {
      return NextResponse.json({ error: "Invalid score submitted." }, { status: 400 });
    }

    const won = numericScore >= game.minScore;

    const { data: settlement, error: settleError } =
      await supabaseAdmin.rpc("settle_skill_game_atomic", {
        p_session_id: session.id,
        p_user_id: user.id,
        p_score: numericScore,
        p_won: won,
      });

    if (settleError) {
      return NextResponse.json({ error: settleError.message }, { status: 400 });
    }

    const settled = Array.isArray(settlement) ? settlement[0] : null;

    return NextResponse.json({
      success: true,
      score: numericScore,
      total: game.maxScore,
      won,
      payout: Number(settled?.payout || 0),
      gameName: game.name,
    });
  } catch (error) {
    console.error("ACTION GAME FINISH ERROR:", error);
    return NextResponse.json({ error: "Could not finish game." }, { status: 500 });
  }
}
