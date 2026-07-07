import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Move = "up" | "down" | "left" | "right";

export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  const { data: { user } } = await supabaseAdmin.auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Invalid session." }, { status: 401 });

  const { sessionId, moves } = await req.json();

  const { data: session } = await supabaseAdmin
    .from("skill_game_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .eq("game_slug", "maze-escape")
    .maybeSingle();

  if (!session) return NextResponse.json({ error: "Session not found." }, { status: 404 });
  if (session.status !== "started") return NextResponse.json({ error: "Game already completed." }, { status: 400 });

  const maze = session.answers;
  const submittedMoves = Array.isArray(moves) ? moves as Move[] : [];
  const walls = new Set<string>(maze.walls || []);

  let x = Number(maze.start?.x || 0);
  let y = Number(maze.start?.y || 0);
  const size = Number(maze.size || 5);
  const maxMoves = Number(maze.maxMoves || 12);

  for (const move of submittedMoves.slice(0, maxMoves)) {
    let nx = x;
    let ny = y;

    if (move === "up") ny -= 1;
    if (move === "down") ny += 1;
    if (move === "left") nx -= 1;
    if (move === "right") nx += 1;

    if (nx < 0 || ny < 0 || nx >= size || ny >= size || walls.has(`${nx}-${ny}`)) {
      continue;
    }

    x = nx;
    y = ny;
  }

  const won =
    x === Number(maze.exit?.x) &&
    y === Number(maze.exit?.y) &&
    submittedMoves.length <= maxMoves;

  const { data: settlement, error } = await supabaseAdmin.rpc("settle_skill_game_atomic", {
    p_session_id: session.id,
    p_user_id: user.id,
    p_score: won ? 1 : 0,
    p_won: won,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const settled = Array.isArray(settlement) ? settlement[0] : null;

  return NextResponse.json({
    score: won ? 1 : 0,
    total: 1,
    won,
    payout: Number(settled?.payout || 0),
  });
}
