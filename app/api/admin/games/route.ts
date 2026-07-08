import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function requireAdmin(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) return null;

  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser(token);

  if (!user) return null;

  const { data: adminRole } = await supabaseAdmin
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (
    !adminRole ||
    !["super_admin", "admin"].includes(adminRole.role)
  ) {
    return null;
  }

  return user;
}

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin(req);

    if (!admin) {
      return NextResponse.json(
        { error: "Admin access denied." },
        { status: 403 }
      );
    }

    const [sessions, profiles] = await Promise.all([
      supabaseAdmin
        .from("skill_game_sessions")
        .select("*")
        .order("created_at", { ascending: false }),

      supabaseAdmin
        .from("profiles")
        .select("user_id, username, first_name, phone"),
    ]);

    if (sessions.error) {
      return NextResponse.json(
        { error: sessions.error.message },
        { status: 500 }
      );
    }

    const profileMap = new Map(
      (profiles.data || []).map((profile: any) => [
        profile.user_id,
        profile,
      ])
    );

    const games = (sessions.data || []).map((session: any) => {
      const profile: any = profileMap.get(session.user_id);

      const stake = Number(session.stake || 0);

      const payout =
        session.result === "won"
          ? Number(session.payout || 0)
          : 0;

      return {
        id: session.id,
        user_id: session.user_id,
        username: profile?.username || "Player",
        first_name: profile?.first_name || "",
        phone: profile?.phone || "",
        game_slug: session.game_slug,
        stake,
        payout,
        score: Number(session.score || 0),
        result: session.result || "pending",
        status: session.status || "unknown",
        profit: stake - payout,
        created_at: session.created_at,
      };
    });

    const completedGames = games.filter(
      (game) => game.result === "won" || game.result === "lost"
    );

    const totalStakes = completedGames.reduce(
      (sum, game) => sum + game.stake,
      0
    );

    const totalPayouts = completedGames.reduce(
      (sum, game) => sum + game.payout,
      0
    );

    const totalProfit = totalStakes - totalPayouts;

    return NextResponse.json({
      games,
      summary: {
        totalGames: games.length,
        completedGames: completedGames.length,
        wins: completedGames.filter((game) => game.result === "won").length,
        losses: completedGames.filter((game) => game.result === "lost").length,
        totalStakes,
        totalPayouts,
        totalProfit,
      },
    });
  } catch (error) {
    console.error("ADMIN GAMES ERROR:", error);

    return NextResponse.json(
      { error: "Could not load games." },
      { status: 500 }
    );
  }
}
