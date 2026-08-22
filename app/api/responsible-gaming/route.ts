import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function getAuthenticatedUser(request: Request) {
  const token = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "");

  if (!token) return null;

  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser(token);

  return user;
}

async function getSettings(userId: string) {
  const { data } = await supabaseAdmin
    .from("responsible_gaming_settings")
    .select(
      "daily_spending_limit, weekly_spending_limit, self_exclusion_until, self_exclusion_permanent"
    )
    .eq("user_id", userId)
    .maybeSingle();

  return data || {
    daily_spending_limit: null,
    weekly_spending_limit: null,
    self_exclusion_until: null,
    self_exclusion_permanent: false,
  };
}

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    const settings = await getSettings(user.id);

    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);

    const startOfWeek = new Date(startOfDay);
    const day = startOfWeek.getUTCDay();
    const diff = day === 0 ? 6 : day - 1;
    startOfWeek.setUTCDate(startOfWeek.getUTCDate() - diff);

    const [{ data: dailyTickets }, { data: weeklyTickets }] =
      await Promise.all([
        supabaseAdmin
          .from("lucky_draw_tickets")
          .select("amount")
          .eq("user_id", user.id)
          .gte("created_at", startOfDay.toISOString()),

        supabaseAdmin
          .from("lucky_draw_tickets")
          .select("amount")
          .eq("user_id", user.id)
          .gte("created_at", startOfWeek.toISOString()),
      ]);

    const dailySpent = (dailyTickets || []).reduce(
      (sum, ticket) => sum + Number(ticket.amount || 0),
      0
    );

    const weeklySpent = (weeklyTickets || []).reduce(
      (sum, ticket) => sum + Number(ticket.amount || 0),
      0
    );

    const exclusionActive =
      Boolean(settings.self_exclusion_permanent) ||
      Boolean(
        settings.self_exclusion_until &&
          new Date(settings.self_exclusion_until).getTime() > Date.now()
      );

    return NextResponse.json({
      settings: {
        ...settings,
        exclusion_active: exclusionActive,
      },
      spending: {
        daily: dailySpent,
        weekly: weeklySpent,
      },
    });
  } catch (error) {
    console.error("RESPONSIBLE GAMING GET ERROR:", error);

    return NextResponse.json(
      { error: "Could not load responsible gaming settings." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const action = body?.action;

    const existing = await getSettings(user.id);

    const existingExclusionActive =
      Boolean(existing.self_exclusion_permanent) ||
      Boolean(
        existing.self_exclusion_until &&
          new Date(existing.self_exclusion_until).getTime() > Date.now()
      );

    if (action === "set_limits") {
      if (existingExclusionActive) {
        return NextResponse.json(
          {
            error:
              "Your account is currently self-excluded. You cannot change gaming limits during an active exclusion.",
          },
          { status: 400 }
        );
      }

      const daily =
        body.daily_spending_limit === "" ||
        body.daily_spending_limit == null
          ? null
          : Number(body.daily_spending_limit);

      const weekly =
        body.weekly_spending_limit === "" ||
        body.weekly_spending_limit == null
          ? null
          : Number(body.weekly_spending_limit);

      if (
        daily !== null &&
        (!Number.isFinite(daily) || daily <= 0)
      ) {
        return NextResponse.json(
          { error: "Daily limit must be greater than zero." },
          { status: 400 }
        );
      }

      if (
        weekly !== null &&
        (!Number.isFinite(weekly) || weekly <= 0)
      ) {
        return NextResponse.json(
          { error: "Weekly limit must be greater than zero." },
          { status: 400 }
        );
      }

      if (
        daily !== null &&
        weekly !== null &&
        weekly < daily
      ) {
        return NextResponse.json(
          {
            error:
              "Weekly limit cannot be lower than the daily limit.",
          },
          { status: 400 }
        );
      }

      const { error } = await supabaseAdmin
        .from("responsible_gaming_settings")
        .upsert(
          {
            user_id: user.id,
            daily_spending_limit: daily,
            weekly_spending_limit: weekly,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: "Responsible gaming limits updated.",
      });
    }

    if (action === "take_break") {
      if (existingExclusionActive) {
        return NextResponse.json(
          {
            error:
              "Your account is already under an active responsible gaming exclusion.",
          },
          { status: 400 }
        );
      }

      const hours = Number(body.hours);

      if (![24, 168, 720].includes(hours)) {
        return NextResponse.json(
          { error: "Invalid break period." },
          { status: 400 }
        );
      }

      const until = new Date(Date.now() + hours * 60 * 60 * 1000);

      const { error } = await supabaseAdmin
        .from("responsible_gaming_settings")
        .upsert(
          {
            user_id: user.id,
            self_exclusion_until: until.toISOString(),
            self_exclusion_permanent: false,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: `Your account is restricted until ${until.toISOString()}.`,
      });
    }

    if (action === "permanent_exclusion") {
      if (existingExclusionActive) {
        return NextResponse.json(
          {
            error:
              "Your account already has an active exclusion.",
          },
          { status: 400 }
        );
      }

      const { error } = await supabaseAdmin
        .from("responsible_gaming_settings")
        .upsert(
          {
            user_id: user.id,
            self_exclusion_until: null,
            self_exclusion_permanent: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message:
          "Permanent self-exclusion has been activated for your account.",
      });
    }

    return NextResponse.json(
      { error: "Invalid responsible gaming action." },
      { status: 400 }
    );
  } catch (error) {
    console.error("RESPONSIBLE GAMING POST ERROR:", error);

    return NextResponse.json(
      { error: "Could not update responsible gaming settings." },
      { status: 500 }
    );
  }
}
