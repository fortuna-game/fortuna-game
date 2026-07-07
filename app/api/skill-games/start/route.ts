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

    const { gameSlug, stake } = await req.json();
    const stakeAmount = Number(stake);

    if (!gameSlug || !stakeAmount || stakeAmount < 1 || stakeAmount > 50) {
      return NextResponse.json(
        { error: "Stake must be between GH₵1 and GH₵50." },
        { status: 400 }
      );
    }

    const { data: wallet } = await supabaseAdmin
      .from("wallets")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();

    const balance = Number(wallet?.balance || 0);

    if (balance < stakeAmount) {
      return NextResponse.json({ error: "Insufficient wallet balance." }, { status: 400 });
    }

    const payout = stakeAmount * 2;

    await supabaseAdmin
      .from("wallets")
      .update({ balance: balance - stakeAmount })
      .eq("user_id", user.id);

    const { data: session, error: sessionError } = await supabaseAdmin
      .from("skill_game_sessions")
      .insert({
        user_id: user.id,
        game_slug: gameSlug,
        stake: stakeAmount,
        payout,
        status: "started",
        result: "pending",
      })
      .select("*")
      .single();

    if (sessionError) {
      return NextResponse.json({ error: sessionError.message }, { status: 500 });
    }

    await supabaseAdmin.from("wallet_transactions").insert({
      user_id: user.id,
      type: "skill_game_entry",
      amount: -stakeAmount,
      status: "completed",
      reference: session.id,
      description: `${gameSlug} entry stake`,
    });

    return NextResponse.json({
      success: true,
      session,
      message: `Game started. GH₵${stakeAmount.toFixed(2)} stake deducted.`,
    });
  } catch (error) {
    console.error("SKILL GAME START ERROR:", error);
    return NextResponse.json({ error: "Could not start skill game." }, { status: 500 });
  }
}
