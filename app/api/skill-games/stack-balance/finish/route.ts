import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type SubmittedAnswer = {
  id: string;
  answer: string;
};

type StoredAnswer = {
  id: string;
  answer: string;
};

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Please log in." }, { status: 401 });
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "Invalid user session." }, { status: 401 });
    }

    const { sessionId, answers } = await req.json();

    if (!sessionId || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
    }

    const { data: session } = await supabaseAdmin
      .from("skill_game_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .eq("game_slug", "stack-balance")
      .maybeSingle();

    if (!session) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }

    if (session.status !== "started" || session.result !== "pending") {
      return NextResponse.json({ error: "Game already completed." }, { status: 400 });
    }

    const storedAnswers = (session.answers || []) as StoredAnswer[];
    let score = 0;

    for (const stored of storedAnswers) {
      const submitted = (answers as SubmittedAnswer[]).find((a) => a.id === stored.id);

      if (
        submitted &&
        String(submitted.answer).trim().toLowerCase() ===
          String(stored.answer).trim().toLowerCase()
      ) {
        score += 1;
      }
    }

    const won = score >= 8;

    const { data: settlement, error: settleError } =
      await supabaseAdmin.rpc("settle_skill_game_atomic", {
        p_session_id: session.id,
        p_user_id: user.id,
        p_score: score,
        p_won: won,
      });

    if (settleError) {
      return NextResponse.json(
        { error: settleError.message },
        { status: 400 }
      );
    }

    const settled = Array.isArray(settlement) ? settlement[0] : null;

    return NextResponse.json({
      success: true,
      score,
      total: storedAnswers.length,
      won,
      payout: Number(settled?.payout || 0),
    });
  } catch (error) {
    console.error("STACK_BALANCE FINISH ERROR:", error);
    return NextResponse.json({ error: "Could not finish Stack Balance." }, { status: 500 });
  }
}
