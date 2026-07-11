import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type MathQuestion = {
  id: string;
  question: string;
  options: string[];
  answer: string;
};

function shuffle<T>(items: T[]) {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createOptions(answer: number) {
  const answers = new Set<number>();
  answers.add(answer);

  while (answers.size < 4) {
    const difference = randomInt(1, Math.max(5, Math.floor(Math.abs(answer) * 0.15)));
    const wrongAnswer =
      Math.random() < 0.5 ? answer + difference : answer - difference;

    if (wrongAnswer >= 0) {
      answers.add(wrongAnswer);
    }
  }

  return shuffle([...answers].map(String));
}

function generateQuestion(index: number): MathQuestion {
  const difficulty = index % 4;

  let first: number;
  let second: number;
  let answer: number;
  let question: string;

  if (difficulty === 0) {
    first = randomInt(25, 250);
    second = randomInt(15, 180);
    answer = first + second;
    question = `${first} + ${second}`;
  } else if (difficulty === 1) {
    first = randomInt(80, 350);
    second = randomInt(20, first - 1);
    answer = first - second;
    question = `${first} - ${second}`;
  } else if (difficulty === 2) {
    first = randomInt(7, 25);
    second = randomInt(6, 20);
    answer = first * second;
    question = `${first} × ${second}`;
  } else {
    second = randomInt(3, 18);
    answer = randomInt(5, 30);
    first = second * answer;
    question = `${first} ÷ ${second}`;
  }

  return {
    id: `math-${Date.now()}-${index}-${randomInt(1000, 9999)}`,
    question,
    options: createOptions(answer),
    answer: String(answer),
  };
}

function generateMathSession() {
  const questions: MathQuestion[] = [];
  const usedQuestions = new Set<string>();

  while (questions.length < 20) {
    const question = generateQuestion(questions.length);

    if (!usedQuestions.has(question.question)) {
      usedQuestions.add(question.question);
      questions.push(question);
    }
  }

  return shuffle(questions);
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

    if (!Number.isFinite(stakeAmount) || stakeAmount < 7) {
      return NextResponse.json(
        { error: "Entry fee must be GH₵7 or above." },
        { status: 400 }
      );
    }

    const selectedQuestions = generateMathSession();

    const { data: sessionId, error: startError } =
      await supabaseAdmin.rpc("start_skill_game_atomic", {
        p_user_id: user.id,
        p_game_slug: "math-rush",
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
      minScore: 13,
      total: 20,
      questions: selectedQuestions.map(({ answer, ...question }) => question),
    });
  } catch (error) {
    console.error("MATH RUSH START ERROR:", error);

    return NextResponse.json(
      { error: "Could not start Math Rush." },
      { status: 500 }
    );
  }
}
