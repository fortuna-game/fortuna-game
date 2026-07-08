"use client";

import AdminNav from "@/components/AdminNav";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Ticket = {
  id: string;
  user_id: string;
  issue_type: string;
  username: string | null;
  reference: string | null;
  message: string;
  status: string;
  created_at: string;
};

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);

  async function getToken() {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || "";
  }

  async function loadTickets() {
    const token = await getToken();

    if (!token) {
      setDenied(true);
      setLoading(false);
      return;
    }

    const res = await fetch("/api/admin/support", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      setDenied(true);
      setLoading(false);
      return;
    }

    const data = await res.json();
    setTickets(data.tickets || []);
    setDenied(false);
    setLoading(false);
  }

  async function updateTicket(id: string, status: "open" | "in_progress" | "resolved") {
    setBusyId(id);
    setMessage("");

    const token = await getToken();

    const res = await fetch("/api/admin/support", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ id, status }),
    });

    const data = await res.json();
    setMessage(data.message || data.error || "Updated.");
    setBusyId("");

    await loadTickets();
  }

  useEffect(() => {
    void loadTickets();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading support tickets...
      </main>
    );
  }

  if (denied) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="rounded-3xl border border-red-400/20 bg-red-500/10 p-8 text-center">
          <h1 className="text-3xl font-black text-red-300">Access Denied</h1>
          <p className="mt-3 text-white/60">Login through /admin/login again.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <AdminNav />

        <h1 className="text-4xl font-black text-pink-500">Support Tickets</h1>
        <p className="mt-2 text-white/60">
          View and manage player support requests.
        </p>

        {message && (
          <p className="mt-5 rounded-xl bg-white/10 p-4 text-white">{message}</p>
        )}

        <div className="mt-8 grid gap-5">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="rounded-3xl border border-pink-500/20 bg-white/5 p-5"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-pink-400">
                    {ticket.issue_type}
                  </p>

                  <h2 className="mt-2 text-2xl font-black">
                    @{ticket.username || "Player"}
                  </h2>

                  <p className="mt-2 text-sm text-white/50">
                    {new Date(ticket.created_at).toLocaleString()}
                  </p>

                  {ticket.reference && (
                    <p className="mt-3 rounded-xl bg-black/50 p-3 text-sm font-bold text-pink-300">
                      Reference: {ticket.reference}
                    </p>
                  )}

                  <p className="mt-4 whitespace-pre-line text-white/80">
                    {ticket.message}
                  </p>
                </div>

                <div className="min-w-[220px] rounded-2xl border border-white/10 bg-black/40 p-4">
                  <p className="text-sm text-white/50">Status</p>
                  <p className="mt-1 text-xl font-black capitalize text-pink-400">
                    {ticket.status.replaceAll("_", " ")}
                  </p>

                  <div className="mt-4 grid gap-2">
                    <button
                      disabled={busyId === ticket.id}
                      onClick={() => void updateTicket(ticket.id, "open")}
                      className="rounded-xl bg-white/10 px-4 py-2 font-bold text-white disabled:opacity-50"
                    >
                      Open
                    </button>

                    <button
                      disabled={busyId === ticket.id}
                      onClick={() => void updateTicket(ticket.id, "in_progress")}
                      className="rounded-xl bg-pink-500 px-4 py-2 font-bold text-white disabled:opacity-50"
                    >
                      In Progress
                    </button>

                    <button
                      disabled={busyId === ticket.id}
                      onClick={() => void updateTicket(ticket.id, "resolved")}
                      className="rounded-xl bg-green-500 px-4 py-2 font-bold text-black disabled:opacity-50"
                    >
                      Resolved
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {tickets.length === 0 && (
            <p className="rounded-3xl border border-white/10 bg-white/5 p-8 text-white/60">
              No support tickets yet.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
