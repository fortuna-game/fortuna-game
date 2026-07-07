import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { QUESTION_GAMES } from "@/lib/skillQuestionGames";

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Please log in to play." }, { status: 401 });
    }

    const { data: { user }, error: userError } =
      await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "Invalid user session." }, { status: 401 });
    }

    const { gameSlug, stake } = await req.json();
    const game = QUESTION_GAMES[String(gameSlug)];
    const stakeAmount = Number(stake);

    if (!game) {
      return NextResponse.json({ error: "Game not found." }, { status: 404 });
    }

    if (!Number.isFinite(stakeAmount) || stakeAmount < 1 || stakeAmount > 50) {
      return NextResponse.json({ error: "Stake must be between GH₵1 and GH₵50." }, { status: 400 });
    }

    const selectedQuestions = shuffle(game.questions).slice(0, game.total);

    const { data: sessionId, error: startError } =
      await supabaseAdmin.rpc("start_skill_game_atomic", {
        p_user_id: user.id,
        p_game_slug: gameSlug,
        p_stake: stakeAmount,
        p_payout: stakeAmount * 2,
        p_answers: selectedQuestions.map((q) => ({
          id: q.id,
          answer: q.answer,
        })),
      });

    if (startError || !sessionId) {
      return NextResponse.json(
        { error: startError?.message || "Could not start game." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      sessionId,
      gameName: game.name,
      minScore: game.minScore,
      total: game.total,
      questions: selectedQuestions.map(({ answer, ...q }) => ({
        ...q,
        options: shuffle(q.options),
      })),
    });
  } catch (error) {
    console.error("QUESTION GAME START ERROR:", error);
    return NextResponse.json({ error: "Could not start game." }, { status: 500 });
  }
}
