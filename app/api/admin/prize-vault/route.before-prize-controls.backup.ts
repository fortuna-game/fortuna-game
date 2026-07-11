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
    const ok = await requireAdmin(req);

    if (!ok) {
      return NextResponse.json(
        { error: "Admin access denied." },
        { status: 403 }
      );
    }

    const [prizesResult, playsResult] = await Promise.all([
      supabaseAdmin
        .from("prize_vault_prizes")
        .select("*")
        .order("created_at", { ascending: true }),

      supabaseAdmin
        .from("prize_vault_plays")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

    if (prizesResult.error) {
      return NextResponse.json(
        { error: prizesResult.error.message },
        { status: 500 }
      );
    }

    if (playsResult.error) {
      return NextResponse.json(
        { error: playsResult.error.message },
        { status: 500 }
      );
    }

    const prizes = prizesResult.data || [];
    const plays = playsResult.data || [];

    const userIds = [
      ...new Set(
        plays
          .map((play: any) => play.user_id)
          .filter(Boolean)
      ),
    ];

    const { data: profiles } = userIds.length
      ? await supabaseAdmin
          .from("profiles")
          .select("user_id, username, phone")
          .in("user_id", userIds)
      : { data: [] as any[] };

    const profileMap: Record<
      string,
      { username: string; phone: string }
    > = {};

    for (const profile of profiles || []) {
      profileMap[profile.user_id] = {
        username: profile.username || "Player",
        phone: profile.phone || "",
      };
    }

    const totalRevenue = plays.reduce(
      (total: number, play: any) =>
        total + Number(play.entry_fee || 0),
      0
    );

    const winners = plays.filter((play: any) =>
      ["won", "claimed", "fulfilled"].includes(
        String(play.result).toLowerCase()
      )
    );

    const tryAgainCount = plays.filter(
      (play: any) =>
        String(play.result).toLowerCase() === "try_again"
    ).length;

    const pendingFulfilment = plays.filter((play: any) =>
      ["won", "claimed"].includes(
        String(play.result).toLowerCase()
      )
    );

    return NextResponse.json({
      totals: {
        totalPlays: plays.length,
        totalRevenue,
        totalWinners: winners.length,
        tryAgainCount,
        pendingFulfilmentCount: pendingFulfilment.length,
        totalPrizeValueWon: winners.reduce(
          (total: number, play: any) =>
            total + Number(play.prize_value || 0),
          0
        ),
      },
      prizes,
      plays: plays.map((play: any) => ({
        ...play,
        username:
          profileMap[play.user_id]?.username || "Player",
        phone: profileMap[play.user_id]?.phone || "",
      })),
    });
  } catch (error) {
    console.error("ADMIN PRIZE VAULT ERROR:", error);

    return NextResponse.json(
      { error: "Could not load Prize Vault admin data." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const ok = await requireAdmin(req);

    if (!ok) {
      return NextResponse.json(
        { error: "Admin access denied." },
        { status: 403 }
      );
    }

    const body = await req.json();

    const playId = String(body.playId || "").trim();
    const action = String(body.action || "").trim();
    const adminNote = String(body.adminNote || "").trim();

    if (!playId) {
      return NextResponse.json(
        { error: "Prize claim ID is required." },
        { status: 400 }
      );
    }

    const { data: play, error: playError } = await supabaseAdmin
      .from("prize_vault_plays")
      .select("*")
      .eq("id", playId)
      .maybeSingle();

    if (playError) {
      return NextResponse.json(
        { error: playError.message },
        { status: 500 }
      );
    }

    if (!play) {
      return NextResponse.json(
        { error: "Prize claim not found." },
        { status: 404 }
      );
    }

    if (play.fulfillment_type === "wallet") {
      return NextResponse.json(
        { error: "Cash prizes are fulfilled automatically." },
        { status: 400 }
      );
    }

    if (action === "processing") {
      if (!["submitted", "processing"].includes(String(play.claim_status))) {
        return NextResponse.json(
          { error: "Only submitted claims can be processed." },
          { status: 400 }
        );
      }

      const { error } = await supabaseAdmin
        .from("prize_vault_plays")
        .update({
          claim_status: "processing",
          admin_note: adminNote || null,
        })
        .eq("id", playId);

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Prize claim marked as processing.",
      });
    }

    if (action === "fulfilled") {
      if (
        !["submitted", "processing"].includes(
          String(play.claim_status)
        )
      ) {
        return NextResponse.json(
          { error: "This claim cannot be marked fulfilled." },
          { status: 400 }
        );
      }

      const { error } = await supabaseAdmin
        .from("prize_vault_plays")
        .update({
          result: "fulfilled",
          claim_status: "fulfilled",
          admin_note: adminNote || null,
          fulfilled_at: new Date().toISOString(),
        })
        .eq("id", playId);

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Prize marked as fulfilled successfully.",
      });
    }

    return NextResponse.json(
      { error: "Invalid Prize Vault action." },
      { status: 400 }
    );
  } catch (error) {
    console.error("ADMIN PRIZE VAULT PATCH ERROR:", error);

    return NextResponse.json(
      { error: "Could not update Prize Vault claim." },
      { status: 500 }
    );
  }
}
