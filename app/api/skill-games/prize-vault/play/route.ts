import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const token = req.headers
      .get("authorization")
      ?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Please log in to play." },
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

    const { vaultNumber } = await req.json();
    const number = Number(vaultNumber);

    if (!Number.isInteger(number) || number < 1 || number > 12) {
      return NextResponse.json(
        { error: "Please select a valid vault." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin.rpc(
      "play_prize_vault_atomic",
      {
        p_user_id: user.id,
        p_vault_number: number,
      }
    );

    if (error) {
      console.error("PRIZE VAULT RPC ERROR:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("PRIZE VAULT PLAY ERROR:", error);

    return NextResponse.json(
      { error: "Could not play Prize Vault." },
      { status: 500 }
    );
  }
}
