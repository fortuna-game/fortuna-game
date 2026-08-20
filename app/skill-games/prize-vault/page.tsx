"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type FulfillmentType =
  | "wallet"
  | "airtime"
  | "data"
  | "food_delivery"
  | "voucher"
  | "delivery"
  | null;

type Prize = {
  id: string | null;
  name: string;
  emoji: string;
  description: string;
  type: string;
  fulfillmentType: FulfillmentType;
  value: number;
};

type PlayResult = {
  success: boolean;
  playId: string;
  vaultNumber: number;
  entryFee: number;
  won: boolean;
  claimRequired?: boolean;
  cashCredited?: boolean;
  prize: Prize;
};

export default function PrizeVaultPage() {
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<PlayResult | null>(null);
  const [opening, setOpening] = useState(false);
  const [message, setMessage] = useState("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [network, setNetwork] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [submittingClaim, setSubmittingClaim] = useState(false);
  const [claimSubmitted, setClaimSubmitted] = useState(false);

  async function openVault(index: number) {
    if (selected !== null || opening) return;

    setMessage("");
    setOpening(true);
    setSelected(index);

    const { data: auth } = await supabase.auth.getSession();
    const token = auth.session?.access_token;

    if (!token) {
      setMessage("Please log in to play Prize Vault.");
      setSelected(null);
      setOpening(false);
      return;
    }

    try {
      const res = await fetch("/api/skill-games/prize-vault/play", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          vaultNumber: index + 1,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Could not open Prize Vault.");
        setSelected(null);
        setOpening(false);
        return;
      }

      setTimeout(() => {
        setResult(data);
        setOpening(false);
      }, 1200);
    } catch {
      setMessage("Could not connect to Prize Vault.");
      setSelected(null);
      setOpening(false);
    }
  }

  async function submitClaim() {
    if (!result?.playId) return;

    setMessage("");
    setSubmittingClaim(true);

    const { data: auth } = await supabase.auth.getSession();
    const token = auth.session?.access_token;

    if (!token) {
      setMessage("Please log in again.");
      setSubmittingClaim(false);
      return;
    }

    try {
      const res = await fetch("/api/skill-games/prize-vault/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          playId: result.playId,
          fullName,
          phone,
          network,
          region,
          city,
          address,
          note,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Could not submit your prize claim.");
        setSubmittingClaim(false);
        return;
      }

      setClaimSubmitted(true);
      setMessage(data.message || "Prize claim submitted successfully.");
      setSubmittingClaim(false);
    } catch {
      setMessage("Could not connect to the prize claim service.");
      setSubmittingClaim(false);
    }
  }

  function playAgain() {
    setSelected(null);
    setResult(null);
    setOpening(false);
    setMessage("");
    setFullName("");
    setPhone("");
    setNetwork("");
    setRegion("");
    setCity("");
    setAddress("");
    setNote("");
    setClaimSubmitted(false);
    setSubmittingClaim(false);
  }

  const playing = selected === null && !result;
  const fulfillmentType = result?.prize?.fulfillmentType || null;

  const needsNetwork =
    fulfillmentType === "airtime" || fulfillmentType === "data";

  const needsDelivery =
    fulfillmentType === "food_delivery" ||
    fulfillmentType === "delivery";

  const needsVoucherDetails = fulfillmentType === "voucher";

  const claimRequired =
    Boolean(result?.won) &&
    Boolean(result?.claimRequired) &&
    fulfillmentType !== "wallet";

  return (
    <main className="min-h-screen bg-[#071A33] px-4 py-10 text-white">
      <div className="mx-auto max-w-4xl text-center">
        <div className="text-6xl">🎁</div>

        <h1 className="mt-4 text-4xl font-black text-[#4D94F5]">
          Fortuna Prize Vault
        </h1>

        <p className="mt-3 text-[#9AAAC1]">
          Choose one mystery vault for GH₵20 and reveal your result.
        </p>

        {message && (
          <div
            className={`mx-auto mt-6 max-w-xl rounded-2xl border p-4 ${
              claimSubmitted
                ? "border-green-400/30 bg-green-500/10 text-green-300"
                : "border-red-400/30 bg-red-500/10 text-red-300"
            }`}
          >
            {message}
          </div>
        )}

        {playing && (
          <>
            <div className="mx-auto mt-6 max-w-xl rounded-3xl border border-[#2A5688] bg-[#0B2545]/70 p-5 text-left">
              <h2 className="text-xl font-black text-[#66A7FF]">
                📋 How to Play
              </h2>

              <p className="mt-3 leading-7 text-[#B4C0D1]">
                Each play costs GH₵20. Choose one of the 12 mystery vaults.
                Your entry fee is deducted when you select a vault. If you win
                an item, airtime, data, food or voucher, submit the requested
                details so Fortuna Admin can fulfil your prize.
              </p>
            </div>

            <div className="mx-auto mt-5 max-w-xl rounded-3xl border border-[#2A5688] bg-[#3F82DD]/10 p-5">
              <p className="text-sm text-[#9AAAC1]">Entry Fee</p>

              <p className="mt-1 text-3xl font-black text-[#66A7FF]">
                GH₵20
              </p>

              <p className="mt-2 text-sm text-[#9AAAC1]">
                Possible prizes include smartphones, wigs, shopping vouchers,
                pizza, lunch, data, airtime, cash and surprise gifts.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {Array.from({ length: 12 }).map((_, index) => (
                <button
                  key={index}
                  disabled={selected !== null || opening}
                  onClick={() => void openVault(index)}
                  className={`group flex aspect-square flex-col items-center justify-center rounded-3xl border font-black transition ${
                    selected === index
                      ? "scale-105 border-blue-400 bg-[#3F82DD]/20"
                      : "border-[#2A5688] bg-[#0B2545]/70 hover:scale-105 hover:border-blue-400"
                  } disabled:cursor-not-allowed`}
                >
                  <span className="text-4xl transition group-hover:scale-110">
                    🎁
                  </span>

                  <span className="mt-2 text-sm text-[#9AAAC1]">
                    Vault {index + 1}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {opening && (
          <div className="mx-auto mt-10 max-w-xl rounded-3xl border border-[#32659D] bg-[#3F82DD]/10 p-8">
            <div className="animate-pulse text-7xl">🔓</div>

            <h2 className="mt-4 text-2xl font-black text-[#66A7FF]">
              Opening Vault {selected !== null ? selected + 1 : ""}...
            </h2>

            <p className="mt-3 text-[#9AAAC1]">
              Revealing your result.
            </p>
          </div>
        )}

        {result && !opening && (
          <div
            className={`mx-auto mt-10 max-w-xl rounded-3xl border p-6 sm:p-8 ${
              result.won
                ? "border-green-400/30 bg-green-500/10"
                : "border-[#32659D] bg-[#3F82DD]/10"
            }`}
          >
            <div className="text-7xl">
              {result.prize?.emoji || "🎁"}
            </div>

            <h2
              className={`mt-4 text-3xl font-black ${
                result.won ? "text-green-300" : "text-[#66A7FF]"
              }`}
            >
              {result.won ? "Congratulations!" : "Try Again"}
            </h2>

            <p className="mt-6 text-2xl font-black">
              {result.prize?.name}
            </p>

            {result.won && (
              <p className="mt-3 text-xl font-black text-[#FFE08A]">
                Prize Value: GH₵{Number(result.prize?.value || 0).toFixed(2)}
              </p>
            )}

            <p className="mt-3 text-[#9AAAC1]">
              {result.prize?.description}
            </p>

            {result.cashCredited && (
              <div className="mt-5 rounded-2xl border border-green-400/20 bg-[#071A33]/30 p-4">
                <p className="font-black text-green-300">
                  Cash credited automatically
                </p>

                <p className="mt-2 text-sm text-[#9AAAC1]">
                  GH₵{Number(result.prize?.value || 0).toFixed(2)} has been
                  added to your Fortuna wallet.
                </p>

                <Link
                  href="/wallet"
                  className="mt-4 inline-block rounded-xl bg-green-500 px-5 py-3 font-black text-black"
                >
                  View Wallet
                </Link>
              </div>
            )}

            {claimRequired && !claimSubmitted && (
              <div className="mt-6 rounded-2xl border border-[#38BDF8]/15 bg-[#071A33]/40 p-5 text-left">
                <h3 className="text-xl font-black text-[#66A7FF]">
                  Submit Prize Details
                </h3>

                {needsNetwork && (
                  <p className="mt-2 text-sm text-[#9AAAC1]">
                    Enter the phone number and network that should receive your{" "}
                    {fulfillmentType === "airtime" ? "airtime" : "data bundle"}.
                  </p>
                )}

                {fulfillmentType === "food_delivery" && (
                  <p className="mt-2 text-sm text-[#9AAAC1]">
                    Enter your full delivery details so Fortuna Admin can arrange
                    your food delivery.
                  </p>
                )}

                {fulfillmentType === "delivery" && (
                  <p className="mt-2 text-sm text-[#9AAAC1]">
                    Enter your full delivery details so Fortuna Admin can deliver
                    your prize.
                  </p>
                )}

                {needsVoucherDetails && (
                  <p className="mt-2 text-sm text-[#9AAAC1]">
                    Enter your name and phone number so Fortuna Admin can send or
                    arrange your voucher.
                  </p>
                )}

                {(needsDelivery || needsVoucherDetails) && (
                  <input
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Full name"
                    className="mt-4 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] p-4 outline-none focus:border-blue-500"
                  />
                )}

                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Phone number"
                  className="mt-3 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] p-4 outline-none focus:border-blue-500"
                />

                {needsNetwork && (
                  <select
                    value={network}
                    onChange={(event) => setNetwork(event.target.value)}
                    className="mt-3 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] p-4 outline-none focus:border-blue-500"
                  >
                    <option value="">Select network</option>
                    <option value="MTN">MTN</option>
                    <option value="Telecel">Telecel</option>
                    <option value="AirtelTigo">AirtelTigo</option>
                  </select>
                )}

                {needsDelivery && (
                  <>
                    <input
                      value={region}
                      onChange={(event) => setRegion(event.target.value)}
                      placeholder="Region"
                      className="mt-3 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] p-4 outline-none focus:border-blue-500"
                    />

                    <input
                      value={city}
                      onChange={(event) => setCity(event.target.value)}
                      placeholder="City or town"
                      className="mt-3 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] p-4 outline-none focus:border-blue-500"
                    />

                    <textarea
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      placeholder="Full delivery address and nearest landmark"
                      rows={4}
                      className="mt-3 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] p-4 outline-none focus:border-blue-500"
                    />
                  </>
                )}

                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Additional note (optional)"
                  rows={3}
                  className="mt-3 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] p-4 outline-none focus:border-blue-500"
                />

                <button
                  onClick={() => void submitClaim()}
                  disabled={submittingClaim}
                  className="mt-4 w-full rounded-xl bg-green-500 py-4 font-black text-black disabled:opacity-50"
                >
                  {submittingClaim
                    ? "Submitting..."
                    : "Submit Prize Claim"}
                </button>
              </div>
            )}

            {claimSubmitted && (
              <div className="mt-5 rounded-2xl border border-green-400/20 bg-[#071A33]/30 p-4">
                <p className="font-black text-green-300">
                  Prize claim submitted
                </p>

                <p className="mt-2 text-sm text-[#9AAAC1]">
                  Fortuna Admin can now see your details and process your prize.
                </p>
              </div>
            )}

            <button
              onClick={playAgain}
              disabled={claimRequired && !claimSubmitted}
              className="mt-6 w-full rounded-xl bg-[#3F82DD] py-4 font-black text-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              Play Again — GH₵20
            </button>

            {claimRequired && !claimSubmitted && (
              <p className="mt-3 text-xs text-[#8295B0]">
                Submit your prize details before playing again.
              </p>
            )}
          </div>
        )}

        <Link
          href="/skill-games"
          className="mt-8 inline-block rounded-xl border border-[#38BDF8]/15 bg-[#0B2545]/70 px-6 py-3 font-bold"
        >
          ← Back to Skill Games
        </Link>
      </div>
    </main>
  );
}
