"use client";

import {
  FormEvent,
  Suspense,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function ClaimPrizeContent() {
  const searchParams = useSearchParams();
  const drawId = searchParams.get("drawId");

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState("");
  const [drawTitle, setDrawTitle] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    location: "",
    city: "",
    region: "",
    phoneNumber: "",
    alternatePhoneNumber: "",
    email: "",
  });

  useEffect(() => {
    async function checkWinner() {
      if (!drawId) {
        setMessage("Lucky Draw information is missing.");
        setChecking(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setMessage("Please log in to claim your prize.");
        setChecking(false);
        return;
      }

      try {
        const res = await fetch("/api/lucky-draw/results", {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          setMessage(data.error || "Could not verify your prize.");
          return;
        }

        const draw = Array.isArray(data.results)
          ? data.results.find(
              (item: { id: string }) =>
                item.id === drawId
            )
          : null;

        if (!draw) {
          setMessage(
            "This completed Lucky Draw could not be found."
          );
          return;
        }

        if (draw.winner_user_id !== session.user.id) {
          setMessage(
            "Only the selected winner can submit prize details."
          );
          return;
        }

        setDrawTitle(draw.title || "your prize");

        setForm((current) => ({
          ...current,
          email: session.user.email || current.email,
        }));
      } catch {
        setMessage("Could not verify your prize.");
      } finally {
        setChecking(false);
      }
    }

    void checkWinner();
  }, [drawId]);

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function submitClaim(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!drawId || loading) return;

    setLoading(true);
    setMessage("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setMessage(
          "Please log in to submit your details."
        );
        return;
      }

      const res = await fetch(
        "/api/lucky-draw/claim-prize",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            drawId,
            ...form,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(
          data.error ||
            "Could not submit your details."
        );
        return;
      }

      setMessage(
        data.message ||
          "Your prize details have been submitted successfully."
      );
    } catch {
      setMessage("Could not submit your details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#071A33] px-4 py-8 text-white">
      <section className="mx-auto max-w-2xl">
        <Link
          href="/lucky-draw"
          className="text-sm font-bold text-[#FFE08A]"
        >
          ← Back to Lucky Draws
        </Link>

        <div className="mt-6 rounded-2xl border border-[#FFD54A]/25 bg-white/[0.04] p-5 sm:p-8">
          <div className="text-center">
            <div className="text-4xl">🎉</div>

            <h1 className="mt-3 text-3xl font-black text-[#FFD54A]">
              Claim Your Prize
            </h1>

            {!checking && drawTitle && (
              <p className="mt-2 text-[#B4C0D1]">
                Congratulations! Please provide your details
                so we can arrange your prize:{" "}
                <span className="font-bold text-white">
                  {drawTitle}
                </span>
              </p>
            )}
          </div>

          {checking ? (
            <p className="mt-8 text-center text-[#9AAAC1]">
              Verifying your prize...
            </p>
          ) : message && !drawTitle ? (
            <div className="mt-8 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-center text-sm text-red-200">
              {message}
            </div>
          ) : (
            <form
              onSubmit={submitClaim}
              className="mt-8 space-y-4"
            >
              <input
                required
                value={form.fullName}
                onChange={(e) =>
                  updateField(
                    "fullName",
                    e.target.value
                  )
                }
                placeholder="Full Name"
                className="w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3 outline-none focus:border-[#FFD54A]"
              />

              <input
                required
                value={form.location}
                onChange={(e) =>
                  updateField(
                    "location",
                    e.target.value
                  )
                }
                placeholder="Location / Area"
                className="w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3 outline-none focus:border-[#FFD54A]"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  required
                  value={form.city}
                  onChange={(e) =>
                    updateField("city", e.target.value)
                  }
                  placeholder="City / Town"
                  className="w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3 outline-none focus:border-[#FFD54A]"
                />

                <input
                  required
                  value={form.region}
                  onChange={(e) =>
                    updateField("region", e.target.value)
                  }
                  placeholder="Region"
                  className="w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3 outline-none focus:border-[#FFD54A]"
                />
              </div>

              <input
                required
                value={form.phoneNumber}
                onChange={(e) =>
                  updateField(
                    "phoneNumber",
                    e.target.value
                  )
                }
                placeholder="Phone Number"
                className="w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3 outline-none focus:border-[#FFD54A]"
              />

              <input
                value={form.alternatePhoneNumber}
                onChange={(e) =>
                  updateField(
                    "alternatePhoneNumber",
                    e.target.value
                  )
                }
                placeholder="Alternate Phone Number (Optional)"
                className="w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3 outline-none focus:border-[#FFD54A]"
              />

              <input
                required
                type="email"
                value={form.email}
                onChange={(e) =>
                  updateField("email", e.target.value)
                }
                placeholder="Email Address"
                className="w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3 outline-none focus:border-[#FFD54A]"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#FFD54A] px-4 py-3 font-black text-black disabled:opacity-60"
              >
                {loading
                  ? "Submitting..."
                  : "Submit Prize Details"}
              </button>

              {message && drawTitle && (
                <div className="rounded-xl border border-green-400/30 bg-green-500/10 p-4 text-center text-sm text-green-200">
                  {message}
                </div>
              )}
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

export default function ClaimPrizePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#071A33] px-4 py-8 text-white">
          <div className="mx-auto max-w-2xl text-center text-[#9AAAC1]">
            Loading prize details...
          </div>
        </main>
      }
    >
      <ClaimPrizeContent />
    </Suspense>
  );
}
