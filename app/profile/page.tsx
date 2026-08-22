"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Profile = {
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  phone: string | null;
  is_verified: boolean | null;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  const [editMode, setEditMode] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const [rgLoading, setRgLoading] = useState(true);
  const [rgSaving, setRgSaving] = useState(false);
  const [rgMessage, setRgMessage] = useState("");

  const [dailyLimit, setDailyLimit] = useState("");
  const [weeklyLimit, setWeeklyLimit] = useState("");

  const [dailySpent, setDailySpent] = useState(0);
  const [weeklySpent, setWeeklySpent] = useState(0);

  const [exclusionActive, setExclusionActive] = useState(false);
  const [exclusionUntil, setExclusionUntil] = useState<string | null>(null);
  const [permanentExclusion, setPermanentExclusion] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setEmail(user.email || "");

      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name, username, phone, is_verified")
        .eq("user_id", user.id)
        .maybeSingle();

      setProfile(data);

      setEditFirstName(data?.first_name || "");
      setEditLastName(data?.last_name || "");
      setEditUsername(data?.username || "");
      setEditPhone(data?.phone || "");

      setEditMode(
        !(
          data?.first_name?.trim() &&
          data?.last_name?.trim() &&
          data?.username?.trim() &&
          data?.phone?.trim()
        )
      );

      setLoading(false);
    }

    async function loadResponsibleGaming() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setRgLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/responsible-gaming", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error || "Could not load responsible gaming settings."
          );
        }

        setDailyLimit(
          data?.settings?.daily_spending_limit != null
            ? String(data.settings.daily_spending_limit)
            : ""
        );

        setWeeklyLimit(
          data?.settings?.weekly_spending_limit != null
            ? String(data.settings.weekly_spending_limit)
            : ""
        );

        setDailySpent(Number(data?.spending?.daily || 0));
        setWeeklySpent(Number(data?.spending?.weekly || 0));

        setExclusionActive(Boolean(data?.settings?.exclusion_active));
        setExclusionUntil(data?.settings?.self_exclusion_until || null);
        setPermanentExclusion(
          Boolean(data?.settings?.self_exclusion_permanent)
        );
      } catch (error) {
        setRgMessage(
          error instanceof Error
            ? error.message
            : "Could not load responsible gaming settings."
        );
      } finally {
        setRgLoading(false);
      }
    }

    void loadProfile();
    void loadResponsibleGaming();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#071A33] text-white">
        Loading profile...
      </main>
    );
  }

  async function updateResponsibleGaming(body: Record<string, unknown>) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setRgMessage("Please log in again.");
      return;
    }

    setRgSaving(true);
    setRgMessage("");

    try {
      const response = await fetch("/api/responsible-gaming", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Could not update responsible gaming settings."
        );
      }

      setRgMessage(data?.message || "Updated successfully.");

      // Refresh state.
      const refresh = await fetch("/api/responsible-gaming", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        cache: "no-store",
      });

      const refreshed = await refresh.json();

      setExclusionActive(
        Boolean(refreshed?.settings?.exclusion_active)
      );
      setExclusionUntil(
        refreshed?.settings?.self_exclusion_until || null
      );
      setPermanentExclusion(
        Boolean(refreshed?.settings?.self_exclusion_permanent)
      );
      setDailySpent(Number(refreshed?.spending?.daily || 0));
      setWeeklySpent(Number(refreshed?.spending?.weekly || 0));
    } catch (error) {
      setRgMessage(
        error instanceof Error
          ? error.message
          : "Could not update responsible gaming settings."
      );
    } finally {
      setRgSaving(false);
    }
  }

  async function saveLimits() {
    await updateResponsibleGaming({
      action: "set_limits",
      daily_spending_limit: dailyLimit,
      weekly_spending_limit: weeklyLimit,
    });
  }

  async function saveProfile() {
    const firstName = editFirstName.trim();
    const lastName = editLastName.trim();
    const username = editUsername.trim().toLowerCase();
    const phone = editPhone.trim();

    if (!firstName || !lastName || !username || !phone) {
      setSaveMessage(
        "First name, last name, username and phone number are required."
      );
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setSaveMessage("Please log in again.");
      return;
    }

    setSaveLoading(true);
    setSaveMessage("");

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          username,
          phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Could not update your profile.");
      }

      setProfile(data.profile);
      setEditFirstName(data.profile.first_name || "");
      setEditLastName(data.profile.last_name || "");
      setEditUsername(data.profile.username || "");
      setEditPhone(data.profile.phone || "");

      setEditMode(false);
      setSaveMessage("Profile updated successfully.");
    } catch (error) {
      setSaveMessage(
        error instanceof Error
          ? error.message
          : "Could not update your profile."
      );
    } finally {
      setSaveLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#071A33] px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-[#2A5688] bg-[#0B2545]/70 p-6 md:p-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-[#4D94F5]">
                Fortuna Play Account
              </p>

              <h1 className="mt-2 text-4xl font-black">
                @{profile?.username || "Player"}
              </h1>

              <p className="mt-2 text-[#8295B0]">
                Manage and view your account information.
              </p>
            </div>

            <span
              className={`w-fit rounded-full px-4 py-2 text-sm font-bold ${
                profile?.is_verified
                  ? "bg-[#3F82DD]/15 text-green-300"
                  : "bg-[#2C63B3]/15 text-[#66A7FF]"
              }`}
            >
              {profile?.is_verified ? "Verified Account" : "Not Verified"}
            </span>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#38BDF8]/15 bg-[#071A33]/40 p-5">
              <p className="text-sm text-[#7185A3]">Full Name</p>
              <p className="mt-2 font-bold">
                {[profile?.first_name, profile?.last_name]
                  .filter(Boolean)
                  .join(" ") || "Not provided"}
              </p>
            </div>

            <div className="rounded-2xl border border-[#38BDF8]/15 bg-[#071A33]/40 p-5">
              <p className="text-sm text-[#7185A3]">Username</p>
              <p className="mt-2 font-bold">
                @{profile?.username || "Player"}
              </p>
            </div>

            <div className="rounded-2xl border border-[#38BDF8]/15 bg-[#071A33]/40 p-5">
              <p className="text-sm text-[#7185A3]">Email Address</p>
              <p className="mt-2 break-all font-bold">
                {email || "Not provided"}
              </p>
            </div>

            <div className="rounded-2xl border border-[#38BDF8]/15 bg-[#071A33]/40 p-5">
              <p className="text-sm text-[#7185A3]">Phone Number</p>
              <p className="mt-2 font-bold">
                {profile?.phone || "Not provided"}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Link
              href="/dashboard"
              className="rounded-xl bg-[#3F82DD] py-3 text-center font-black text-black"
            >
              Dashboard
            </Link>

            <Link
              href="/wallet/history"
              className="rounded-xl border border-[#38BDF8]/15 bg-[#0B2545]/70 py-3 text-center font-bold"
            >
              Account History
            </Link>

            <Link
              href="/game-history"
              className="rounded-xl border border-[#38BDF8]/15 bg-[#0B2545]/70 py-3 text-center font-bold"
            >
              Game History
            </Link>
          </div>

          <section
            className={`mt-8 rounded-3xl border p-6 ${
              editMode
                ? "border-yellow-400/30 bg-yellow-400/5"
                : "border-white/10 bg-white/5"
            }`}
          >
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-yellow-300">
                  ACCOUNT INFORMATION
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  {editMode ? "Complete Your Profile" : "Profile Information"}
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#9AAAC1]">
                  {editMode
                    ? "Complete all required information before participating in paid games."
                    : "Keep your account information accurate and up to date."}
                </p>
              </div>

              {!editMode && (
                <button
                  type="button"
                  onClick={() => setEditMode(true)}
                  className="rounded-xl border border-white/10 bg-[#071A33] px-5 py-3 font-bold"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {editMode && (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="text-sm font-bold text-[#9AAAC1]">
                  First Name
                  <input
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#071A33] px-4 py-3 text-white outline-none focus:border-[#FFD54A]"
                    placeholder="First Name"
                  />
                </label>

                <label className="text-sm font-bold text-[#9AAAC1]">
                  Last Name
                  <input
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#071A33] px-4 py-3 text-white outline-none focus:border-[#FFD54A]"
                    placeholder="Last Name"
                  />
                </label>

                <label className="text-sm font-bold text-[#9AAAC1]">
                  Username
                  <input
                    value={editUsername}
                    onChange={(e) =>
                      setEditUsername(e.target.value.toLowerCase())
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#071A33] px-4 py-3 text-white outline-none focus:border-[#FFD54A]"
                    placeholder="Username"
                  />
                </label>

                <label className="text-sm font-bold text-[#9AAAC1]">
                  Phone Number
                  <input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#071A33] px-4 py-3 text-white outline-none focus:border-[#FFD54A]"
                    placeholder="Phone Number"
                  />
                </label>

                <div className="md:col-span-2 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => void saveProfile()}
                    disabled={saveLoading}
                    className="rounded-xl bg-[#FFD54A] px-6 py-3 font-black text-black disabled:opacity-40"
                  >
                    {saveLoading ? "Saving..." : "Save Profile"}
                  </button>

                  {profile?.first_name &&
                    profile?.last_name &&
                    profile?.username &&
                    profile?.phone && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditMode(false);
                          setSaveMessage("");
                        }}
                        className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-bold"
                      >
                        Cancel
                      </button>
                    )}
                </div>

                {saveMessage && (
                  <div className="md:col-span-2 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-[#C4CFDE]">
                    {saveMessage}
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="mt-8 rounded-3xl border border-green-400/20 bg-green-500/5 p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-green-300">
                  PLAYER WELLBEING
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  Responsible Gaming
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#9AAAC1]">
                  Set spending limits and take a break when you need one.
                  These controls apply to paid Lucky Draw entries.
                </p>
              </div>

              <Link
                href="/responsible-gaming"
                className="rounded-xl border border-green-400/20 px-4 py-2 text-sm font-bold text-green-300"
              >
                Learn More
              </Link>
            </div>

            {rgLoading ? (
              <p className="mt-6 text-sm text-[#8295B0]">
                Loading your responsible gaming settings...
              </p>
            ) : (
              <>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-[#071A33]/50 p-5">
                    <p className="text-xs font-bold uppercase text-[#7185A3]">
                      Today
                    </p>

                    <p className="mt-2 text-2xl font-black">
                      GH₵{dailySpent.toFixed(2)}
                    </p>

                    <p className="mt-1 text-xs text-[#8295B0]">
                      {dailyLimit
                        ? `Limit: GH₵${Number(dailyLimit).toFixed(2)}`
                        : "No daily limit set"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-[#071A33]/50 p-5">
                    <p className="text-xs font-bold uppercase text-[#7185A3]">
                      This Week
                    </p>

                    <p className="mt-2 text-2xl font-black">
                      GH₵{weeklySpent.toFixed(2)}
                    </p>

                    <p className="mt-1 text-xs text-[#8295B0]">
                      {weeklyLimit
                        ? `Limit: GH₵${Number(weeklyLimit).toFixed(2)}`
                        : "No weekly limit set"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-[#071A33]/50 p-5">
                    <h3 className="font-black">Spending Limits</h3>

                    <div className="mt-4 grid gap-3">
                      <label className="text-sm font-bold text-[#9AAAC1]">
                        Daily limit
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={dailyLimit}
                          onChange={(e) => setDailyLimit(e.target.value)}
                          disabled={exclusionActive || rgSaving}
                          placeholder="e.g. 100"
                          className="mt-2 w-full rounded-xl border border-white/10 bg-[#071A33] px-4 py-3 text-white outline-none focus:border-[#FFD54A] disabled:opacity-50"
                        />
                      </label>

                      <label className="text-sm font-bold text-[#9AAAC1]">
                        Weekly limit
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={weeklyLimit}
                          onChange={(e) => setWeeklyLimit(e.target.value)}
                          disabled={exclusionActive || rgSaving}
                          placeholder="e.g. 300"
                          className="mt-2 w-full rounded-xl border border-white/10 bg-[#071A33] px-4 py-3 text-white outline-none focus:border-[#FFD54A] disabled:opacity-50"
                        />
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={saveLimits}
                      disabled={exclusionActive || rgSaving}
                      className="mt-4 w-full rounded-xl bg-[#FFD54A] px-5 py-3 font-black text-black disabled:opacity-40"
                    >
                      {rgSaving ? "Saving..." : "Save Spending Limits"}
                    </button>
                  </div>

                  <div className="rounded-2xl border border-yellow-400/15 bg-yellow-400/5 p-5">
                    <h3 className="font-black">Take a Break</h3>

                    {exclusionActive ? (
                      <div className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 p-4">
                        <p className="font-black text-red-300">
                          {permanentExclusion
                            ? "Permanent Self-Exclusion Active"
                            : "Responsible Gaming Break Active"}
                        </p>

                        {!permanentExclusion && exclusionUntil && (
                          <p className="mt-2 text-xs text-[#C4CFDE]">
                            Until{" "}
                            {new Date(exclusionUntil).toLocaleString()}
                          </p>
                        )}

                        <p className="mt-2 text-xs leading-5 text-white/50">
                          Paid Lucky Draw purchases are blocked while this
                          restriction is active.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-4 grid gap-2">
                        <button
                          type="button"
                          disabled={rgSaving}
                          onClick={() =>
                            updateResponsibleGaming({
                              action: "take_break",
                              hours: 24,
                            })
                          }
                          className="rounded-xl border border-white/10 bg-[#071A33] px-4 py-3 text-left text-sm font-bold hover:border-yellow-400/40 disabled:opacity-40"
                        >
                          24 hours
                        </button>

                        <button
                          type="button"
                          disabled={rgSaving}
                          onClick={() =>
                            updateResponsibleGaming({
                              action: "take_break",
                              hours: 168,
                            })
                          }
                          className="rounded-xl border border-white/10 bg-[#071A33] px-4 py-3 text-left text-sm font-bold hover:border-yellow-400/40 disabled:opacity-40"
                        >
                          7 days
                        </button>

                        <button
                          type="button"
                          disabled={rgSaving}
                          onClick={() =>
                            updateResponsibleGaming({
                              action: "take_break",
                              hours: 720,
                            })
                          }
                          className="rounded-xl border border-white/10 bg-[#071A33] px-4 py-3 text-left text-sm font-bold hover:border-yellow-400/40 disabled:opacity-40"
                        >
                          30 days
                        </button>

                        <button
                          type="button"
                          disabled={rgSaving}
                          onClick={() => {
                            if (
                              window.confirm(
                                "Permanent self-exclusion will block paid Lucky Draw purchases permanently. Continue?"
                              )
                            ) {
                              void updateResponsibleGaming({
                                action: "permanent_exclusion",
                              });
                            }
                          }}
                          className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-left text-sm font-black text-red-300 disabled:opacity-40"
                        >
                          Permanent Self-Exclusion
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {rgMessage && (
                  <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-[#C4CFDE]">
                    {rgMessage}
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
