import { NextRequest, NextResponse } from "next/server";

function channelFromNetwork(network: string) {
  const n = String(network).toLowerCase();

  if (n.includes("mtn")) return "mtn-gh";
  if (n.includes("telecel") || n.includes("vodafone")) return "vodafone-gh";
  if (n.includes("tigo") || n.includes("airteltigo")) return "tigo-gh";

  return "";
}

export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get("x-internal-secret");

    if (secret !== process.env.INTERNAL_API_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      recipientName,
      recipientMsisdn,
      customerEmail,
      network,
      amount,
      clientReference,
    } = await request.json();

    const channel = channelFromNetwork(network);

    if (!recipientName || !recipientMsisdn || !channel || !amount || !clientReference) {
      return NextResponse.json({ error: "Missing required payout information." }, { status: 400 });
    }

    const apiId = process.env.HUBTEL_PAYMENT_API_ID;
    const apiKey = process.env.HUBTEL_PAYMENT_API_KEY;
    const disbursementAccount = process.env.HUBTEL_DISBURSEMENT_ACCOUNT;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    if (!apiId || !apiKey || !disbursementAccount || !siteUrl) {
      return NextResponse.json({ error: "Hubtel environment variables are missing." }, { status: 500 });
    }

    const authorization = Buffer.from(`${apiId}:${apiKey}`).toString("base64");

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

    const responseText = await hubtelResponse.text();

    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      console.error(
        "HUBTEL NON-JSON RESPONSE:",
        hubtelResponse.status,
        responseText.slice(0, 500)
      );

      return NextResponse.json(
        {
          error: "Hubtel returned a non-JSON response.",
          hubtelStatus: hubtelResponse.status,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(data, { status: hubtelResponse.status });
  } catch (error) {
    console.error("Hubtel payout error:", error);
    return NextResponse.json({ error: "Unable to process withdrawal." }, { status: 500 });
  }
}
