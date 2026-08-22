import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function requireAdmin(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;

  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) return null;

  const { data: role } = await supabaseAdmin
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!role || !["super_admin", "admin"].includes(role.role)) return null;
  return user;
}

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) return NextResponse.json({ error: "Admin access denied." }, { status: 403 });

    const [
      profiles,
      wallets,
      deposits,
      withdrawals,
      transactions,
      sessions,
      affiliates,
    ] = await Promise.all([
      supabaseAdmin.from("profiles").select("*").order("created_at", { ascending: false }),
      supabaseAdmin.from("wallets").select("*"),
      supabaseAdmin.from("deposits").select("*"),
      supabaseAdmin.from("withdrawals").select("*"),
      supabaseAdmin.from("wallet_transactions").select("*"),
      supabaseAdmin.from("skill_game_sessions").select("*"),
      supabaseAdmin.from("affiliate_profiles").select("user_id"),
    ]);

    const affiliateUserIds = new Set(
      (affiliates.data || []).map((affiliate: any) => affiliate.user_id)
    );

    const playerProfiles = (profiles.data || []).filter(
      (profile: any) => !affiliateUserIds.has(profile.user_id)
    );

    const rows = playerProfiles.map((p: any) => {
      const userWallet = (wallets.data || []).find((w: any) => w.user_id === p.user_id);
      const userDeposits = (deposits.data || []).filter((d: any) => d.user_id === p.user_id);
      const userWithdrawals = (withdrawals.data || []).filter((w: any) => w.user_id === p.user_id);
      const userTransactions = (transactions.data || []).filter((t: any) => t.user_id === p.user_id);
      const userSessions = (sessions.data || []).filter((s: any) => s.user_id === p.user_id);

      const profileComplete = Boolean(
        p.first_name?.trim() &&
        p.last_name?.trim() &&
        p.username?.trim() &&
        p.phone?.trim()
      );

      return {
        user_id: p.user_id,
        username: p.username || null,
        first_name: p.first_name || "",
        last_name: p.last_name || "",
        phone: p.phone || "",
        profile_complete: profileComplete,
        created_at: p.created_at,
        balance: Number(userWallet?.balance || 0),
        deposits: userDeposits.reduce((sum: number, d: any) => sum + Number(d.amount || 0), 0),
        withdrawals: userWithdrawals.reduce((sum: number, w: any) => sum + Number(w.amount || 0), 0),
        transactions: userTransactions.length,
        games: userSessions.length,
        wins: userSessions.filter((s: any) => s.result === "won").length,
        losses: userSessions.filter((s: any) => s.result === "lost").length,
      };
    });

    return NextResponse.json({ users: rows });
  } catch (error) {
    console.error("ADMIN USERS ERROR:", error);
    return NextResponse.json({ error: "Could not load users." }, { status: 500 });
  }
}
