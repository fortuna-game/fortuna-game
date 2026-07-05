import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const { amount, userId } = await req.json();

    if (!amount || !userId) {
      return NextResponse.json({ error: "Missing amount or userId" }, { status: 400 });
    }

    const clientId = process.env.HUBTEL_CLIENT_ID;
    const clientSecret = process.env.HUBTEL_CLIENT_SECRET;
    const merchantAccount = process.env.HUBTEL_MERCHANT_ACCOUNT;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    if (!clientId || !clientSecret || !merchantAccount) {
      return NextResponse.json({ error: "Missing Hubtel credentials" }, { status: 500 });
    }

    const reference = `FORTUNA-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await fetch(
      `https://payproxyapi.hubtel.com/items/initiate`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          totalAmount: Number(amount),
          description: "Fortuna Play Wallet Deposit",
          callbackUrl: `${siteUrl}/api/deposit/callback`,
          returnUrl: `${siteUrl}/wallet`,
          cancellationUrl: `${siteUrl}/wallet/deposit`,
          merchantAccountNumber: merchantAccount,
          clientReference: reference,
        }),
      }
    );

    const rawText = await response.text();

    let data: any = {};
    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch {
      data = { rawText };
    }

    console.log("HUBTEL STATUS:", response.status);
    console.log("HUBTEL RESPONSE:", data);

    if (!response.ok) {
      return NextResponse.json({
        error: data?.message || data?.Message || data?.error || rawText || "Hubtel error",
        raw: data
      }, { status: 400 });
    }

    await supabaseAdmin.from("deposits").insert({
      user_id: userId,
      amount: Number(amount),
      reference,
      status: "pending",
    });

    return NextResponse.json({
      checkoutUrl: data?.data?.checkoutUrl || data?.checkoutUrl,
      reference,
      raw: data,
    });
  } catch (error) {
    console.error("DEPOSIT API ERROR:", error);
    return NextResponse.json({ error: "Could not start deposit - check terminal logs" }, { status: 500 });
  }
}
