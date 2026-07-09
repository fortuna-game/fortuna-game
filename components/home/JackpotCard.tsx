"use client";

import CountUp from "react-countup";

export default function JackpotCard() {
  return (
    <section className="mx-auto max-w-7xl px-6">
      <div className="rounded-[32px] border border-pink-500/20 bg-gradient-to-r from-pink-600/10 via-black to-purple-900/20 p-8 text-center shadow-2xl">
        <p className="text-pink-400 uppercase tracking-[0.3em]">
          Cash Prizes Available
        </p>

        <h2 className="mt-4 text-5xl font-black text-pink-500 md:text-7xl">
          ₵
          <CountUp end={250000} duration={3} separator="," />
        </h2>

        <p className="mt-4 text-white/60">
          Play skill-based games and win cash prizes based on your performance.
        </p>
      </div>
    </section>
  );
}
