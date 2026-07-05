"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Game = {
  slug: string;
  name: string;
  entry_fee: number;
  prize_amount: number;
};

const icons: Record<string, string> = {
  "spin-wheel": "🎡",
  "spin-bottle": "🍾",
  "dice-roll": "🎲",
  "treasure-boxes": "📦",
  "treasure-vault": "💰",
  "treasure-hunt": "🏴‍☠️",
  trivia: "🧠",
  "word-search": "🔤",
  "word-builder": "📝",
  "target-challenge": "🎯",
  "bike-racing": "🚴",
  "lucky-draw": "🎁",
  "number-draw": "🔢",
};

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    async function loadGames() {
      const { data } = await supabase
        .from("games")
        .select("slug, name, entry_fee, prize_amount")
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      setGames(data || []);
    }

    void loadGames();
  }, []);

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-5xl font-black text-yellow-400">Games</h1>
        <p className="mt-2 text-white/60">Choose a game and start playing.</p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {games.map((game) => (
            <div
              key={game.slug}
              className="rounded-3xl border border-yellow-400/20 bg-gradient-to-br from-yellow-500/10 to-black p-6 transition hover:scale-105 hover:border-yellow-400"
            >
              <div className="text-6xl">{icons[game.slug] || "🎮"}</div>

              <h2 className="mt-5 text-xl font-bold">{game.name}</h2>

              <p className="mt-2 text-sm text-white/60">
                Entry: ₵{Number(game.entry_fee).toFixed(2)}
              </p>

              <p className="mt-1 text-sm text-green-400">
                Prize: ₵{Number(game.prize_amount).toFixed(2)}
              </p>

              <Link
                href={`/games/${game.slug}`}
                className="mt-6 block w-full rounded-xl bg-yellow-400 py-3 text-center font-bold text-black"
              >
                Play Now
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
