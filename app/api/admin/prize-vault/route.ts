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
