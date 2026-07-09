import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { visitorId, path, userId } = await req.json();

    if (!visitorId) {
      return NextResponse.json({ success: false });
    }

    await supabaseAdmin.from("visitor_logs").insert({
      visitor_id: String(visitorId),
      user_id: userId || null,
      path: path || "/",
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false });
  }
}
