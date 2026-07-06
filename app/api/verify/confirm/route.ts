import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { userId, requestId, prefix, code } = await req.json();

    if (!userId || !requestId || !prefix || !code) {
      return NextResponse.json({ error: "Missing verification details" }, { status: 400 });
    }

    const clientId = process.env.HUBTEL_SMS_CLIENT_ID;
    const clientSecret = process.env.HUBTEL_SMS_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: "Missing Hubtel OTP credentials" }, { status: 500 });
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await fetch("https://api-otp.hubtel.com/otp/verify", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requestId,
        prefix,
        code,
      }),
    });

    const data = await response.json();

    console.log("HUBTEL OTP VERIFY:", data);

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    await supabaseAdmin
      .from("profiles")
      .update({
        is_verified: true,
        verification_method: "hubtel_otp",
        verified_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    return NextResponse.json({
      success: true,
      message: "Account verified successfully.",
      raw: data,
    });
  } catch (error) {
    console.error("OTP VERIFY ERROR:", error);
    return NextResponse.json({ error: "Could not verify OTP" }, { status: 500 });
  }
}
