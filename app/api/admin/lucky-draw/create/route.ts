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
      prizeMedia,
      ticketPrice,
      status,
      rules,
      winnerCount,
      maxEntries,
      durationDays,
      endsAt,
      startsAt,
      selectionAt,
    } = await req.json();

    const cleanTitle = String(title || "").trim();
    const finalPrizeType = String(prizeType || "").trim();
    const finalTicketPrice = Number(ticketPrice);
    const finalWinnerCount = Number(winnerCount || 1);

    const finalDurationDays =
      durationDays == null ||
      String(durationDays).trim() === ""
        ? null
        : Number(durationDays);

    const finalEndsAt =
      endsAt && !Number.isNaN(new Date(endsAt).getTime())
        ? new Date(endsAt).toISOString()
        : null;

    if (
      finalDurationDays !== null &&
      (!Number.isInteger(finalDurationDays) ||
        finalDurationDays < 1)
    ) {
      return NextResponse.json(
        { error: "Duration must be a whole number of days greater than 0." },
        { status: 400 }
      );
    }

    if (!cleanTitle) {
      return NextResponse.json(
        { error: "Lucky Draw title is required." },
        { status: 400 }
      );
    }

    const validPrizeTypes = [
      "cash",
      "physical",
      "rent",
      "grocery",
      "other",
    ];

    if (!validPrizeTypes.includes(finalPrizeType)) {
      return NextResponse.json(
        { error: "Select a valid prize type." },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(finalTicketPrice) ||
      finalTicketPrice <= 0
    ) {
      return NextResponse.json(
        { error: "Enter a valid ticket price." },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(finalWinnerCount) ||
      finalWinnerCount < 1
    ) {
      return NextResponse.json(
        { error: "Number of winners must be at least 1." },
        { status: 400 }
      );
    }

    const finalMaxEntries =
      maxEntries == null ||
      String(maxEntries).trim() === ""
        ? null
        : Number(maxEntries);

    if (
      finalMaxEntries !== null &&
      (!Number.isInteger(finalMaxEntries) ||
        finalMaxEntries < 1)
    ) {
      return NextResponse.json(
        {
          error:
            "Maximum Entries must be a whole number greater than 0.",
        },
        { status: 400 }
      );
    }

    const validStatuses = [
      "open",
      "paused",
      "suspended",
    ];

    const finalStatus = validStatuses.includes(String(status))
      ? String(status)
      : "open";

    let finalPrizeAmount = Number(prizeAmount || 0);
    let finalPrizeValue = Number(prizeValue || 0);

    if (
      finalPrizeType === "cash" &&
      (!Number.isFinite(finalPrizeAmount) ||
        finalPrizeAmount <= 0)
    ) {
      return NextResponse.json(
        { error: "Enter a valid cash prize amount." },
        { status: 400 }
      );
    }

    if (
      finalPrizeType !== "cash" &&
      (!Number.isFinite(finalPrizeValue) ||
        finalPrizeValue <= 0)
    ) {
      return NextResponse.json(
        { error: "Enter a valid prize value." },
        { status: 400 }
      );
    }

    const finalStartsAt =
      startsAt && !Number.isNaN(new Date(startsAt).getTime())
        ? new Date(startsAt).toISOString()
        : null;

    const finalSelectionAt =
      selectionAt &&
      !Number.isNaN(new Date(selectionAt).getTime())
        ? new Date(selectionAt).toISOString()
        : null;

    if (
      finalStartsAt &&
      finalSelectionAt &&
      new Date(finalSelectionAt) <= new Date(finalStartsAt)
    ) {
      return NextResponse.json(
        {
          error:
            "Winner selection time must be after the draw start time.",
        },
        { status: 400 }
      );
    }

    const { data: draw, error } = await supabaseAdmin
      .from("lucky_draws")
      .insert({
        title: cleanTitle,
        prize_type: finalPrizeType,
        prize_amount:
          finalPrizeType === "cash"
            ? finalPrizeAmount
            : finalPrizeValue,
        prize_value: finalPrizeValue,
        prize_description:
          String(prizeDescription || "").trim() || null,
        prize_image:
          String(prizeImage || "").trim() || null,
        prize_media:
          Array.isArray(prizeMedia) ? prizeMedia : [],
        ticket_price: finalTicketPrice,
        status: finalStatus,
        rules: String(rules || "").trim() || null,
        winner_count: finalWinnerCount,
        max_entries: finalMaxEntries,
        duration_days: finalDurationDays,
        ends_at: finalEndsAt,
        starts_at: finalStartsAt,
        selection_at: finalSelectionAt,
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
      draw,
      message: "Lucky Draw created successfully.",
    });
  } catch (error) {
    console.error("CREATE LUCKY DRAW ERROR:", error);

    return NextResponse.json(
      { error: "Could not create Lucky Draw." },
      { status: 500 }
    );
  }
}
