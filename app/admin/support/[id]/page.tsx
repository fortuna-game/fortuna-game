"use client";

import AdminNav from "@/components/AdminNav";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Affiliate = {
  id: string;
  full_name?: string | null;
  phone?: string | null;
  email?: string | null;
  referral_code?: string | null;
  payment_method?: string | null;
  momo_number?: string | null;
  momo_network?: string | null;
  bank_name?: string | null;
  bank_account_name?: string | null;
  bank_account_number?: string | null;
};

type AffiliateStats = {
  totalReferrals: number;
  qualifiedReferrals: number;
  totalEarnings: number;
  availableBalance: number;
  pendingWithdrawals: number;
};

type Ticket = {
  id: string;
  issue_type: string;
  username: string | null;
  reference: string | null;
  message: string;
  status: string;
  admin_reply: string | null;
  replied_at: string | null;
  screenshot_url: string | null;
  created_at: string;
};

export default function AdminTicketDetailPage() {
  const params = useParams();
  const id = String(params.id);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [affiliateStats, setAffiliateStats] =
    useState<AffiliateStats | null>(null);
  const [reply, setReply] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function getToken() {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || "";
  }

  async function loadTicket() {
    const token = await getToken();

    if (!token) {
      setMessage("Admin login required.");
      setLoading(false);
      return;
    }

    const res = await fetch(`/api/admin/support/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Could not load ticket.");
      setLoading(false);
      return;
    }

    setTicket(data.ticket);
    setAffiliate(data.affiliate || null);
    setAffiliateStats(data.affiliateStats || null);
    setReply(data.ticket.admin_reply || "");
    setLoading(false);
  }

  async function updateTicket(status: "open" | "in_progress" | "resolved") {
    setSaving(true);
    setMessage("");

    const token = await getToken();

    const res = await fetch(`/api/admin/support/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status,
        admin_reply: reply,
      }),
    });

    const data = await res.json();

    setMessage(
      data.message ||
      data.error ||
      "Ticket update finished."
    );

    setSaving(false);

    if (res.ok) {
      await loadTicket();
    }
  }

  useEffect(() => {
    void loadTicket();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#071A33] text-white">
        Loading ticket...
      </main>
    );
  }

  if (!ticket) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#071A33] px-6 text-white">
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8">
          {message}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#071A33] px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <AdminNav />

        <Link
          href="/admin/support"
          className="font-bold text-[#66A7FF]"
        >
          ← Back to Support Tickets
        </Link>

        <div className="mt-6 rounded-3xl border border-[#2A5688] bg-[#0B2545]/70 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest ${
                ticket.issue_type.startsWith("Affiliate —")
                  ? "bg-green-500/20 text-green-300"
                  : "bg-[#3F82DD]/20 text-blue-300"
              }`}
            >
              {ticket.issue_type.startsWith("Affiliate —")
                ? "Affiliate"
                : "Player"}
            </span>

            <p className="text-sm font-bold uppercase tracking-widest text-[#66A7FF]">
              {ticket.issue_type.replace("Affiliate — ", "")}
            </p>
          </div>

          <h1 className="mt-3 text-4xl font-black text-[#4D94F5]">
            @{ticket.username || (ticket.issue_type.startsWith("Affiliate —") ? "Affiliate" : "Player")}
          </h1>

          <p className="mt-2 text-[#8295B0]">
            {new Date(ticket.created_at).toLocaleString()}
          </p>

          <p className="mt-4 text-xl font-black capitalize text-blue-300">
            Status: {ticket.status.replaceAll("_", " ")}
          </p>

          {ticket.reference && (
            <p className="mt-4 rounded-xl bg-[#071A33]/60 p-4 font-bold text-blue-300">
              Reference: {ticket.reference}
            </p>
          )}

          {ticket.issue_type.startsWith("Affiliate —") && (
            <div className="mt-6 rounded-3xl border border-green-500/20 bg-green-500/10 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black uppercase tracking-widest text-green-400">
                    Affiliate Information
                  </p>

                  <h2 className="mt-2 text-2xl font-black text-white">
                    {affiliate?.full_name || ticket.username || "Affiliate"}
                  </h2>
                </div>

                {affiliate?.referral_code && (
                  <span className="rounded-full bg-green-500 px-4 py-2 text-sm font-black text-black">
                    {affiliate.referral_code}
                  </span>
                )}
              </div>

              {affiliate ? (
                <>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl bg-[#071A33]/40 p-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-[#7185A3]">
                        Phone Number
                      </p>
                      <p className="mt-2 font-black text-white">
                        {affiliate.phone || "Not provided"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#071A33]/40 p-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-[#7185A3]">
                        Email Address
                      </p>
                      <p className="mt-2 break-all font-black text-white">
                        {affiliate.email || "Not provided"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#071A33]/40 p-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-[#7185A3]">
                        Payment Method
                      </p>
                      <p className="mt-2 font-black capitalize text-white">
                        {affiliate.payment_method || "Not provided"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-[#071A33]/40 p-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-[#7185A3]">
                        Payment Details
                      </p>
                      <p className="mt-2 font-black text-white">
                        {affiliate.payment_method === "momo"
                          ? `${affiliate.momo_network || ""} ${
                              affiliate.momo_number || ""
                            }`.trim() || "Not provided"
                          : affiliate.payment_method === "bank"
                            ? `${affiliate.bank_name || ""} ${
                                affiliate.bank_account_number || ""
                              }`.trim() || "Not provided"
                            : "Not provided"}
                      </p>
                    </div>
                  </div>

                  {affiliateStats && (
                    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                      <div className="rounded-2xl border border-[#38BDF8]/15 bg-[#071A33]/50 p-4">
                        <p className="text-xs font-bold uppercase text-[#7185A3]">
                          Total Referrals
                        </p>
                        <p className="mt-2 text-2xl font-black text-white">
                          {affiliateStats.totalReferrals}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-[#38BDF8]/15 bg-[#071A33]/50 p-4">
                        <p className="text-xs font-bold uppercase text-[#7185A3]">
                          Qualified
                        </p>
                        <p className="mt-2 text-2xl font-black text-green-400">
                          {affiliateStats.qualifiedReferrals}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-[#38BDF8]/15 bg-[#071A33]/50 p-4">
                        <p className="text-xs font-bold uppercase text-[#7185A3]">
                          Total Earnings
                        </p>
                        <p className="mt-2 text-2xl font-black text-green-400">
                          GH₵{affiliateStats.totalEarnings.toFixed(2)}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-[#38BDF8]/15 bg-[#071A33]/50 p-4">
                        <p className="text-xs font-bold uppercase text-[#7185A3]">
                          Available
                        </p>
                        <p className="mt-2 text-2xl font-black text-green-400">
                          GH₵{affiliateStats.availableBalance.toFixed(2)}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-[#38BDF8]/15 bg-[#071A33]/50 p-4">
                        <p className="text-xs font-bold uppercase text-[#7185A3]">
                          Pending Withdrawal
                        </p>
                        <p className="mt-2 text-2xl font-black text-[#FFE08A]">
                          GH₵{affiliateStats.pendingWithdrawals.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="mt-4 rounded-2xl bg-[#071A33]/40 p-4 text-[#9AAAC1]">
                  The affiliate profile could not be loaded for this ticket.
                </p>
              )}
            </div>
          )}

          <div className="mt-6 rounded-2xl bg-[#071A33]/50 p-5">
            <h2 className="font-black">
              {ticket.issue_type.startsWith("Affiliate —")
                ? "Affiliate Message"
                : "Player Message"}
            </h2>

            <p className="mt-3 whitespace-pre-line text-white/80">
              {ticket.message}
            </p>

            {ticket.screenshot_url && (
              <a
                href={ticket.screenshot_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-block rounded-xl bg-[#3F82DD] px-5 py-3 font-black text-white"
              >
                View User Screenshot
              </a>
            )}
          </div>

          <div className="mt-6">
            <label className="font-black">
              Admin Reply / Update
            </label>

            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={7}
              placeholder="Write your reply or update..."
              className="mt-3 w-full rounded-2xl border border-[#38BDF8]/15 bg-[#071A33] p-4 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              disabled={saving}
              onClick={() => void updateTicket("open")}
              className="rounded-xl bg-[#0F2F57]/80 px-5 py-3 font-bold disabled:opacity-50"
            >
              Save as Open
            </button>

            <button
              disabled={saving}
              onClick={() => void updateTicket("in_progress")}
              className="rounded-xl bg-[#3F82DD] px-5 py-3 font-bold text-white disabled:opacity-50"
            >
              Save as In Progress
            </button>

            <button
              disabled={saving}
              onClick={() => void updateTicket("resolved")}
              className="rounded-xl bg-green-500 px-5 py-3 font-bold text-black disabled:opacity-50"
            >
              Save as Resolved
            </button>
          </div>

          {message && (
            <p className="mt-5 rounded-xl bg-[#0F2F57]/80 p-4">
              {message}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
