import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { userId, phone } = await req.json();

    if (!userId || !phone) {
      return NextResponse.json({ error: "Missing user or phone" }, { status: 400 });
    }

    const clientId = process.env.HUBTEL_SMS_CLIENT_ID;
    const clientSecret = process.env.HUBTEL_SMS_CLIENT_SECRET;
    const sender = process.env.HUBTEL_SMS_SENDER || "Gusmagco233";

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: "Missing SMS credentials" }, { status: 500 });
    }

    const cleanPhone = phone.replace(/\D/g, "");
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const text = `Your Fortuna Play verification code is ${code}. It expires in 10 minutes.`;

    const url =
      `https://smsc.hubtel.com/v1/messages/send?` +
      `clientsecret=${encodeURIComponent(clientSecret)}` +
      `&clientid=${encodeURIComponent(clientId)}` +
      `&from=${encodeURIComponent(sender)}` +
      `&to=${encodeURIComponent(cleanPhone)}` +
      `&content=${encodeURIComponent(text)}`;

    const response = await fetch(url);
    const raw = await response.text();

    console.log("HUBTEL SMS STATUS:", response.status);
    console.log("HUBTEL SMS RESPONSE:", raw);

    if (!response.ok || raw.toLowerCase().includes("error") || raw.toLowerCase().includes("failed")) {
      return NextResponse.json({ error: raw || "SMS failed" }, { status: 400 });
    }

    await supabaseAdmin.from("verification_codes").insert({
      user_id: userId,
      phone: cleanPhone,
      code,
      purpose: "verification",
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `Verification code sent. Hubtel response: ${raw}`,
    });
  } catch (error) {
    console.error("SEND OTP ERROR:", error);
    return NextResponse.json({ error: "Could not send verification code" }, { status: 500 });
  }
}
