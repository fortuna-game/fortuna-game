import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

import { TRIVIA_QUESTIONS } from "@/lib/triviaQuestions";

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Please log in to play." },
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

    const { stake } = await req.json();
    const stakeAmount = Number(stake);

    if (
      !Number.isFinite(stakeAmount) ||
      stakeAmount < 7
    ) {
      return NextResponse.json(
        { error: "Entry fee must be GH₵7 or above." },
        { status: 400 }
      );
    }

    const selectedQuestions = shuffle(TRIVIA_QUESTIONS).slice(0, 20);

    const { data: sessionId, error: startError } =
      await supabaseAdmin.rpc("start_skill_game_atomic", {
        p_user_id: user.id,
        p_game_slug: "trivia",
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
      sessionId: sessionId,
      minScore: 17,
      total: 20,
      questions: selectedQuestions.map(({ answer, ...question }) => ({
        ...question,
        options: shuffle(question.options),
      })),
    });
  } catch (error) {
    console.error("TRIVIA START ERROR:", error);

    return NextResponse.json(
      { error: "Could not start Trivia Sprint." },
      { status: 500 }
    );
  }
}
