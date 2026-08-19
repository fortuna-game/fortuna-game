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
      drawId,
      title,
      prizeType,
      prizeAmount,
      prizeValue,
      prizeDescription,
      prizeImage,
      ticketPrice,
      status,
    } = await req.json();

    if (!drawId) {
      return NextResponse.json(
        { error: "Lucky Draw ID is required." },
        { status: 400 }
      );
    }

    const { data: existingDraw, error: findError } =
      await supabaseAdmin
        .from("lucky_draws")
        .select("*")
        .eq("id", drawId)
        .maybeSingle();

    if (findError || !existingDraw) {
      return NextResponse.json(
        { error: "Lucky Draw not found." },
        { status: 404 }
      );
    }

    if (existingDraw.status === "completed") {
      return NextResponse.json(
        {
          error:
            "Completed Lucky Draws cannot be edited to protect winner transparency.",
        },
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

    const validStatuses = [
      "open",
      "paused",
      "suspended",
    ];

    const finalPrizeType = validPrizeTypes.includes(prizeType)
      ? prizeType
      : existingDraw.prize_type;

    const finalStatus = validStatuses.includes(status)
      ? status
      : existingDraw.status;

    const finalTicketPrice =
      ticketPrice !== undefined
        ? Number(ticketPrice)
        : Number(existingDraw.ticket_price);

    const finalPrizeAmount =
      prizeAmount !== undefined
        ? Number(prizeAmount)
        : Number(existingDraw.prize_amount);

    const finalPrizeValue =
      prizeValue !== undefined
        ? Number(prizeValue)
        : Number(existingDraw.prize_value || 0);

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

    const updateData = {
      title:
        title?.trim() ||
        existingDraw.title,
      prize_type: finalPrizeType,
      prize_amount:
        finalPrizeType === "cash"
          ? finalPrizeAmount
          : finalPrizeValue,
      prize_value:
        finalPrizeType === "cash"
          ? finalPrizeValue
          : finalPrizeValue,
      prize_description:
        prizeDescription?.trim() || null,
      prize_image:
        prizeImage?.trim() || null,
      ticket_price: finalTicketPrice,
      status: finalStatus,
    };

    const { data: updatedDraw, error: updateError } =
      await supabaseAdmin
        .from("lucky_draws")
        .update(updateData)
        .eq("id", drawId)
        .select("*")
        .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      draw: updatedDraw,
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
