import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Not logged in." }, { status: 401 });
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: "Invalid user session." }, { status: 401 });
    }

    const { sessionId, score, won } = await req.json();

    const { data: session } = await supabaseAdmin
      .from("skill_game_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!session) {
      return NextResponse.json({ error: "Game session not found." }, { status: 404 });
    }

    if (session.status === "completed") {
      return NextResponse.json({ error: "Game already completed." }, { status: 400 });
    }

    if (won) {
      const { data: wallet } = await supabaseAdmin
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle();

      await supabaseAdmin
        .from("wallets")
        .update({
          balance: Number(wallet?.balance || 0) + Number(session.payout),
        })
        .eq("user_id", user.id);

      await supabaseAdmin.from("wallet_transactions").insert({
        user_id: user.id,
        type: "skill_game_win",
        amount: Number(session.payout),
        status: "completed",
        reference: session.id,
        description: `${session.game_slug} win payout`,
      });
    }

    await supabaseAdmin
      .from("skill_game_sessions")
      .update({
        score: Number(score || 0),
        status: "completed",
        result: won ? "won" : "lost",
        completed_at: new Date().toISOString(),
      })
      .eq("id", session.id);

    return NextResponse.json({
      success: true,
      result: won ? "won" : "lost",
      payout: won ? Number(session.payout) : 0,
    });
  } catch (error) {
    console.error("SKILL GAME FINISH ERROR:", error);
    return NextResponse.json({ error: "Could not finish skill game." }, { status: 500 });
  }
}
