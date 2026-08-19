import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function requireAdmin(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) return false;

  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser(token);

  if (!user) return false;

  const { data: role } = await supabaseAdmin
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  return Boolean(
    role && ["super_admin", "admin"].includes(role.role)
  );
}

export async function POST(req: Request) {
  try {
    const ok = await requireAdmin(req);

    if (!ok) {
      return NextResponse.json(
        { error: "Admin access denied." },
        { status: 403 }
      );
    }

    const {
      title,
      prizeType,
      prizeAmount,
      prizeValue,
      prizeDescription,
      prizeImage,
      ticketPrice,
    } = await req.json();

    const ticket = Number(ticketPrice);
    const amount = Number(prizeAmount || 0);
    const value = Number(prizeValue || amount || 0);

    if (!Number.isFinite(ticket) || ticket <= 0) {
      return NextResponse.json(
        { error: "Enter a valid ticket price." },
        { status: 400 }
      );
    }

    const validPrizeTypes = [
      "cash",
      "physical",
      "rent",
      "grocery",
    ];

    const type = validPrizeTypes.includes(prizeType)
      ? prizeType
      : "cash";

    if (type === "cash" && (!Number.isFinite(amount) || amount <= 0)) {
      return NextResponse.json(
        { error: "Enter a valid cash prize amount." },
        { status: 400 }
      );
    }

    if (
      type !== "cash" &&
      (!Number.isFinite(value) || value <= 0)
    ) {
      return NextResponse.json(
        { error: "Enter a valid prize value." },
        { status: 400 }
      );
    }

    const { data: existing, error: existingError } = await supabaseAdmin
      .from("lucky_draws")
      .select("id")
      .eq("status", "open")
      .maybeSingle();

    if (existingError) {
      return NextResponse.json(
        { error: existingError.message },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json(
        { error: "Close the current open draw first." },
        { status: 400 }
      );
    }

    const finalPrizeAmount =
      type === "cash" ? amount : value;

    const defaultTitle =
      type === "cash"
        ? `Cash Prize GH₵${amount}`
        : prizeDescription || "Lucky Draw Prize";

    const { data, error } = await supabaseAdmin
      .from("lucky_draws")
      .insert({
        title: title?.trim() || defaultTitle,
        prize_amount: finalPrizeAmount,
        prize_type: type,
        prize_description: prizeDescription?.trim() || null,
        prize_image: prizeImage?.trim() || null,
        prize_value: value,
        ticket_price: ticket,
        status: "open",
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      draw: data,
    });
  } catch (error) {
    console.error("CREATE LUCKY DRAW ERROR:", error);

    return NextResponse.json(
      { error: "Could not create Lucky Draw." },
      { status: 500 }
    );
  }
}
