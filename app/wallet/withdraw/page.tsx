export default function WithdrawPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-xl rounded-3xl border border-red-400/20 bg-red-500/10 p-8">
        <h1 className="text-4xl font-black text-red-400">Withdraw</h1>
        <p className="mt-3 text-white/60">Withdraw winnings to your mobile money account.</p>

        <input
          placeholder="Amount e.g. 100"
          className="mt-8 w-full rounded-xl border border-white/10 bg-white/5 p-4 outline-none"
        />

        <input
          placeholder="Mobile Money Number"
          className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 p-4 outline-none"
        />

        <button className="mt-5 w-full rounded-xl bg-red-500 py-4 font-black text-white">
          Request Withdrawal
        </button>
      </div>
    </main>
  );
}
