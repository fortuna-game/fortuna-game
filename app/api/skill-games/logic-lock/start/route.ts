import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const QUESTION_BANK = [
  { id: "m1", question: "12 + 8", options: ["18", "20", "22", "24"], answer: "20" },
  { id: "m2", question: "7 × 6", options: ["36", "40", "42", "48"], answer: "42" },
  { id: "m3", question: "50 - 17", options: ["31", "32", "33", "34"], answer: "33" },
  { id: "m4", question: "81 ÷ 9", options: ["7", "8", "9", "10"], answer: "9" },
  { id: "m5", question: "15 + 18", options: ["31", "32", "33", "35"], answer: "33" },
  { id: "m6", question: "9 × 9", options: ["72", "81", "90", "99"], answer: "81" },
  { id: "m7", question: "100 - 44", options: ["46", "54", "56", "64"], answer: "56" },
  { id: "m8", question: "6 × 8", options: ["42", "46", "48", "54"], answer: "48" },
  { id: "m9", question: "72 ÷ 8", options: ["7", "8", "9", "10"], answer: "9" },
  { id: "m10", question: "25 + 37", options: ["52", "60", "62", "72"], answer: "62" },
  { id: "m11", question: "14 × 3", options: ["32", "38", "42", "48"], answer: "42" },
  { id: "m12", question: "90 - 27", options: ["53", "63", "67", "73"], answer: "63" },
  { id: "m13", question: "11 × 5", options: ["45", "50", "55", "60"], answer: "55" },
  { id: "m14", question: "64 ÷ 4", options: ["12", "14", "16", "18"], answer: "16" },
  { id: "m15", question: "19 + 26", options: ["35", "45", "46", "55"], answer: "45" },
];

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
      stakeAmount < 1 ||
      stakeAmount > 50
    ) {
      return NextResponse.json(
        { error: "Stake must be between GH₵1 and GH₵50." },
        { status: 400 }
      );
    }

    const selectedQuestions = shuffle(QUESTION_BANK).slice(0, 10);

    const { data: sessionId, error: startError } =
      await supabaseAdmin.rpc("start_skill_game_atomic", {
        p_user_id: user.id,
        p_game_slug: "logic-lock",
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
      questions: selectedQuestions.map(({ answer, ...question }) => ({
        ...question,
        options: shuffle(question.options),
      })),
    });
  } catch (error) {
    console.error("LOGIC_LOCK START ERROR:", error);

    return NextResponse.json(
      { error: "Could not start Logic Lock." },
      { status: 500 }
    );
  }
}
