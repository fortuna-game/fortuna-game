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

export async function GET(req: Request) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: "Admin access denied." }, { status: 403 });

  const { data: withdrawals, error } = await supabaseAdmin
    .from("withdrawals")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const userIds = [...new Set((withdrawals || []).map((w: any) => w.user_id))];

  const { data: profiles } = userIds.length
    ? await supabaseAdmin.from("profiles").select("user_id, username").in("user_id", userIds)
    : { data: [] as any[] };

  return NextResponse.json({ withdrawals: withdrawals || [], profiles: profiles || [] });
}
