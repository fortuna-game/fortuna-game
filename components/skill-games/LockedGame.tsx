"use client";

import Link from "next/link";

type Props = {
  title: string;
  icon?: string;
};

export default function LockedGame({
  title,
  icon = "🎮",
}: Props) {
  return (
    <main className="min-h-screen bg-[#071A33] px-4 py-10 text-white sm:px-6">
      <div className="mx-auto flex min-h-[75vh] max-w-3xl items-center justify-center">
        <section className="w-full rounded-[32px] border border-yellow-400/20 bg-gradient-to-br from-[#0B2545] via-[#071A33] to-[#111D3A] p-8 text-center shadow-2xl sm:p-12">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border border-yellow-400/20 bg-yellow-400/10 text-5xl">
            {icon}
          </div>

          <div className="mt-6 inline-flex rounded-full border border-yellow-400/20 bg-yellow-400/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-yellow-300">
            🔒 Under Development
          </div>

          <h1 className="mt-5 text-3xl font-black sm:text-4xl">
            {title}
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#9AAAC1] sm:text-base">
            We&apos;re currently improving this game to give you a
            better experience. It&apos;s temporarily unavailable while
            we work on it.
          </p>

          <p className="mx-auto mt-3 max-w-xl text-sm text-white/45">
            Lucky Draw and Prize Vault are currently available.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/skill-games"
              className="rounded-xl border border-[#32659D] bg-[#0B2545] px-6 py-3 font-black"
            >
              ← Back to Games
            </Link>

            <Link
              href="/lucky-draw"
              className="rounded-xl bg-[#FFD54A] px-6 py-3 font-black text-black"
            >
              🎟️ View Lucky Draws
            </Link>

            <Link
              href="/skill-games/prize-vault"
              className="rounded-xl border border-blue-400/30 bg-blue-500/10 px-6 py-3 font-black text-blue-200"
            >
              🎁 Prize Vault
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
