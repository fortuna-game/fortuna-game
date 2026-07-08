import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Admin login required." }, { status: 401 });
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return NextResponse.json({ error: "Admin access denied." }, { status: 403 });
    }

    const { data: adminRole } = await supabaseAdmin
      .from("admin_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!adminRole || !["super_admin", "admin"].includes(adminRole.role)) {
      return NextResponse.json({ error: "Admin access denied." }, { status: 403 });
    }

    const [
      profiles,
      wallets,
      deposits,
      withdrawals,
      transactions,
      sessions,
    ] = await Promise.all([
      supabaseAdmin.from("profiles").select("*"),
      supabaseAdmin.from("wallets").select("*"),
      supabaseAdmin.from("deposits").select("*").order("created_at", { ascending: false }),
      supabaseAdmin.from("withdrawals").select("*").order("created_at", { ascending: false }),
      supabaseAdmin.from("wallet_transactions").select("*").order("created_at", { ascending: false }).limit(20),
      supabaseAdmin.from("skill_game_sessions").select("*").order("created_at", { ascending: false }).limit(20),
    ]);

    const walletRows = wallets.data || [];
    const depositRows = deposits.data || [];
    const withdrawalRows = withdrawals.data || [];
    const sessionRows = sessions.data || [];

    const totalWalletBalance = walletRows.reduce((sum: number, w: any) => sum + Number(w.balance || 0), 0);
    const totalDeposits = depositRows.filter((d: any) => d.status === "paid" || d.status === "completed").reduce((sum: number, d: any) => sum + Number(d.amount || 0), 0);
    const pendingWithdrawals = withdrawalRows.filter((w: any) => w.status === "processing" || w.status === "sending");
    const totalWithdrawalsPaid = withdrawalRows.filter((w: any) => w.status === "paid").reduce((sum: number, w: any) => sum + Number(w.amount || 0), 0);
    const totalStakes = sessionRows.reduce((sum: number, s: any) => sum + Number(s.stake || 0), 0);
    const totalPayouts = sessionRows.filter((s: any) => s.result === "won").reduce((sum: number, s: any) => sum + Number(s.payout || 0), 0);

    return NextResponse.json({
      totalUsers: profiles.data?.length || 0,
      totalWalletBalance,
      totalDeposits,
      totalWithdrawalsPaid,
      pendingWithdrawalsCount: pendingWithdrawals.length,
      pendingWithdrawalsAmount: pendingWithdrawals.reduce((sum: number, w: any) => sum + Number(w.amount || 0), 0),
      recentTransactions: transactions.data || [],
      recentGames: sessionRows,
      totalStakes,
      totalPayouts,
      estimatedGameProfit: totalStakes - totalPayouts,
    });
  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);
    return NextResponse.json({ error: "Could not load admin dashboard." }, { status: 500 });
  }
}
