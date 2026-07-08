import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function requireAdmin(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return false;

  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) return false;

  const { data: role } = await supabaseAdmin
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  return Boolean(role && ["super_admin", "admin"].includes(role.role));
}

function inDays(dateValue: string, days: number) {
  const time = new Date(dateValue).getTime();
  const from = Date.now() - days * 24 * 60 * 60 * 1000;
  return time >= from;
}

function isToday(dateValue: string) {
  const d = new Date(dateValue);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function sum(rows: any[], field: string) {
  return rows.reduce((total, row) => total + Number(row?.[field] || 0), 0);
}

export async function GET(req: Request) {
  try {
    const ok = await requireAdmin(req);
    if (!ok) return NextResponse.json({ error: "Admin access denied." }, { status: 403 });

    const [profiles, wallets, deposits, withdrawals, transactions, sessions] = await Promise.all([
      supabaseAdmin.from("profiles").select("*"),
      supabaseAdmin.from("wallets").select("*"),
      supabaseAdmin.from("deposits").select("*").order("created_at", { ascending: false }),
      supabaseAdmin.from("withdrawals").select("*").order("created_at", { ascending: false }),
      supabaseAdmin.from("wallet_transactions").select("*").order("created_at", { ascending: false }).limit(20),
      supabaseAdmin.from("skill_game_sessions").select("*").order("created_at", { ascending: false }),
    ]);

    const profileRows = profiles.data || [];
    const walletRows = wallets.data || [];
    const depositRows = deposits.data || [];
    const withdrawalRows = withdrawals.data || [];
    const sessionRows = sessions.data || [];
    const transactionRows = transactions.data || [];

    const completedDeposits = depositRows.filter((d: any) =>
      ["completed", "paid", "success"].includes(String(d.status).toLowerCase())
    );

    const paidWithdrawals = withdrawalRows.filter((w: any) =>
      String(w.status).toLowerCase() === "paid"
    );

    const pendingWithdrawals = withdrawalRows.filter((w: any) =>
      ["processing", "sending", "pending"].includes(String(w.status).toLowerCase())
    );

    const completedGames = sessionRows.filter((s: any) =>
      ["won", "lost"].includes(String(s.result).toLowerCase())
    );

    const wonGames = completedGames.filter((s: any) => String(s.result).toLowerCase() === "won");

    function rangeStats(label: string, filterFn: (row: any) => boolean) {
      const depositsInRange = completedDeposits.filter(filterFn);
      const withdrawalsInRange = paidWithdrawals.filter(filterFn);
      const gamesInRange = completedGames.filter(filterFn);
      const winsInRange = gamesInRange.filter((g: any) => String(g.result).toLowerCase() === "won");

      const depositsTotal = sum(depositsInRange, "amount");
      const withdrawalsTotal = sum(withdrawalsInRange, "amount");
      const stakesTotal = sum(gamesInRange, "stake");
      const payoutsTotal = sum(winsInRange, "payout");
      const gameProfit = stakesTotal - payoutsTotal;
      const netCash = depositsTotal - withdrawalsTotal;

      return {
        label,
        deposits: depositsTotal,
        withdrawals: withdrawalsTotal,
        games: gamesInRange.length,
        stakes: stakesTotal,
        payouts: payoutsTotal,
        gameProfit,
        netCash,
      };
    }

    const gameCounts: Record<string, { games: number; stakes: number; payouts: number; profit: number }> = {};
    for (const game of completedGames as any[]) {
      const key = String(game.game_slug || "unknown");
      if (!gameCounts[key]) gameCounts[key] = { games: 0, stakes: 0, payouts: 0, profit: 0 };
      const stake = Number(game.stake || 0);
      const payout = String(game.result).toLowerCase() === "won" ? Number(game.payout || 0) : 0;
      gameCounts[key].games += 1;
      gameCounts[key].stakes += stake;
      gameCounts[key].payouts += payout;
      gameCounts[key].profit += stake - payout;
    }

    const topGame = Object.entries(gameCounts)
      .sort((a, b) => b[1].games - a[1].games)[0];

    return NextResponse.json({
      totalUsers: profileRows.length,
      totalWalletBalance: sum(walletRows, "balance"),
      totalDeposits: sum(completedDeposits, "amount"),
      totalWithdrawalsPaid: sum(paidWithdrawals, "amount"),
      pendingWithdrawalsCount: pendingWithdrawals.length,
      pendingWithdrawalsAmount: sum(pendingWithdrawals, "amount"),
      totalStakes: sum(completedGames, "stake"),
      totalPayouts: sum(wonGames, "payout"),
      estimatedGameProfit: sum(completedGames, "stake") - sum(wonGames, "payout"),
      activePlayers7Days: new Set(completedGames.filter((g: any) => inDays(g.created_at, 7)).map((g: any) => g.user_id)).size,
      topGame: topGame ? { slug: topGame[0], ...topGame[1] } : null,
      ranges: [
        rangeStats("Today", (r) => isToday(r.created_at)),
        rangeStats("7 Days", (r) => inDays(r.created_at, 7)),
        rangeStats("30 Days", (r) => inDays(r.created_at, 30)),
        rangeStats("All Time", () => true),
      ],
      recentTransactions: transactionRows,
      recentGames: sessionRows.slice(0, 20),
    });
  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);
    return NextResponse.json({ error: "Could not load admin dashboard." }, { status: 500 });
  }
}
