import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { userId, code } = await req.json();

    if (!userId || !code) {
      return NextResponse.json({ error: "Missing user or code" }, { status: 400 });
    }

    const { data } = await supabaseAdmin
      .from("verification_codes")
      .select("*")
      .eq("user_id", userId)
      .eq("code", code)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
    }

    await supabaseAdmin
      .from("verification_codes")
      .update({ used: true })
      .eq("id", data.id);

    await supabaseAdmin
      .from("profiles")
      .update({
        is_verified: true,
        verification_method: "code",
        verified_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("VERIFY CONFIRM ERROR:", error);
    return NextResponse.json({ error: "Could not verify" }, { status: 500 });
  }
}
