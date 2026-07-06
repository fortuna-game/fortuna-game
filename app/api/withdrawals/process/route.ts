import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      recipientName,
      recipientMsisdn,
      customerEmail,
      channel,
      amount,
      clientReference,
    } = body;

    if (
      !recipientName ||
      !recipientMsisdn ||
      !channel ||
      !amount ||
      !clientReference
    ) {
      return NextResponse.json(
        { error: "Missing required payout information." },
        { status: 400 }
      );
    }

    const apiId = process.env.HUBTEL_PAYMENT_API_ID;
    const apiKey = process.env.HUBTEL_PAYMENT_API_KEY;
    const disbursementAccount =
      process.env.HUBTEL_DISBURSEMENT_ACCOUNT;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!apiId || !apiKey || !disbursementAccount || !siteUrl) {
      return NextResponse.json(
        { error: "Hubtel environment variables are missing." },
        { status: 500 }
      );
    }

    const authorization = Buffer.from(
      `${apiId}:${apiKey}`
    ).toString("base64");

    const hubtelResponse = await fetch(
      `https://smp.hubtel.com/api/merchants/${disbursementAccount}/send/mobilemoney`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Basic ${authorization}`,
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          RecipientName: recipientName,
          RecipientMsisdn: recipientMsisdn,
          CustomerEmail: customerEmail || "",
          Channel: channel,
          Amount: Number(amount),
          PrimaryCallbackURL: `${siteUrl}/api/withdrawals/callback`,
          Description: "Fortuna Play Withdrawal",
          ClientReference: clientReference,
        }),
      }
    );

    const data = await hubtelResponse.json();

    return NextResponse.json(data, {
      status: hubtelResponse.status,
    });
  } catch (error) {
    console.error("Hubtel payout error:", error);

    return NextResponse.json(
      { error: "Unable to process withdrawal." },
      { status: 500 }
    );
  }
}
