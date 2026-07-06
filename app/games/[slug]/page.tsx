"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type GamePageProps = { params: Promise<{ slug: string }> };

type Game = {
  slug: string;
  name: string;
  entry_fee: number;
  prize_amount: number;
};

type Question = {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
};

export default function GamePage({ params }: GamePageProps) {
  const { slug } = use(params);

  const [game, setGame] = useState<Game | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [message, setMessage] = useState("");
  const [rolling, setRolling] = useState(false);
  const [diceResult, setDiceResult] = useState<number | null>(null);

  useEffect(() => {
    async function loadGame() {
      const { data: gameData } = await supabase
        .from("games")
        .select("slug, name, entry_fee, prize_amount")
        .eq("slug", slug)
        .maybeSingle();

      setGame(gameData);

      if (slug === "trivia") {
        const { data } = await supabase
          .from("trivia_questions")
          .select("*")
          .limit(5);

        setQuestions(data || []);
      }
    }

    void loadGame();
  }, [slug]);

  async function startGame() {
    if (!game) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login first.");
      return;
    }

    const { data: wallet } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();

    const balance = Number(wallet?.balance || 0);

    if (balance < Number(game.entry_fee)) {
      setMessage("Insufficient balance. Please deposit funds.");
      return;
    }

    await supabase
      .from("wallets")
      .update({ balance: balance - Number(game.entry_fee) })
      .eq("user_id", user.id);

    await supabase.from("wallet_transactions").insert({
      user_id: user.id,
      type: "game_entry",
      amount: Number(game.entry_fee),
      status: "completed",
      reference: game.slug,
    });

    await supabase.from("game_sessions").insert({
      user_id: user.id,
      game_slug: game.slug,
      entry_fee: Number(game.entry_fee),
      status: "started",
    });

    setStarted(true);
    setMessage("");
  }


  async function playDiceRoll() {
    if (!game || rolling) return;

    setMessage("");
    setDiceResult(null);
    setRolling(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login first.");
      return;
    }

    const { data: wallet } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();

    const balance = Number(wallet?.balance || 0);

    if (balance < Number(game.entry_fee)) {
      setMessage("Insufficient balance. Please deposit funds.");
      return;
    }

    await supabase
      .from("wallets")
      .update({ balance: balance - Number(game.entry_fee) })
      .eq("user_id", user.id);

    await supabase.from("wallet_transactions").insert({
      user_id: user.id,
      type: "game_entry",
      amount: Number(game.entry_fee),
      status: "completed",
      reference: game.slug,
    });

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const dice = Math.floor(Math.random() * 6) + 1;
    const won = dice === 6;

    setDiceResult(dice);

    if (won) {
      const { data: latestWallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle();

      await supabase
        .from("wallets")
        .update({
          balance: Number(latestWallet?.balance || 0) + Number(game.prize_amount),
        })
        .eq("user_id", user.id);

      await supabase.from("wallet_transactions").insert({
        user_id: user.id,
        type: "game_win",
        amount: Number(game.prize_amount),
        status: "completed",
        reference: game.slug,
      });
    }

    await supabase.from("game_results").insert({
      user_id: user.id,
      game_slug: game.slug,
      score: dice,
      prize_amount: won ? Number(game.prize_amount) : 0,
      won,
    });

    setMessage(
      won
        ? `You rolled ${dice}. You won ₵${Number(game.prize_amount).toFixed(2)}!`
        : `You rolled ${dice}. You did not win this round. Roll 6 to win.`
    );

    setRolling(false);
  }

  async function answer(selected: string) {
    if (!game) return;

    const q = questions[current];

    if (selected === q.correct_answer) {
      setScore((s) => s + 1);
    }

    if (current + 1 < questions.length) {
      setCurrent((c) => c + 1);
      return;
    }

    const finalScore = selected === q.correct_answer ? score + 1 : score;
    const won = finalScore >= 4;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      if (won) {
        const { data: wallet } = await supabase
          .from("wallets")
          .select("balance")
          .eq("user_id", user.id)
          .maybeSingle();

        const newBalance = Number(wallet?.balance || 0) + Number(game.prize_amount);

        await supabase
          .from("wallets")
          .update({ balance: newBalance })
          .eq("user_id", user.id);

        await supabase.from("wallet_transactions").insert({
          user_id: user.id,
          type: "game_win",
          amount: Number(game.prize_amount),
          status: "completed",
          reference: game.slug,
        });
      }

      await supabase.from("game_results").insert({
        user_id: user.id,
        game_slug: game.slug,
        score: finalScore,
        prize_amount: won ? Number(game.prize_amount) : 0,
        won,
      });
    }

    setScore(finalScore);
    setFinished(true);
  }

  if (!game) {
    return <main className="flex min-h-screen items-center justify-center bg-black text-white">Loading...</main>;
  }

  if (slug === "dice-roll") {
    return (
      <main className="min-h-screen bg-black px-6 py-12 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-yellow-400/20 bg-white/5 p-8 text-center">
          <div
            className={`text-8xl transition-transform ${
              rolling ? "animate-spin" : ""
            }`}
          >
            🎲
          </div>

          {diceResult !== null && !rolling && (
            <p className="mt-3 text-3xl font-black text-yellow-400">
              {diceResult}
            </p>
          )}
          <h1 className="mt-4 text-5xl font-black text-yellow-400">{game.name}</h1>
          <p className="mt-4 text-white/60">Entry Fee: ₵{Number(game.entry_fee).toFixed(2)}</p>
          <p className="mt-2 text-green-400">Prize: ₵{Number(game.prize_amount).toFixed(2)}</p>
          <p className="mt-6 text-white/60">Roll a 6 to win the prize.</p>

          <button
            disabled={rolling}
            onClick={() => void playDiceRoll()}
            className="mt-8 rounded-full bg-yellow-400 px-10 py-4 font-black text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {rolling ? "Rolling..." : "Roll Dice"}
          </button>

          {message && (
            <p className="mt-6 whitespace-pre-line rounded-xl bg-white/10 p-4 text-white">
              {message}
            </p>
          )}

          <Link href="/games" className="mt-8 inline-block rounded-full border border-white/10 px-8 py-4 font-bold">
            Back to Games
          </Link>
        </div>
      </main>
    );
  }

  if (slug !== "trivia") {
    return (
      <main className="min-h-screen bg-black px-6 py-12 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-yellow-400/20 bg-white/5 p-8 text-center">
          <h1 className="text-5xl font-black text-yellow-400">{game.name}</h1>
          <p className="mt-4 text-white/60">Entry Fee: ₵{Number(game.entry_fee).toFixed(2)}</p>
          <p className="mt-2 text-green-400">Prize: ₵{Number(game.prize_amount).toFixed(2)}</p>
          <p className="mt-10 text-white/60">This game will be available soon.</p>
          <Link href="/games" className="mt-8 inline-block rounded-full bg-yellow-400 px-8 py-4 font-black text-black">Back to Games</Link>
        </div>
      </main>
    );
  }

  const q = questions[current];

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl rounded-3xl border border-yellow-400/20 bg-white/5 p-8 text-center">
        <h1 className="text-5xl font-black text-yellow-400">Trivia Challenge</h1>
        <p className="mt-4 text-white/60">Entry Fee: ₵{Number(game.entry_fee).toFixed(2)}</p>
        <p className="mt-2 text-green-400">Prize: ₵{Number(game.prize_amount).toFixed(2)}</p>

        {message && <p className="mt-6 rounded-xl bg-red-500/10 p-3 text-red-300">{message}</p>}

        {!started && !finished && (
          <button onClick={() => void startGame()} className="mt-10 rounded-full bg-yellow-400 px-10 py-4 font-black text-black">
            Start Game
          </button>
        )}

        {started && !finished && q && (
          <div className="mt-10 text-left">
            <p className="text-sm text-white/50">Question {current + 1} of {questions.length}</p>
            <h2 className="mt-3 text-2xl font-bold">{q.question}</h2>

            <div className="mt-6 grid gap-4">
              {[
                ["A", q.option_a],
                ["B", q.option_b],
                ["C", q.option_c],
                ["D", q.option_d],
              ].map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => void answer(key)}
                  className="rounded-2xl border border-white/10 bg-black/60 p-4 text-left hover:border-yellow-400"
                >
                  {key}. {value}
                </button>
              ))}
            </div>
          </div>
        )}

        {finished && (
          <div className="mt-10">
            <h2 className="text-3xl font-black">Game Finished</h2>
            <p className="mt-3 text-xl">Score: {score}/{questions.length}</p>
            <p className={score >= 4 ? "mt-3 text-green-400" : "mt-3 text-red-300"}>
              {score >= 4 ? `You won ₵${Number(game.prize_amount).toFixed(2)}!` : "You did not win this round."}
            </p>
            <Link href="/games" className="mt-8 inline-block rounded-full bg-yellow-400 px-8 py-4 font-black text-black">
              Back to Games
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
