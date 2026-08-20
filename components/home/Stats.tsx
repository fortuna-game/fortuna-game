export default function Stats() {
  const stats = [
    { value: "13", label: "Games" },
    { value: "2X", label: "Prize Potential" },
    { value: "24/7", label: "Support" },
    { value: "100%", label: "Secure Payments" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid gap-6 md:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-3xl border border-[#2A5688] bg-[#0B2545]/70 p-8 text-center"
          >
            <h2 className="text-5xl font-black text-[#4D94F5]">
              {stat.value}
            </h2>

            <p className="mt-3 text-[#9AAAC1]">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
