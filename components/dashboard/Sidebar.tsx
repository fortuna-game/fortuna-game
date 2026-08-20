import Link from "next/link";

export default function Sidebar() {
  const items = [
    ["🏠","Dashboard","/dashboard"],
    ["🎮","Games","/games"],
    ["💰","Wallet","/wallet"],
    ["⬆️","Deposit","/wallet/deposit"],
    ["⬇️","Withdraw","/wallet/withdraw"],
    ["🏆","Leaderboard","/leaderboard"],
    ["🎁","Promotions","/promotions"],
    ["👤","Profile","/profile"],
    ["⚙️","Settings","/settings"],
  ];

  return (
    <aside className="w-72 border-r border-blue-500/10 bg-zinc-950 p-6">
      <h2 className="mb-8 text-3xl font-black text-[#4D94F5]">
        Fortuna Play
      </h2>

      <div className="space-y-3">
        {items.map(([icon,title,href])=>(
          <Link
            key={title}
            href={href}
            className="flex items-center gap-4 rounded-xl px-4 py-4 transition hover:bg-[#2C63B3]/10"
          >
            <span className="text-2xl">{icon}</span>
            <span>{title}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
