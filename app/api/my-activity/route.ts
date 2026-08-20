import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Activity = {
  id: string;
  source: "skill_game" | "lucky_draw" | "prize_vault";
  title: string;
  subtitle: string;
  outcome: "won" | "lost";
  score: number | null;
  prizeAmount: number;
  createdAt: string;
  claimStatus: string | null;
  href: string | null;
};

function text(value: unknown, fallback = "") {
  return value == null ? fallback : String(value);
}

function numberValue(...values: unknown[]) {
  for (const value of values) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

export async function GET(req: Request) {
  try {
    const token = req.headers
      .get("authorization")
      ?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Please log in to view your activity." },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Invalid user session." },
        { status: 401 }
      );
    }

    const [gameResultsResult, drawsResult, prizePlaysResult] =
      await Promise.all([
        supabaseAdmin
          .from("game_results")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),

        supabaseAdmin
          .from("lucky_draws")
          .select(`
            id,
            title,
            prize_amount,
            prize_type,
            prize_description,
            prize_value,
            draw_at,
            created_at,
            status
          `)
          .eq("status", "completed")
          .order("draw_at", { ascending: false })
          .limit(5000),

        supabaseAdmin
          .from("prize_vault_plays")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5000),
      ]);

    if (gameResultsResult.error) {
      return NextResponse.json(
        { error: gameResultsResult.error.message },
        { status: 500 }
      );
    }

    if (drawsResult.error) {
      return NextResponse.json(
        { error: drawsResult.error.message },
        { status: 500 }
      );
    }

    if (prizePlaysResult.error) {
      return NextResponse.json(
        { error: prizePlaysResult.error.message },
        { status: 500 }
      );
    }

    const draws = drawsResult.data || [];
    const completedDrawIds = draws.map((draw) => draw.id);

    let userTickets: Array<{
      id: string;
      draw_id: string;
      user_id: string;
      ticket_number: string | number;
    }> = [];

    let winners: Array<{
      draw_id: string;
      user_id: string;
      winner_position: number | null;
    }> = [];

    if (completedDrawIds.length > 0) {
      const [ticketsResult, winnersResult] = await Promise.all([
        supabaseAdmin
          .from("lucky_draw_tickets")
          .select("id, draw_id, user_id, ticket_number")
          .eq("user_id", user.id)
          .in("draw_id", completedDrawIds),

        supabaseAdmin
          .from("lucky_draw_winners")
          .select("draw_id, user_id, winner_position")
          .in("draw_id", completedDrawIds),
      ]);

      if (ticketsResult.error) {
        return NextResponse.json(
          { error: ticketsResult.error.message },
          { status: 500 }
        );
      }

      if (winnersResult.error) {
        return NextResponse.json(
          { error: winnersResult.error.message },
          { status: 500 }
        );
      }

      userTickets = ticketsResult.data || [];
      winners = winnersResult.data || [];
    }

    const activities: Activity[] = [];

    // Skill-game wins/losses.
    for (const result of gameResultsResult.data || []) {
      const won = Boolean(result.won);

      activities.push({
        id: `game-${result.id}`,
        source: "skill_game",
        title: text(result.game_slug, "Skill Game").replaceAll("-", " "),
        subtitle: won
          ? "Skill game completed successfully"
          : "Skill game completed",
        outcome: won ? "won" : "lost",
        score: Number.isFinite(Number(result.score))
          ? Number(result.score)
          : null,
        prizeAmount: numberValue(result.prize_amount),
        createdAt: text(result.created_at, new Date().toISOString()),
        claimStatus: null,
        href: null,
      });
    }

    // Lucky Draw wins and losses.
    const winningDrawIds = new Set(
      winners
        .filter((winner) => winner.user_id === user.id)
        .map((winner) => winner.draw_id)
    );

    const participatedDrawIds = new Set(
      userTickets.map((ticket) => ticket.draw_id)
    );

    for (const draw of draws) {
      if (!participatedDrawIds.has(draw.id)) continue;

      const won = winningDrawIds.has(draw.id);

      activities.push({
        id: `draw-${draw.id}`,
        source: "lucky_draw",
        title: text(draw.title, "Lucky Draw"),
        subtitle: won ? "Lucky Draw winner" : "Lucky Draw entry",
        outcome: won ? "won" : "lost",
        score: null,
        prizeAmount: numberValue(draw.prize_value, draw.prize_amount),
        createdAt: text(
          draw.draw_at || draw.created_at,
          new Date().toISOString()
        ),
        claimStatus: null,
        href: won ? `/lucky-draw/claim-prize?drawId=${draw.id}` : null,
      });
    }

    // Prize Vault.
    for (const play of prizePlaysResult.data || []) {
      const result = text(play.result).toLowerCase();

      const won = ["won", "claimed", "fulfilled"].includes(result);
      const lost = ["try_again", "lost", "failed"].includes(result);

      if (!won && !lost) continue;

      const prizeName = text(
        play.prize_name ??
          play.name ??
          play.prize_title ??
          play.title ??
          "Prize Vault"
      );

      const createdAt = text(
        play.created_at ??
          play.played_at ??
          play.updated_at,
        new Date().toISOString()
      );

      activities.push({
        id: `vault-${text(play.id)}`,
        source: "prize_vault",
        title: prizeName,
        subtitle: won ? "Prize Vault win" : "Prize Vault attempt",
        outcome: won ? "won" : "lost",
        score: null,
        prizeAmount: numberValue(
          play.prize_value,
          play.prize_amount,
          play.payout,
          play.amount
        ),
        createdAt,
        claimStatus: play.claim_status
          ? text(play.claim_status)
          : null,
        href: null,
      });
    }

    activities.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      activities,
      wins: activities.filter((item) => item.outcome === "won"),
      losses: activities.filter((item) => item.outcome === "lost"),
    });
  } catch (error) {
    console.error("MY ACTIVITY ERROR:", error);

    return NextResponse.json(
      { error: "Could not load your activity." },
      { status: 500 }
    );
  }
}
