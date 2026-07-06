import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    const clientId = process.env.HUBTEL_SMS_CLIENT_ID;
    const clientSecret = process.env.HUBTEL_SMS_CLIENT_SECRET;
    const senderId = process.env.HUBTEL_SMS_SENDER || "Gusmagco233";

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: "Missing Hubtel OTP credentials" }, { status: 500 });
    }

    let phoneNumber = phone.replace(/\D/g, "");

    if (phoneNumber.startsWith("0")) {
      phoneNumber = "233" + phoneNumber.substring(1);
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await fetch("https://api-otp.hubtel.com/otp/send", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        senderId,
        phoneNumber,
        countryCode: "GH",
      }),
    });

    const data = await response.json();

    console.log("HUBTEL OTP SEND:", data);

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("OTP SEND ERROR:", error);
    return NextResponse.json({ error: "Could not send OTP" }, { status: 500 });
  }
}
