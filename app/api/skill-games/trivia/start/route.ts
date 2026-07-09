import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const QUESTION_BANK = [
  {
    id: "t1",
    question: "What is the capital city of Ghana?",
    options: ["Kumasi", "Accra", "Takoradi", "Tamale"],
    answer: "Accra",
  },
  {
    id: "t2",
    question: "Which planet is known as the Red Planet?",
    options: ["Earth", "Venus", "Mars", "Jupiter"],
    answer: "Mars",
  },
  {
    id: "t3",
    question: "What is 12 × 5?",
    options: ["50", "55", "60", "65"],
    answer: "60",
  },
  {
    id: "t4",
    question: "Which ocean is the largest?",
    options: ["Atlantic", "Indian", "Pacific", "Arctic"],
    answer: "Pacific",
  },
  {
    id: "t5",
    question: "How many sides does a hexagon have?",
    options: ["5", "6", "7", "8"],
    answer: "6",
  },
  {
    id: "t6",
    question: "Which gas do plants absorb from the atmosphere?",
    options: ["Oxygen", "Hydrogen", "Carbon Dioxide", "Nitrogen"],
    answer: "Carbon Dioxide",
  },
  {
    id: "t7",
    question: "What is the largest continent?",
    options: ["Africa", "Europe", "Asia", "Australia"],
    answer: "Asia",
  },
  {
    id: "t8",
    question: "How many minutes are in two hours?",
    options: ["60", "90", "120", "180"],
    answer: "120",
  },
  {
    id: "t9",
    question: "Which organ pumps blood around the human body?",
    options: ["Brain", "Heart", "Lungs", "Kidney"],
    answer: "Heart",
  },
  {
    id: "t10",
    question: "What is 15 + 27?",
    options: ["32", "42", "52", "62"],
    answer: "42",
  },
  {
    id: "t11",
    question: "Which country is home to the pyramids of Giza?",
    options: ["Ghana", "Egypt", "Kenya", "Morocco"],
    answer: "Egypt",
  },
  {
    id: "t12",
    question: "How many months are in one year?",
    options: ["10", "11", "12", "13"],
    answer: "12",
  },
  {
    id: "t13",
    question: "What is the freezing point of water in Celsius?",
    options: ["0", "10", "32", "100"],
    answer: "0",
  },
  {
    id: "t14",
    question: "Which animal is the largest land animal?",
    options: ["Lion", "Giraffe", "Elephant", "Rhino"],
    answer: "Elephant",
  },
  {
    id: "t15",
    question: "What is 9 × 8?",
    options: ["63", "72", "81", "88"],
    answer: "72",
  },
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
      stakeAmount < 7 ||
      stakeAmount > 50
    ) {
      return NextResponse.json(
        { error: "Entry fee must be between GH₵7 and GH₵50." },
        { status: 400 }
      );
    }

    const selectedQuestions = shuffle(QUESTION_BANK).slice(0, 10);

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
