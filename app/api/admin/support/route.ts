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

  const { data, error } = await supabaseAdmin
    .from("support_tickets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ tickets: data || [] });
}

export async function POST(req: Request) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: "Admin access denied." }, { status: 403 });

  const { id, status } = await req.json();

  if (!id || !["open", "in_progress", "resolved"].includes(status)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("support_tickets")
    .update({ status })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, message: "Ticket updated." });
}
