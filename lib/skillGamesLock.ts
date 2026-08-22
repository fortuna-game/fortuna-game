import { NextResponse } from "next/server";

export function skillGamesLockedResponse() {
  return NextResponse.json(
    {
      error:
        "This game is currently under development. Please check back soon.",
      code: "SKILL_GAME_LOCKED",
    },
    { status: 403 }
  );
}
