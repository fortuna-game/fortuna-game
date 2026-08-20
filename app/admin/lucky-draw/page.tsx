"use client";

import Link from "next/link";

export default function AdminLuckyDrawPage() {
  return (
    <main className="min-h-screen bg-[#071A33] px-4 py-10 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <Link
            href="/admin"
            className="inline-flex rounded-xl border border-[#38BDF8]/15 bg-[#0B2545]/70 px-4 py-2 text-sm font-semibold text-gray-300 transition hover:bg-[#0F2F57]/80 hover:text-white"
          >
            ← Back to Admin
          </Link>

          <h1 className="mt-6 text-4xl font-black text-[#4D94F5]">
            Lucky Draw
          </h1>

          <p className="mt-2 text-blue-100/60">
            Choose what you want to manage.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/admin/lucky-draw/manage"
            className="group min-w-0 rounded-3xl border border-[#F5B700]/30 bg-zinc-950 p-8 transition hover:-translate-y-1 hover:border-[#FFD54A] hover:bg-zinc-900"
          >
            <div className="text-5xl">🎟️</div>

            <h2 className="mt-6 text-2xl font-black text-[#FFD54A]">
              Lucky Draws
            </h2>

            <p className="mt-3 leading-7 text-blue-100/60">
              Create new Lucky Draws, edit prizes, manage tickets,
              view active draws and complete finished draws.
            </p>

            <div className="mt-8 font-bold text-[#FFD54A] group-hover:text-[#FFE08A]">
              Manage Lucky Draws →
            </div>
          </Link>

          <Link
            href="/admin/lucky-draw/claims"
            className="group min-w-0 rounded-3xl border border-[#32659D] bg-zinc-950 p-8 transition hover:-translate-y-1 hover:border-blue-400 hover:bg-zinc-900"
          >
            <div className="text-5xl">📦</div>

            <h2 className="mt-6 text-2xl font-black text-[#4D94F5]">
              Prize Claims
            </h2>

            <p className="mt-3 leading-7 text-blue-100/60">
              View delivery and collection details submitted by physical
              prize winners and update the status of each claim.
            </p>

            <div className="mt-8 font-bold text-[#4D94F5] group-hover:text-[#66A7FF]">
              Manage Prize Claims →
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
