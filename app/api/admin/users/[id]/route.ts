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

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: "Admin access denied." }, { status: 403 });

  const { id } = await params;

  const [profile, wallet, deposits, withdrawals, transactions, games] = await Promise.all([
    supabaseAdmin.from("profiles").select("*").eq("user_id", id).maybeSingle(),
    supabaseAdmin.from("wallets").select("*").eq("user_id", id).maybeSingle(),
    supabaseAdmin.from("deposits").select("*").eq("user_id", id).order("created_at", { ascending: false }),
    supabaseAdmin.from("withdrawals").select("*").eq("user_id", id).order("created_at", { ascending: false }),
    supabaseAdmin.from("wallet_transactions").select("*").eq("user_id", id).order("created_at", { ascending: false }),
    supabaseAdmin.from("skill_game_sessions").select("*").eq("user_id", id).order("created_at", { ascending: false }),
  ]);

  return NextResponse.json({
    profile: profile.data,
    wallet: wallet.data,
    deposits: deposits.data || [],
    withdrawals: withdrawals.data || [],
    transactions: transactions.data || [],
    games: games.data || [],
  });
}
