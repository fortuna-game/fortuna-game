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

    const [transactions, profiles] = await Promise.all([
      supabaseAdmin
        .from("wallet_transactions")
        .select("*")
        .order("created_at", { ascending: false }),

      supabaseAdmin
        .from("profiles")
        .select("user_id, username, first_name, phone"),
    ]);

    const profileMap = new Map((profiles.data || []).map((p: any) => [p.user_id, p]));

    const rows = (transactions.data || []).map((t: any) => {
      const profile: any = profileMap.get(t.user_id);

      return {
        id: t.id,
        user_id: t.user_id,
        username: profile?.username || "Player",
        first_name: profile?.first_name || "",
        phone: profile?.phone || "",
        type: t.type || "wallet_activity",
        amount: Number(t.amount || 0),
        status: t.status || "completed",
        reference: t.reference || "",
        description: t.description || "",
        created_at: t.created_at,
      };
    });

    const totalCredit = rows
      .filter((t) => Number(t.amount) > 0)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalDebit = rows
      .filter((t) => Number(t.amount) < 0)
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

    return NextResponse.json({
      transactions: rows,
      summary: {
        totalTransactions: rows.length,
        totalCredit,
        totalDebit,
        netFlow: totalCredit - totalDebit,
      },
    });
  } catch (error) {
    console.error("ADMIN TRANSACTIONS ERROR:", error);
    return NextResponse.json({ error: "Could not load transactions." }, { status: 500 });
  }
}
