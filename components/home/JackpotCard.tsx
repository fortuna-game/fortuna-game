"use client";

import CountUp from "react-countup";

export default function JackpotCard() {
  return (
    <section className="mx-auto max-w-7xl px-6">
      <div className="rounded-[32px] border border-yellow-400/20 bg-gradient-to-r from-yellow-500/10 via-black to-purple-900/20 p-8 text-center shadow-2xl">
        <p className="text-yellow-300 uppercase tracking-[0.3em]">
          Current Jackpot
        </p>

        <h2 className="mt-4 text-5xl font-black text-yellow-400 md:text-7xl">
          ₵
          <CountUp end={250000} duration={3} separator="," />
        </h2>

        <p className="mt-4 text-white/60">
          The jackpot grows as more eligible games are played.
        </p>
      </div>
    </section>
  );
}
