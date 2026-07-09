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

export async function POST(req: Request) {
  const ok = await requireAdmin(req);
  if (!ok) return NextResponse.json({ error: "Admin access denied." }, { status: 403 });

  const { title, prizeAmount, ticketPrice } = await req.json();

  const prize = Number(prizeAmount);
  const ticket = Number(ticketPrice);

  if (!Number.isFinite(prize) || prize <= 0) {
    return NextResponse.json({ error: "Enter a valid prize amount." }, { status: 400 });
  }

  if (!Number.isFinite(ticket) || ticket <= 0) {
    return NextResponse.json({ error: "Enter a valid ticket price." }, { status: 400 });
  }

  const { data: existing } = await supabaseAdmin
    .from("lucky_draws")
    .select("id")
    .eq("status", "open")
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "Close the current open draw first." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("lucky_draws")
    .insert({
      title: title || `Lucky Draw GH₵${prize}`,
      prize_amount: prize,
      ticket_price: ticket,
      status: "open",
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, draw: data });
}
