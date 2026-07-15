"use client";

import AdminNav from "@/components/AdminNav";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading ticket...
      </main>
    );
  }

  if (!ticket) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8">
          {message}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <AdminNav />

        <Link
          href="/admin/support"
          className="font-bold text-pink-400"
        >
          ← Back to Support Tickets
        </Link>

        <div className="mt-6 rounded-3xl border border-pink-500/20 bg-white/5 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest ${
                ticket.issue_type.startsWith("Affiliate —")
                  ? "bg-green-500/20 text-green-300"
                  : "bg-pink-500/20 text-pink-300"
              }`}
            >
              {ticket.issue_type.startsWith("Affiliate —")
                ? "Affiliate"
                : "Player"}
            </span>

            <p className="text-sm font-bold uppercase tracking-widest text-pink-400">
              {ticket.issue_type.replace("Affiliate — ", "")}
            </p>
          </div>

          <h1 className="mt-3 text-4xl font-black text-pink-500">
            @{ticket.username || (ticket.issue_type.startsWith("Affiliate —") ? "Affiliate" : "Player")}
          </h1>

          <p className="mt-2 text-white/50">
            {new Date(ticket.created_at).toLocaleString()}
          </p>

          <p className="mt-4 text-xl font-black capitalize text-pink-300">
            Status: {ticket.status.replaceAll("_", " ")}
          </p>

          {ticket.reference && (
            <p className="mt-4 rounded-xl bg-black/60 p-4 font-bold text-pink-300">
              Reference: {ticket.reference}
            </p>
          )}

          <div className="mt-6 rounded-2xl bg-black/50 p-5">
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
                className="mt-5 inline-block rounded-xl bg-pink-500 px-5 py-3 font-black text-white"
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
              className="mt-3 w-full rounded-2xl border border-white/10 bg-black p-4 text-white outline-none focus:border-pink-500"
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              disabled={saving}
              onClick={() => void updateTicket("open")}
              className="rounded-xl bg-white/10 px-5 py-3 font-bold disabled:opacity-50"
            >
              Save as Open
            </button>

            <button
              disabled={saving}
              onClick={() => void updateTicket("in_progress")}
              className="rounded-xl bg-pink-500 px-5 py-3 font-bold text-white disabled:opacity-50"
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
            <p className="mt-5 rounded-xl bg-white/10 p-4">
              {message}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
