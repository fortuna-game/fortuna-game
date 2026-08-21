import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function requireAdmin(req: Request) {
  const token = req.headers
    .get("authorization")
    ?.replace("Bearer ", "");

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
      id,
      title,
      prizeType,
      prizeAmount,
      prizeValue,
      prizeDescription,
      prizeImage,
      prizeMedia,
      rules,
      winnerCount,
      maxEntries,
      startsAt,
      selectionAt,
    } = await req.json();

    const drawId = String(id || "").trim();
    const cleanTitle = String(title || "").trim();
    const finalPrizeType = String(prizeType || "").trim();
    const finalWinnerCount = Number(winnerCount);
    const finalMaxEntries =
      maxEntries == null || String(maxEntries).trim() === ""
        ? null
        : Number(maxEntries);

    if (
      finalMaxEntries !== null &&
      (!Number.isInteger(finalMaxEntries) ||
        finalMaxEntries < 1)
    ) {
      return NextResponse.json(
        { error: "Maximum Entries must be a whole number greater than 0." },
        { status: 400 }
      );
    }

    if (!drawId) {
      return NextResponse.json(
        { error: "Lucky Draw ID is required." },
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
      !Number.isInteger(finalWinnerCount) ||
      finalWinnerCount < 1
    ) {
      return NextResponse.json(
        { error: "Number of winners must be at least 1." },
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

    if (!finalStartsAt || !finalSelectionAt) {
      return NextResponse.json(
        {
          error:
            "Draw start time and winner selection time are required.",
        },
        { status: 400 }
      );
    }

    if (
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

    const finalPrizeAmount = Number(prizeAmount || 0);
    const finalPrizeValue = Number(prizeValue || 0);

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

    const { data: existingDraw, error: existingError } =
      await supabaseAdmin
        .from("lucky_draws")
        .select(
          "id, status, winner_count, selection_started_at"
        )
        .eq("id", drawId)
        .maybeSingle();

    if (existingError || !existingDraw) {
      return NextResponse.json(
        { error: "Lucky Draw not found." },
        { status: 404 }
      );
    }

    if (
      existingDraw.selection_started_at ||
      existingDraw.status === "completed"
    ) {
      return NextResponse.json(
        {
          error:
            "This Lucky Draw can no longer be edited because winner selection has started or the draw is completed.",
        },
        { status: 400 }
      );
    }

    const { data: draw, error } = await supabaseAdmin
      .from("lucky_draws")
      .update({
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
        rules: String(rules || "").trim() || null,
        winner_count: finalWinnerCount,
        max_entries: finalMaxEntries,
        starts_at: finalStartsAt,
        selection_at: finalSelectionAt,
      })
      .eq("id", drawId)
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
      message: "Lucky Draw updated successfully.",
    });
  } catch (error) {
    console.error("EDIT LUCKY DRAW ERROR:", error);

    return NextResponse.json(
      { error: "Could not update Lucky Draw." },
      { status: 500 }
    );
  }
}
