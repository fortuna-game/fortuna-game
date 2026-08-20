"use client";

import Link from "next/link";

export default function AdminLuckyDrawPage() {
  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <Link
            href="/admin"
            className="inline-flex rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-300 transition hover:bg-white/10 hover:text-white"
          >
            ← Back to Admin
          </Link>

          <h1 className="mt-6 text-4xl font-black text-pink-500">
            Lucky Draw
          </h1>

          <p className="mt-2 text-gray-400">
            Choose what you want to manage.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/admin/lucky-draw/manage"
            className="group rounded-3xl border border-yellow-500/30 bg-zinc-950 p-8 transition hover:-translate-y-1 hover:border-yellow-400 hover:bg-zinc-900"
          >
            <div className="text-5xl">🎟️</div>

            <h2 className="mt-6 text-2xl font-black text-yellow-400">
              Lucky Draws
            </h2>

            <p className="mt-3 leading-7 text-gray-400">
              Create new Lucky Draws, edit prizes, manage tickets,
              view active draws and complete finished draws.
            </p>

            <div className="mt-8 font-bold text-yellow-400 group-hover:text-yellow-300">
              Manage Lucky Draws →
            </div>
          </Link>

          <Link
            href="/admin/lucky-draw/claims"
            className="group rounded-3xl border border-pink-500/30 bg-zinc-950 p-8 transition hover:-translate-y-1 hover:border-pink-400 hover:bg-zinc-900"
          >
            <div className="text-5xl">📦</div>

            <h2 className="mt-6 text-2xl font-black text-pink-500">
              Prize Claims
            </h2>

            <p className="mt-3 leading-7 text-gray-400">
              View delivery and collection details submitted by physical
              prize winners and update the status of each claim.
            </p>

            <div className="mt-8 font-bold text-pink-500 group-hover:text-pink-400">
              Manage Prize Claims →
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
