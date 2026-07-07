import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const GAME_RULES: Record<
  string,
  {
    minimumScore: number;
    maximumScore: number;
  }
> = {
  trivia: { minimumScore: 8, maximumScore: 10 },
  "math-rush": { minimumScore: 8, maximumScore: 10 },
  "word-puzzle": { minimumScore: 8, maximumScore: 10 },
  "memory-match": { minimumScore: 8, maximumScore: 10 },
  "reaction-tap": { minimumScore: 8, maximumScore: 10 },
  "target-challenge": { minimumScore: 8, maximumScore: 10 },
  "pattern-sequence": { minimumScore: 8, maximumScore: 10 },
  "speed-sort": { minimumScore: 7, maximumScore: 8 },
  "code-breaker": { minimumScore: 4, maximumScore: 5 },
  "maze-escape": { minimumScore: 1, maximumScore: 1 },
  "color-clash": { minimumScore: 7, maximumScore: 8 },
  "quick-count": { minimumScore: 5, maximumScore: 6 },
  "stack-balance": { minimumScore: 10, maximumScore: 15 },
  "number-hunt": { minimumScore: 4, maximumScore: 5 },
  "logic-lock": { minimumScore: 5, maximumScore: 6 },
};

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Not logged in." },
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

    const { sessionId, score } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing game session." },
        { status: 400 }
      );
    }

    const numericScore = Number(score);

    if (!Number.isFinite(numericScore)) {
      return NextResponse.json(
        { error: "Invalid game score." },
        { status: 400 }
      );
    }

    const { data: session, error: sessionError } =
      await supabaseAdmin
        .from("skill_game_sessions")
        .select("*")
        .eq("id", sessionId)
        .eq("user_id", user.id)
        .maybeSingle();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Game session not found." },
        { status: 404 }
      );
    }

    if (session.status !== "started" || session.result !== "pending") {
      return NextResponse.json(
        { error: "This game has already been completed." },
        { status: 400 }
      );
    }

    const rules = GAME_RULES[session.game_slug];

    if (!rules) {
      return NextResponse.json(
        { error: "Game rules not found." },
        { status: 400 }
      );
    }

    if (
      numericScore < 0 ||
      numericScore > rules.maximumScore
    ) {
      return NextResponse.json(
        { error: "Invalid score submitted." },
        { status: 400 }
      );
    }

    const won = numericScore >= rules.minimumScore;

    if (won) {
      const { data: wallet, error: walletError } =
        await supabaseAdmin
          .from("wallets")
          .select("balance")
          .eq("user_id", user.id)
          .maybeSingle();

      if (walletError || !wallet) {
        return NextResponse.json(
          { error: "Wallet not found." },
          { status: 404 }
        );
      }

      const newBalance =
        Number(wallet.balance || 0) +
        Number(session.payout || 0);

      const { error: creditError } =
        await supabaseAdmin
          .from("wallets")
          .update({
            balance: newBalance,
          })
          .eq("user_id", user.id);

      if (creditError) {
        return NextResponse.json(
          { error: "Could not credit game payout." },
          { status: 500 }
        );
      }

      await supabaseAdmin
        .from("wallet_transactions")
        .insert({
          user_id: user.id,
          type: "skill_game_win",
          amount: Number(session.payout),
          status: "completed",
          reference: session.id,
          description: `${session.game_slug} win payout`,
        });
    }

    const { error: completeError } =
      await supabaseAdmin
        .from("skill_game_sessions")
        .update({
          score: numericScore,
          status: "completed",
          result: won ? "won" : "lost",
          completed_at: new Date().toISOString(),
        })
        .eq("id", session.id)
        .eq("status", "started");

    if (completeError) {
      return NextResponse.json(
        { error: "Could not complete game." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      result: won ? "won" : "lost",
      payout: won ? Number(session.payout) : 0,
      score: numericScore,
    });
  } catch (error) {
    console.error("SKILL GAME FINISH ERROR:", error);

    return NextResponse.json(
      { error: "Could not finish skill game." },
      { status: 500 }
    );
  }
}
