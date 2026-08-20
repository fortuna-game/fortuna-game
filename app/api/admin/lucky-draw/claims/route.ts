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

export async function GET(req: Request) {
  try {
    const isAdmin = await requireAdmin(req);

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access denied." },
        { status: 403 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("lucky_draw_prize_claims")
      .select(`
        id,
        draw_id,
        winner_user_id,
        full_name,
        location,
        city,
        region,
        phone_number,
        alternate_phone_number,
        email,
        status,
        created_at,
        updated_at,
        lucky_draws (
          title,
          prize_type,
          prize_amount,
          prize_value,
          prize_description,
          prize_image
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      claims: data || [],
    });
  } catch (error) {
    console.error("LOAD PRIZE CLAIMS ERROR:", error);

    return NextResponse.json(
      { error: "Could not load prize claims." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const isAdmin = await requireAdmin(req);

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access denied." },
        { status: 403 }
      );
    }

    const { claimId, status } = await req.json();

    const allowedStatuses = [
      "pending",
      "contacted",
      "processing",
      "delivered",
      "collected",
      "cancelled",
    ];

    if (!claimId) {
      return NextResponse.json(
        { error: "Claim ID is required." },
        { status: 400 }
      );
    }

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid prize claim status." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("lucky_draw_prize_claims")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", claimId)
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
      claim: data,
      message: "Prize claim updated successfully.",
    });
  } catch (error) {
    console.error("UPDATE PRIZE CLAIM ERROR:", error);

    return NextResponse.json(
      { error: "Could not update prize claim." },
      { status: 500 }
    );
  }
}
