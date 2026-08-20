"use client";

import CountUp from "react-countup";

export default function JackpotCard() {
  return (
    <section className="mx-auto max-w-7xl px-6">
      <div className="rounded-[32px] border border-[#2A5688] bg-gradient-to-r from-blue-700/10 via-[#071A33] to-[#0B2345]/40 p-8 text-center shadow-2xl">
        <p className="text-[#66A7FF] uppercase tracking-[0.3em]">
          Cash Prizes Available
        </p>

        <h2 className="mt-4 text-5xl font-black text-[#4D94F5] md:text-7xl">
          ₵
          <CountUp end={250000} duration={3} separator="," />
        </h2>

        <p className="mt-4 text-[#9AAAC1]">
          Play skill-based games and win cash prizes based on your performance.
        </p>
      </div>
    </section>
  );
}
