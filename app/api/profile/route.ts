import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function PATCH(request: Request) {
  try {
    const token = request.headers
      .get("authorization")
      ?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return NextResponse.json(
        { error: "Please log in." },
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

    const body = await request.json();

    const firstName = String(body.first_name || "").trim();
    const lastName = String(body.last_name || "").trim();
    const username = String(body.username || "").trim().toLowerCase();
    const phone = String(body.phone || "").trim();

    if (!firstName || !lastName || !username || !phone) {
      return NextResponse.json(
        {
          error:
            "First name, last name, username and phone number are required.",
        },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9_.-]{3,30}$/.test(username)) {
      return NextResponse.json(
        {
          error:
            "Username must be 3-30 characters and use only letters, numbers, dots, underscores or hyphens.",
        },
        { status: 400 }
      );
    }

    const { data: existingUsername } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .eq("username", username)
      .neq("user_id", user.id)
      .maybeSingle();

    if (existingUsername) {
      return NextResponse.json(
        { error: "That username is already in use." },
        { status: 400 }
      );
    }

    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .update({
        first_name: firstName,
        last_name: lastName,
        username,
        phone,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .select(
        "first_name, last_name, username, phone, is_verified"
      )
      .single();

    if (error) {
      console.error("PROFILE UPDATE ERROR:", error);

      return NextResponse.json(
        { error: "Could not update your profile." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("PROFILE PATCH ERROR:", error);

    return NextResponse.json(
      { error: "Could not update your profile." },
      { status: 500 }
    );
  }
}
