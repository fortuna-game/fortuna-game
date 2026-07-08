"use client";

const winners = [
  "🏆 Michael won ₵2,500",
  "🏆 Sarah won ₵850",
  "🏆 Daniel won ₵5,000",
  "🏆 Linda won ₵1,200",
  "🏆 Emmanuel won ₵750",
];

export default function WinnersTicker() {
  return (
    <div className="overflow-hidden border-y border-pink-500/20 bg-pink-600/10 py-4">
      <div className="animate-pulse whitespace-nowrap text-center text-lg font-bold text-pink-400">
        {winners.join("   •   ")}
      </div>
    </div>
  );
}
