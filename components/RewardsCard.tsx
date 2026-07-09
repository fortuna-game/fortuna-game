export default function RewardsCard() {
  return (
    <div className="rounded-3xl border border-pink-500/30 bg-gradient-to-br from-pink-500/15 via-white/5 to-black p-6">
      <div className="flex items-start gap-4">
        <div className="text-4xl">��</div>

        <div>
          <p className="text-sm font-black uppercase tracking-widest text-pink-400">
            Fortuna Rewards
          </p>

          <h2 className="mt-2 text-2xl font-black text-white">
            Play More. Aim Higher. Earn Rewards.
          </h2>

          <p className="mt-3 leading-7 text-white/70">
            Active players who join more skill games and choose higher entry
            fees may qualify for special Fortuna Play rewards, including cash
            bonuses, phones, gift prizes, and other exciting promotions.
            Rewards are based on fair play, account activity, and promotion
            rules.
          </p>
        </div>
      </div>
    </div>
  );
}
