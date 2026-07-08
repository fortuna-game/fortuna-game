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

    const [deposits, profiles] = await Promise.all([
      supabaseAdmin.from("deposits").select("*").order("created_at", { ascending: false }),
      supabaseAdmin.from("profiles").select("user_id, username, first_name, phone"),
    ]);

    const profileMap = new Map((profiles.data || []).map((p: any) => [p.user_id, p]));

    const rows = (deposits.data || []).map((d: any) => {
      const profile: any = profileMap.get(d.user_id);

      return {
        id: d.id,
        user_id: d.user_id,
        username: profile?.username || "Player",
        first_name: profile?.first_name || "",
        phone: profile?.phone || "",
        amount: Number(d.amount || 0),
        reference: d.reference || "",
        status: d.status || "pending",
        created_at: d.created_at,
      };
    });

    return NextResponse.json({ deposits: rows });
  } catch (error) {
    console.error("ADMIN DEPOSITS ERROR:", error);
    return NextResponse.json({ error: "Could not load deposits." }, { status: 500 });
  }
}
