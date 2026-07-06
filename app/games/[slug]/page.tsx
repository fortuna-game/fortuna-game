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
  const [chosenDice, setChosenDice] = useState<number | null>(null);
  const [diceRoundFinished, setDiceRoundFinished] = useState(false);
  const [luckyPick, setLuckyPick] = useState<number | null>(null);
  const [luckyResult, setLuckyResult] = useState<number | null>(null);
  const [drawingLucky, setDrawingLucky] = useState(false);
  const [numberPick, setNumberPick] = useState<number | null>(null);
  const [numberResult, setNumberResult] = useState<number | null>(null);
  const [drawingNumber, setDrawingNumber] = useState(false);
  const [scratchStarted, setScratchStarted] = useState(false);
  const [scratchFinished, setScratchFinished] = useState(false);
  const [scratchPrize, setScratchPrize] = useState(0);
  const [scratchPercent, setScratchPercent] = useState(0);
  const [scratching, setScratching] = useState(false);
  const [spinningWheel, setSpinningWheel] = useState(false);
  const [wheelResult, setWheelResult] = useState("");
  const [wheelDone, setWheelDone] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [freeSpin, setFreeSpin] = useState(false);

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






  async function playSpinWheel() {
    if (!game || spinningWheel || wheelDone) return;

    setMessage("");
    setWheelResult("");
    setSpinningWheel(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login first.");
      setSpinningWheel(false);
      return;
    }

    if (!freeSpin) {
      const { data: wallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle();

      const balance = Number(wallet?.balance || 0);

      if (balance < Number(game.entry_fee)) {
        setMessage("Insufficient balance. Please deposit funds.");
        setSpinningWheel(false);
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
    }

    let wheelAudioContext: AudioContext | null = null;
    let wheelSoundTimer: ReturnType<typeof setInterval> | null = null;

    try {
      wheelAudioContext = new AudioContext();

      wheelSoundTimer = setInterval(() => {
        if (!wheelAudioContext) return;

        const oscillator = wheelAudioContext.createOscillator();
        const gain = wheelAudioContext.createGain();

        oscillator.connect(gain);
        gain.connect(wheelAudioContext.destination);

        oscillator.type = "square";
        oscillator.frequency.value = 180 + Math.random() * 100;
        gain.gain.value = 0.025;

        oscillator.start();
        oscillator.stop(wheelAudioContext.currentTime + 0.04);
      }, 90);
    } catch {}

    setWheelRotation((current) => current + 9000 + Math.floor(Math.random() * 720));

    await new Promise((resolve) => setTimeout(resolve, 15000));

    if (wheelSoundTimer) clearInterval(wheelSoundTimer);

    if (wheelAudioContext) {
      await wheelAudioContext.close();
    }

    const outcomes = ["GH₵200", "TRY AGAIN", "GH₵2 Airtime", "FREE SPIN", "LOST", "TRY AGAIN"];
    const result = outcomes[Math.floor(Math.random() * outcomes.length)];
    const won = result === "GH₵200" || result === "GH₵2 Airtime";
    const prizeValue = result === "GH₵200" ? 200 : result === "GH₵2 Airtime" ? 2 : 0;

    setWheelResult(result);
    setFreeSpin(result === "FREE SPIN");

    if (won) {
      const { data: latestWallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle();

      await supabase
        .from("wallets")
        .update({
          balance: Number(latestWallet?.balance || 0) + prizeValue,
        })
        .eq("user_id", user.id);

      await supabase.from("wallet_transactions").insert({
        user_id: user.id,
        type: "game_win",
        amount: prizeValue,
        status: "completed",
        reference: game.slug,
      });
    }

    await supabase.from("game_results").insert({
      user_id: user.id,
      game_slug: game.slug,
      score: won ? 1 : 0,
      prize_amount: won ? prizeValue : 0,
      won,
    });

    setMessage(
      won
        ? `🏆 Congratulations! You won ${result}.`
        : result === "FREE SPIN"
        ? "🎡 You won a Free Spin! Spin again without wallet deduction."
        : `The wheel landed on ${result}. Try again.`
    );

    setSpinningWheel(false);
    setWheelDone(result !== "FREE SPIN");
  }

  async function startScratchGame() {
    if (!game || scratchStarted) return;

    setMessage("");

    const { data: { user } } = await supabase.auth.getUser();

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

    const won = Math.random() < 0.2;
    const prize = won ? Number(game.prize_amount) : 0;

    setScratchPrize(prize);
    setScratchPercent(0);
    setScratchFinished(false);
    setScratchStarted(true);
  }

  async function finishScratchGame() {
    if (!game || scratchFinished) return;

    setScratchFinished(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const won = scratchPrize > 0;

    if (won) {
      const { data: wallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle();

      await supabase
        .from("wallets")
        .update({
          balance: Number(wallet?.balance || 0) + scratchPrize,
        })
        .eq("user_id", user.id);

      await supabase.from("wallet_transactions").insert({
        user_id: user.id,
        type: "game_win",
        amount: scratchPrize,
        status: "completed",
        reference: game.slug,
      });
    }

    await supabase.from("game_results").insert({
      user_id: user.id,
      game_slug: game.slug,
      score: won ? 1 : 0,
      prize_amount: won ? scratchPrize : 0,
      won,
    });

    setMessage(
      won
        ? `Congratulations! You won ₵${scratchPrize.toFixed(2)}!`
        : "No prize this time. Try again."
    );
  }

  function handleScratch() {
    if (!scratchStarted || scratchFinished) return;

    setScratching(true);
    setScratchPercent((current) => {
      const next = Math.min(current + 1, 99);

      if (next >= 99) {
        setTimeout(() => void finishScratchGame(), 100);
      }

      return next;
    });

    setTimeout(() => setScratching(false), 100);
  }

  async function playNumberDraw() {
    if (!game || drawingNumber || !numberPick) return;

    setDrawingNumber(true);
    setNumberResult(null);
    setMessage("");

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login first.");
      setDrawingNumber(false);
      return;
    }

    const { data: wallet } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();

    const balance = Number(wallet?.balance || 0);

    if (balance < Number(game.entry_fee)) {
      setMessage("Insufficient balance.");
      setDrawingNumber(false);
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

    await new Promise((resolve) => setTimeout(resolve, 5000));

    const result = Math.floor(Math.random() * 20) + 1;
    const won = result === numberPick;

    setNumberResult(result);

    if (won) {
      const { data: latestWallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle();

      await supabase
        .from("wallets")
        .update({
          balance:
            Number(latestWallet?.balance || 0) +
            Number(game.prize_amount),
        })
        .eq("user_id", user.id);

      await supabase.from("wallet_transactions").insert({
        user_id: user.id,
        type: "game_win",
        amount: prizeValue,
        status: "completed",
        reference: game.slug,
      });
    }

    await supabase.from("game_results").insert({
      user_id: user.id,
      game_slug: game.slug,
      score: result,
      prize_amount: won ? prizeValue : 0,
      won,
    });

    setMessage(
      won
        ? `Winning number ${result}! You won ₵${Number(game.prize_amount).toFixed(2)}!`
        : `Winning number was ${result}. You selected ${numberPick}.`
    );

    setDrawingNumber(false);
    setNumberPick(null);
  }



  async function playLuckyDraw() {
    if (!game || drawingLucky) return;

    if (!luckyPick) {
      setMessage("Choose a lucky number first.");
      return;
    }

    setMessage("");
    setLuckyResult(null);
    setDrawingLucky(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login first.");
      setDrawingLucky(false);
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
      setDrawingLucky(false);
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

    let drawAudioContext: AudioContext | null = null;
    let drawSoundTimer: ReturnType<typeof setInterval> | null = null;

    try {
      drawAudioContext = new AudioContext();

      drawSoundTimer = setInterval(() => {
        if (!drawAudioContext) return;

        const oscillator = drawAudioContext.createOscillator();
        const gain = drawAudioContext.createGain();

        oscillator.connect(gain);
        gain.connect(drawAudioContext.destination);

        oscillator.type = "sine";
        oscillator.frequency.value = 100 + Math.random() * 180;
        gain.gain.value = 0.035;

        oscillator.start();
        oscillator.stop(drawAudioContext.currentTime + 0.07);
      }, 100);
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, 8000));

    if (drawSoundTimer) clearInterval(drawSoundTimer);

    if (drawAudioContext) {
      await drawAudioContext.close();
    }

    const result = Math.floor(Math.random() * 10) + 1;
    const won = result === luckyPick;

    setLuckyResult(result);

    if (won) {
      const { data: latestWallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle();

      await supabase
        .from("wallets")
        .update({
          balance: Number(latestWallet?.balance || 0) + prizeValue,
        })
        .eq("user_id", user.id);

      await supabase.from("wallet_transactions").insert({
        user_id: user.id,
        type: "game_win",
        amount: prizeValue,
        status: "completed",
        reference: game.slug,
      });
    }

    await supabase.from("game_results").insert({
      user_id: user.id,
      game_slug: game.slug,
      score: result,
      prize_amount: won ? prizeValue : 0,
      won,
    });

    setMessage(
      won
        ? `You picked ${luckyPick}. Draw result was ${result}. You won ₵${Number(game.prize_amount).toFixed(2)}!`
        : `You picked ${luckyPick}. Draw result was ${result}. You did not win this round.`
    );

    setDrawingLucky(false);
    setLuckyPick(null);
  }

  async function playDiceRoll() {
    if (!game || rolling) return;

    if (!chosenDice) {
      setMessage("Please choose the dice side you want to roll first.");
      return;
    }

    setMessage("");
    setDiceResult(null);
    setRolling(true);

    let audioContext: AudioContext | null = null;
    let soundTimer: ReturnType<typeof setInterval> | null = null;

    try {
      audioContext = new AudioContext();

      soundTimer = setInterval(() => {
        if (!audioContext) return;

        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.frequency.value = 140 + Math.random() * 180;
        gain.gain.value = 0.06;

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.08);
      }, 120);
    } catch {}

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

    await new Promise((resolve) => setTimeout(resolve, 6000));

    if (soundTimer) clearInterval(soundTimer);

    if (audioContext) {
      await audioContext.close();
    }

    const dice = Math.floor(Math.random() * 6) + 1;
    const won = dice === chosenDice;

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
          balance: Number(latestWallet?.balance || 0) + prizeValue,
        })
        .eq("user_id", user.id);

      await supabase.from("wallet_transactions").insert({
        user_id: user.id,
        type: "game_win",
        amount: prizeValue,
        status: "completed",
        reference: game.slug,
      });
    }

    await supabase.from("game_results").insert({
      user_id: user.id,
      game_slug: game.slug,
      score: dice,
      prize_amount: won ? prizeValue : 0,
      won,
    });

    setMessage(
      won
        ? `You chose ${chosenDice} and rolled ${dice}. You won ₵${Number(game.prize_amount).toFixed(2)}!`
        : `You chose ${chosenDice} but rolled ${dice}. You did not win this round.`
    );

    setRolling(false);
    setDiceRoundFinished(true);
    setChosenDice(null);
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
          amount: prizeValue,
          status: "completed",
          reference: game.slug,
        });
      }

      await supabase.from("game_results").insert({
        user_id: user.id,
        game_slug: game.slug,
        score: finalScore,
        prize_amount: won ? prizeValue : 0,
        won,
      });
    }

    setScore(finalScore);
    setFinished(true);
  }

  const diceFaces: Record<number, string> = {
    1: "⚀",
    2: "⚁",
    3: "⚂",
    4: "⚃",
    5: "⚄",
    6: "⚅",
  };

  if (!game) {
    return <main className="flex min-h-screen items-center justify-center bg-black text-white">Loading...</main>;
  }

  if (slug === "spin-wheel") {
    return (
      <main className="min-h-screen bg-black px-6 py-12 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-yellow-400/20 bg-white/5 p-8 text-center">
          <h1 className="text-5xl font-black text-yellow-400">{game.name}</h1>

          <p className="mt-4 text-white/60">Entry Fee: ₵{Number(game.entry_fee).toFixed(2)}</p>
          <p className="mt-2 text-green-400">Prize: ₵{Number(game.prize_amount).toFixed(2)}</p>

          <div className="relative mx-auto mt-10 h-80 w-80">
            <div className="absolute left-1/2 top-[-18px] z-30 -translate-x-1/2 text-4xl text-yellow-400">
              ▼
            </div>

            <div
              className="absolute inset-0 flex items-center justify-center rounded-full border-8 border-yellow-400 bg-[conic-gradient(from_0deg,#facc15_0_60deg,#ef4444_60deg_120deg,#22c55e_120deg_180deg,#a855f7_180deg_240deg,#f97316_240deg_300deg,#3b82f6_300deg_360deg)] shadow-2xl"
              style={{
                transform: `rotate(${wheelRotation}deg)`,
                transition: spinningWheel
                  ? "transform 6s cubic-bezier(0.12, 0.8, 0.18, 1)"
                  : "none",
              }}
            >
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-yellow-400 bg-black text-xl font-black text-yellow-400">
                FORTUNA
              </div>
            </div>
          </div>

          {wheelResult && !spinningWheel && (
            <div className="mx-auto mt-6 max-w-sm animate-bounce rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-5">
              <p className="text-sm text-white/60">WHEEL RESULT</p>
              <p className={wheelResult === "GH₵200" || wheelResult === "GH₵2 Airtime" ? "mt-2 text-4xl font-black text-green-400" : "mt-2 text-4xl font-black text-yellow-400"}>
                {wheelResult}
              </p>
            </div>
          )}

          <button
            disabled={spinningWheel || wheelDone}
            onClick={() => void playSpinWheel()}
            className="mt-8 rounded-full bg-yellow-400 px-10 py-4 font-black text-black disabled:opacity-50"
          >
            {spinningWheel ? "Spinning..." : wheelDone ? "Spin Completed" : "Spin Wheel"}
          </button>

          {message && (
            <p className={message.includes("Congratulations") ? "mt-6 rounded-xl border border-green-400/30 bg-green-500/10 p-4 font-bold text-green-300" : "mt-6 rounded-xl bg-white/10 p-4"}>
              {message}
            </p>
          )}

          {wheelDone && (
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => {
                  setWheelDone(false);
                  setWheelResult("");
                  setMessage("");
                  setFreeSpin(false);
                }}
                className="rounded-full bg-yellow-400 px-8 py-3 font-black text-black"
              >
                Play Again
              </button>

              <Link href="/games" className="rounded-full border border-white/20 bg-white/5 px-8 py-3 font-bold text-white">
                Go to Games
              </Link>
            </div>
          )}
        </div>
      </main>
    );
  }

  if (slug === "scratch-win") {
    return (
      <main className="min-h-screen bg-black px-6 py-12 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-yellow-400/20 bg-white/5 p-8 text-center">

          <h1 className="text-5xl font-black text-yellow-400">
            Scratch & Win
          </h1>

          <p className="mt-4 text-white/60">
            Entry Fee: ₵{Number(game.entry_fee).toFixed(2)}
          </p>

          <p className="mt-2 text-green-400">
            Win up to ₵{Number(game.prize_amount).toFixed(2)}
          </p>

          {!scratchStarted && (
            <button
              onClick={() => void startScratchGame()}
              className="mt-8 rounded-full bg-yellow-400 px-10 py-4 font-black text-black"
            >
              Start Scratch Game
            </button>
          )}

          {scratchStarted && (
            <div className="mt-10">
              <p className="mb-4 text-white/60">
                Scratch the entire card to reveal your result. Keep scratching until the card is fully cleared.
              </p>

              <div
                onMouseMove={(e) => {
                  if (e.buttons === 1) handleScratch();
                }}
                onTouchMove={() => handleScratch()}
                className="relative mx-auto flex h-56 max-w-md cursor-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2232%22 height=%2232%22%3E%3Ccircle cx=%2216%22 cy=%2216%22 r=%2210%22 fill=%22white%22 stroke=%22%23dddddd%22 stroke-width=%222%22/%3E%3C/svg%3E')_16_16,crosshair] select-none items-center justify-center overflow-hidden rounded-3xl border-4 border-yellow-400 bg-gradient-to-br from-yellow-300 to-yellow-600"
              >
                <div className="text-center">
                  <p className="text-xl font-black text-black">
                    YOUR RESULT
                  </p>

                  <p className="mt-3 text-5xl font-black text-black">
                    {scratchPrize > 0
                      ? `₵${scratchPrize.toFixed(2)}`
                      : "TRY AGAIN"}
                  </p>
                </div>

                {!scratchFinished && (
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-black text-3xl font-black text-yellow-400"
                    style={{
                      opacity: scratchFinished ? 0 : 1,
                    }}
                  >
                    "SCRATCH HERE"
                  </div>
                )}
              </div>

              {!scratchFinished && scratchStarted && (
                <div className="mt-5">
                  <p className="font-bold text-white">
                    Scratch Progress: {Math.max(1, Math.floor(scratchPercent))}%
                  </p>

                  <div className="mx-auto mt-3 h-3 max-w-md overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full bg-yellow-400 transition-all"
                      style={{ width: `${scratchPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {message && (
                <p className="mt-6 rounded-xl bg-white/10 p-4">
                  {message}
                </p>
              )}

              {scratchFinished && (
                <div className="mt-6 flex flex-wrap justify-center gap-4">
                  <button
                    onClick={() => {
                      setScratchStarted(false);
                      setScratchFinished(false);
                      setScratchPercent(0);
                      setScratchPrize(0);
                      setMessage("");
                      setScratching(false);
                    }}
                    className="rounded-full bg-yellow-400 px-8 py-3 font-black text-black"
                  >
                    Play Again
                  </button>

                  <Link
                    href="/games"
                    className="rounded-full border border-white/20 bg-white/5 px-8 py-3 font-bold text-white"
                  >
                    Go to Games
                  </Link>
                </div>
              )}
            </div>
          )}

          <Link
            href="/games"
            className="mt-8 inline-block rounded-full border border-white/10 px-8 py-4 font-bold"
          >
            Go to Games
          </Link>
        </div>
      </main>
    );
  }

  if (slug === "number-draw") {
    return (
      <main className="min-h-screen bg-black px-6 py-12 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-yellow-400/20 bg-white/5 p-8 text-center">

          <h1 className="text-5xl font-black text-yellow-400">
            {game.name}
          </h1>

          <p className="mt-4 text-white/60">
            Entry Fee: ₵{Number(game.entry_fee).toFixed(2)}
          </p>

          <p className="mt-2 text-green-400">
            Prize: ₵{Number(game.prize_amount).toFixed(2)}
          </p>

          <p className="mt-6 text-white/60">
            Choose one number from 1 to 20.
          </p>

          <div className="mt-6 grid grid-cols-5 gap-3 sm:grid-cols-10">
            {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                disabled={drawingNumber}
                onClick={() => {
                  setNumberPick(n);
                  setNumberResult(null);
                  setMessage("");
                }}
                className={`flex aspect-square items-center justify-center rounded-full border font-black ${
                  numberPick === n
                    ? "border-yellow-300 bg-yellow-400 text-black"
                    : "border-white/20 bg-white/5"
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          {numberPick && !drawingNumber && (
            <p className="mt-5 font-bold text-yellow-300">
              Selected Number: {numberPick}
            </p>
          )}

          <button
            disabled={!numberPick || drawingNumber}
            onClick={() => void playNumberDraw()}
            className="mt-8 rounded-full bg-yellow-400 px-10 py-4 font-black text-black disabled:opacity-50"
          >
            {drawingNumber ? "Drawing..." : "Start Number Draw"}
          </button>

          {drawingNumber && (
            <div className="mx-auto mt-8 flex h-28 w-28 animate-spin items-center justify-center rounded-full border-4 border-yellow-400 text-5xl">
              🔢
            </div>
          )}

          {numberResult !== null && !drawingNumber && (
            <div className="mx-auto mt-8 flex h-28 w-28 animate-bounce items-center justify-center rounded-full bg-yellow-400 text-5xl font-black text-black">
              {numberResult}
            </div>
          )}

          {message && (
            <p className={message.includes("Congratulations") ? "mt-6 rounded-xl border border-green-400/30 bg-green-500/10 p-4 font-bold text-green-300" : "mt-6 rounded-xl bg-white/10 p-4"}>
              {message}
            </p>
          )}

          <Link
            href="/games"
            className="mt-8 inline-block rounded-full border border-white/10 px-8 py-4 font-bold"
          >
            Go to Games
          </Link>
        </div>
      </main>
    );
  }

  if (slug === "spin-wheel") {
    return (
      <main className="min-h-screen bg-black px-6 py-12 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-yellow-400/20 bg-white/5 p-8 text-center">
          <h1 className="text-5xl font-black text-yellow-400">{game.name}</h1>

          <p className="mt-4 text-white/60">Entry Fee: ₵{Number(game.entry_fee).toFixed(2)}</p>
          <p className="mt-2 text-green-400">Prize: ₵{Number(game.prize_amount).toFixed(2)}</p>

          <div className="relative mx-auto mt-10 h-80 w-80">
            <div className="absolute left-1/2 top-[-18px] z-30 -translate-x-1/2 text-4xl text-yellow-400">
              ▼
            </div>

            <div
              className="absolute inset-0 flex items-center justify-center rounded-full border-8 border-yellow-400 bg-[conic-gradient(from_0deg,#facc15_0_60deg,#ef4444_60deg_120deg,#22c55e_120deg_180deg,#a855f7_180deg_240deg,#f97316_240deg_300deg,#3b82f6_300deg_360deg)] shadow-2xl"
              style={{
                transform: `rotate(${wheelRotation}deg)`,
                transition: spinningWheel
                  ? "transform 6s cubic-bezier(0.12, 0.8, 0.18, 1)"
                  : "none",
              }}
            >
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-yellow-400 bg-black text-xl font-black text-yellow-400">
                FORTUNA
              </div>
            </div>
          </div>

          {wheelResult && !spinningWheel && (
            <div className="mx-auto mt-6 max-w-sm animate-bounce rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-5">
              <p className="text-sm text-white/60">WHEEL RESULT</p>
              <p className={wheelResult === "GH₵200" || wheelResult === "GH₵2 Airtime" ? "mt-2 text-4xl font-black text-green-400" : "mt-2 text-4xl font-black text-yellow-400"}>
                {wheelResult}
              </p>
            </div>
          )}

          <button
            disabled={spinningWheel || wheelDone}
            onClick={() => void playSpinWheel()}
            className="mt-8 rounded-full bg-yellow-400 px-10 py-4 font-black text-black disabled:opacity-50"
          >
            {spinningWheel ? "Spinning..." : wheelDone ? "Spin Completed" : "Spin Wheel"}
          </button>

          {message && (
            <p className={message.includes("Congratulations") ? "mt-6 rounded-xl border border-green-400/30 bg-green-500/10 p-4 font-bold text-green-300" : "mt-6 rounded-xl bg-white/10 p-4"}>
              {message}
            </p>
          )}

          {wheelDone && (
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => {
                  setWheelDone(false);
                  setWheelResult("");
                  setMessage("");
                  setFreeSpin(false);
                }}
                className="rounded-full bg-yellow-400 px-8 py-3 font-black text-black"
              >
                Play Again
              </button>

              <Link href="/games" className="rounded-full border border-white/20 bg-white/5 px-8 py-3 font-bold text-white">
                Go to Games
              </Link>
            </div>
          )}
        </div>
      </main>
    );
  }

  if (slug === "scratch-win") {
    return (
      <main className="min-h-screen bg-black px-6 py-12 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-yellow-400/20 bg-white/5 p-8 text-center">

          <h1 className="text-5xl font-black text-yellow-400">
            Scratch & Win
          </h1>

          <p className="mt-4 text-white/60">
            Entry Fee: ₵{Number(game.entry_fee).toFixed(2)}
          </p>

          <p className="mt-2 text-green-400">
            Win up to ₵{Number(game.prize_amount).toFixed(2)}
          </p>

          {!scratchStarted && (
            <button
              onClick={() => void startScratchGame()}
              className="mt-8 rounded-full bg-yellow-400 px-10 py-4 font-black text-black"
            >
              Start Scratch Game
            </button>
          )}

          {scratchStarted && (
            <div className="mt-10">
              <p className="mb-4 text-white/60">
                Scratch the entire card to reveal your result. Keep scratching until the card is fully cleared.
              </p>

              <div
                onMouseMove={(e) => {
                  if (e.buttons === 1) handleScratch();
                }}
                onTouchMove={() => handleScratch()}
                className="relative mx-auto flex h-56 max-w-md cursor-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2232%22 height=%2232%22%3E%3Ccircle cx=%2216%22 cy=%2216%22 r=%2210%22 fill=%22white%22 stroke=%22%23dddddd%22 stroke-width=%222%22/%3E%3C/svg%3E')_16_16,crosshair] select-none items-center justify-center overflow-hidden rounded-3xl border-4 border-yellow-400 bg-gradient-to-br from-yellow-300 to-yellow-600"
              >
                <div className="text-center">
                  <p className="text-xl font-black text-black">
                    YOUR RESULT
                  </p>

                  <p className="mt-3 text-5xl font-black text-black">
                    {scratchPrize > 0
                      ? `₵${scratchPrize.toFixed(2)}`
                      : "TRY AGAIN"}
                  </p>
                </div>

                {!scratchFinished && (
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-black text-3xl font-black text-yellow-400"
                    style={{
                      opacity: scratchFinished ? 0 : 1,
                    }}
                  >
                    "SCRATCH HERE"
                  </div>
                )}
              </div>

              {!scratchFinished && scratchStarted && (
                <div className="mt-5">
                  <p className="font-bold text-white">
                    Scratch Progress: {Math.max(1, Math.floor(scratchPercent))}%
                  </p>

                  <div className="mx-auto mt-3 h-3 max-w-md overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full bg-yellow-400 transition-all"
                      style={{ width: `${scratchPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {message && (
                <p className="mt-6 rounded-xl bg-white/10 p-4">
                  {message}
                </p>
              )}

              {scratchFinished && (
                <div className="mt-6 flex flex-wrap justify-center gap-4">
                  <button
                    onClick={() => {
                      setScratchStarted(false);
                      setScratchFinished(false);
                      setScratchPercent(0);
                      setScratchPrize(0);
                      setMessage("");
                      setScratching(false);
                    }}
                    className="rounded-full bg-yellow-400 px-8 py-3 font-black text-black"
                  >
                    Play Again
                  </button>

                  <Link
                    href="/games"
                    className="rounded-full border border-white/20 bg-white/5 px-8 py-3 font-bold text-white"
                  >
                    Go to Games
                  </Link>
                </div>
              )}
            </div>
          )}

          <Link
            href="/games"
            className="mt-8 inline-block rounded-full border border-white/10 px-8 py-4 font-bold"
          >
            Go to Games
          </Link>
        </div>
      </main>
    );
  }

  if (slug === "number-draw") {
    return (
      <main className="min-h-screen bg-black px-6 py-12 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-yellow-400/20 bg-white/5 p-8 text-center">

          <h1 className="text-5xl font-black text-yellow-400">
            {game.name}
          </h1>

          <p className="mt-4 text-white/60">
            Entry Fee: ₵{Number(game.entry_fee).toFixed(2)}
          </p>

          <p className="mt-2 text-green-400">
            Prize: ₵{Number(game.prize_amount).toFixed(2)}
          </p>

          <p className="mt-6 text-white/60">
            Choose one number from 1 to 20.
          </p>

          <div className="mt-6 grid grid-cols-5 gap-3 sm:grid-cols-10">
            {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                disabled={drawingNumber}
                onClick={() => {
                  setNumberPick(n);
                  setNumberResult(null);
                  setMessage("");
                }}
                className={`flex aspect-square items-center justify-center rounded-full border font-black ${
                  numberPick === n
                    ? "border-yellow-300 bg-yellow-400 text-black"
                    : "border-white/20 bg-white/5"
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          {numberPick && !drawingNumber && (
            <p className="mt-5 font-bold text-yellow-300">
              Selected Number: {numberPick}
            </p>
          )}

          <button
            disabled={!numberPick || drawingNumber}
            onClick={() => void playNumberDraw()}
            className="mt-8 rounded-full bg-yellow-400 px-10 py-4 font-black text-black disabled:opacity-50"
          >
            {drawingNumber ? "Drawing..." : "Start Number Draw"}
          </button>

          {drawingNumber && (
            <div className="mx-auto mt-8 flex h-28 w-28 animate-spin items-center justify-center rounded-full border-4 border-yellow-400 text-5xl">
              🔢
            </div>
          )}

          {numberResult !== null && !drawingNumber && (
            <div className="mx-auto mt-8 flex h-28 w-28 animate-bounce items-center justify-center rounded-full bg-yellow-400 text-5xl font-black text-black">
              {numberResult}
            </div>
          )}

          {message && (
            <p className={message.includes("Congratulations") ? "mt-6 rounded-xl border border-green-400/30 bg-green-500/10 p-4 font-bold text-green-300" : "mt-6 rounded-xl bg-white/10 p-4"}>
              {message}
            </p>
          )}

          <Link
            href="/games"
            className="mt-8 inline-block rounded-full border border-white/10 px-8 py-4 font-bold"
          >
            Go to Games
          </Link>
        </div>
      </main>
    );
  }

  if (slug === "lucky-draw") {
    return (
      <main className="min-h-screen bg-black px-6 py-12 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-yellow-400/20 bg-white/5 p-8 text-center">
          <div className="mx-auto flex h-72 max-w-md items-center justify-center overflow-hidden rounded-[50%] border-4 border-yellow-400/40 bg-gradient-to-b from-white/10 to-yellow-500/10 shadow-2xl">
            <div className="relative h-full w-full">
              {[1,2,3,4,5,6,7,8,9,10].map((ball, index) => (
                <div
                  key={ball}
                  className={`absolute flex h-14 w-14 items-center justify-center rounded-full border-2 border-yellow-300 bg-yellow-400 text-xl font-black text-black shadow-lg ${
                    drawingLucky ? "animate-bounce" : ""
                  }`}
                  style={{
                    left: `${10 + ((index * 27) % 75)}%`,
                    top: `${10 + ((index * 37) % 70)}%`,
                    animationDelay: `${index * 90}ms`,
                    animationDuration: `${500 + (index % 4) * 130}ms`,
                  }}
                >
                  {ball}
                </div>
              ))}
            </div>
          </div>

          <h1 className="mt-4 text-5xl font-black text-yellow-400">{game.name}</h1>
          <p className="mt-4 text-white/60">Entry Fee: ₵{Number(game.entry_fee).toFixed(2)}</p>
          <p className="mt-2 text-green-400">Prize: ₵{Number(game.prize_amount).toFixed(2)}</p>
          <p className="mt-6 text-white/60">
            Pick one lucky number from 1 to 10. If the draw matches your number, you win.
          </p>

          <div className="mt-6 grid grid-cols-5 gap-3">
            {[1,2,3,4,5,6,7,8,9,10].map((n) => (
              <button
                key={n}
                disabled={drawingLucky}
                onClick={() => {
                  setLuckyPick(n);
                  setLuckyResult(null);
                  setMessage("");
                }}
                className={`rounded-2xl border p-4 text-xl font-black ${
                  luckyPick === n
                    ? "border-yellow-400 bg-yellow-400 text-black"
                    : "border-white/10 bg-white/5 text-white"
                } disabled:opacity-50`}
              >
                {n}
              </button>
            ))}
          </div>

          <button
            disabled={drawingLucky || !luckyPick}
            onClick={() => void playLuckyDraw()}
            className="mt-8 rounded-full bg-yellow-400 px-10 py-4 font-black text-black disabled:opacity-50"
          >
            {drawingLucky ? "Drawing Winning Number..." : "Start Lucky Draw"}
          </button>

          {luckyResult !== null && (
            <p className="mt-5 text-3xl font-black text-yellow-400">
              Draw Result: {luckyResult}
            </p>
          )}

          {message && (
            <p className="mt-6 whitespace-pre-line rounded-xl bg-white/10 p-4 text-white">
              {message}
            </p>
          )}

          <Link href="/games" className="mt-8 inline-block rounded-full border border-white/10 px-8 py-4 font-bold">
            Go to Games
          </Link>
        </div>
      </main>
    );
  }

  if (slug === "dice-roll") {
    return (
      <main className="min-h-screen bg-black px-6 py-12 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-yellow-400/20 bg-white/5 p-8 text-center">
          <div
            className={`text-9xl transition-transform ${
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
          <p className="mt-6 text-white/60">
            Choose the dice side you want. If the roll lands on your chosen side, you win.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {[1, 2, 3, 4, 5, 6].map((side) => (
              <button
                key={side}
                disabled={rolling}
                onClick={() => {
                  setChosenDice(side);
                  setDiceRoundFinished(false);
                  setDiceResult(null);
                  setMessage("");
                }}
                className={`rounded-2xl border p-4 text-2xl font-black ${
                  chosenDice === side
                    ? "border-yellow-400 bg-yellow-400 text-black"
                    : "border-white/10 bg-white/5 text-white"
                } text-4xl disabled:opacity-50`}
              >
                {diceFaces[side]}
              </button>
            ))}
          </div>

          <button
            disabled={rolling || !chosenDice || diceRoundFinished}
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
            Go to Games
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
          <Link href="/games" className="mt-8 inline-block rounded-full bg-yellow-400 px-8 py-4 font-black text-black">Go to Games</Link>
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
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => window.location.reload()}
                className="rounded-full bg-yellow-400 px-8 py-4 font-black text-black"
              >
                Play Again
              </button>

              <Link href="/games" className="rounded-full border border-white/20 bg-white/5 px-8 py-4 font-bold text-white">
                Go to Games
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
