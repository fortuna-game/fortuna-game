"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function PrizeClaimsPage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loadingClaims, setLoadingClaims] = useState(false);
  const [updatingClaimId, setUpdatingClaimId] =
    useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function getSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session;
  }

  async function loadClaims() {
    setLoadingClaims(true);
    setMessage("");

    try {
      const session = await getSession();

      if (!session) {
        setMessage("Admin login required.");
        return;
      }

      const res = await fetch("/api/admin/lucky-draw/claims", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Could not load prize claims.");
        return;
      }

      setClaims(data.claims || []);
    } catch (error) {
      console.error("LOAD CLAIMS ERROR:", error);
      setMessage("Could not load prize claims.");
    } finally {
      setLoadingClaims(false);
    }
  }

  async function updateClaimStatus(
    claimId: string,
    status: string
  ) {
    setUpdatingClaimId(claimId);
    setMessage("");

    try {
      const session = await getSession();

      if (!session) {
        setMessage("Admin login required.");
        return;
      }

      const res = await fetch("/api/admin/lucky-draw/claims", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          claimId,
          status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Could not update prize claim.");
        return;
      }

      setClaims((currentClaims) =>
        currentClaims.map((claim) =>
          claim.id === claimId
            ? { ...claim, status }
            : claim
        )
      );

      setMessage(
        data.message || "Prize claim updated successfully."
      );
    } catch (error) {
      console.error("UPDATE CLAIM STATUS ERROR:", error);
      setMessage("Could not update prize claim.");
    } finally {
      setUpdatingClaimId(null);
    }
  }

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/admin/lucky-draw"
          className="inline-flex rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-300 transition hover:bg-white/10 hover:text-white"
        >
          ← Back to Lucky Draw
        </Link>

        <div className="mt-8 mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-black text-pink-500">
              Prize Claims
            </h1>
            <p className="mt-2 text-gray-400">
              Manage delivery and collection details submitted by physical prize winners.
            </p>
          </div>

          <button
            onClick={loadClaims}
            disabled={loadingClaims}
            className="rounded-xl bg-pink-600 px-6 py-3 font-bold text-white transition hover:bg-pink-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingClaims ? "Loading..." : "Load Prize Claims"}
          </button>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-gray-300">
            {message}
          </div>
        )}

        {claims.length === 0 && !loadingClaims ? (
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-8 text-center text-gray-500">
            No prize claims loaded yet. Click "Load Prize Claims" to check for submitted claims.
          </div>
        ) : (
          <div className="space-y-5">
            {claims.map((claim) => (
              <div
                key={claim.id}
                className="rounded-2xl border border-white/10 bg-zinc-950 p-6"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-pink-400">
                        {claim.lucky_draws?.prize_type || "Prize"}
                      </p>
                      <h2 className="mt-1 text-xl font-black">
                        {claim.lucky_draws?.title || "Lucky Draw Prize"}
                      </h2>
                    </div>

                    <div className="grid gap-3 text-sm text-gray-300 sm:grid-cols-2">
                      <p>
                        <span className="text-gray-500">Winner:</span>{" "}
                        {claim.full_name}
                      </p>
                      <p>
                        <span className="text-gray-500">Phone:</span>{" "}
                        {claim.phone_number}
                      </p>
                      <p>
                        <span className="text-gray-500">Alt Phone:</span>{" "}
                        {claim.alternate_phone_number || "—"}
                      </p>
                      <p>
                        <span className="text-gray-500">Email:</span>{" "}
                        {claim.email}
                      </p>
                      <p>
                        <span className="text-gray-500">Location:</span>{" "}
                        {claim.location}
                      </p>
                      <p>
                        <span className="text-gray-500">City:</span>{" "}
                        {claim.city}
                      </p>
                      <p>
                        <span className="text-gray-500">Region:</span>{" "}
                        {claim.region}
                      </p>
                      <p>
                        <span className="text-gray-500">Submitted:</span>{" "}
                        {claim.created_at
                          ? new Date(claim.created_at).toLocaleString()
                          : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="min-w-[220px]">
                    <label className="mb-2 block text-sm font-semibold text-gray-400">
                      Claim Status
                    </label>

                    <select
                      value={claim.status}
                      onChange={(e) =>
                        updateClaimStatus(
                          claim.id,
                          e.target.value
                        )
                      }
                      disabled={updatingClaimId === claim.id}
                      className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white outline-none focus:border-pink-500 disabled:opacity-60"
                    >
                      <option value="pending">Pending</option>
                      <option value="contacted">Contacted</option>
                      <option value="processing">Processing</option>
                      <option value="delivered">Delivered</option>
                      <option value="collected">Collected</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    {updatingClaimId === claim.id && (
                      <p className="mt-2 text-xs text-pink-400">
                        Updating...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
