"use client";



import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type PrizeType =
  | "cash"
  | "rent"
  | "physical"
  | "grocery"
  | "other";
function normalizePrizeMedia(
  media: any
): Array<{ type: "image" | "video"; url: string }> {
  if (!Array.isArray(media)) return [];

  return media
    .map((item: any) => {
      if (typeof item === "string") {
        const lower = item.toLowerCase();

        return {
          type:
            lower.includes(".mp4") ||
            lower.includes(".webm") ||
            lower.includes(".mov") ||
            lower.includes(".m4v")
              ? "video"
              : "image",
          url: item,
        };
      }

      if (
        item &&
        typeof item.url === "string" &&
        (item.type === "image" || item.type === "video")
      ) {
        return item;
      }

      return null;
    })
    .filter(Boolean) as Array<{
    type: "image" | "video";
    url: string;
  }>;
}

export default function AdminLuckyDrawPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [draws, setDraws] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [prizeType, setPrizeType] = useState<PrizeType | "">("");
  const [prizeAmount, setPrizeAmount] = useState("");
  const [prizeValue, setPrizeValue] = useState("");
  const [prizeDescription, setPrizeDescription] = useState("");
  const [prizeImage, setPrizeImage] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<File[]>([]);
  const [prizeMedia, setPrizeMedia] = useState<
    Array<{ type: "image" | "video"; url: string }>
  >([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [ticketPrice, setTicketPrice] = useState("");
  const [rules, setRules] = useState("");
  const [winnerCount, setWinnerCount] = useState("1");
  const [maxEntries, setMaxEntries] = useState("");
  const [durationDays, setDurationDays] = useState("1");
  const [startsAt, setStartsAt] = useState("");
  const [selectionAt, setSelectionAt] = useState("");
  const [scheduleMode, setScheduleMode] = useState<"upcoming" | "now">("upcoming");
  const [creating, setCreating] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [selectingWinner, setSelectingWinner] = useState<string | null>(null);
  const [selectedWinner, setSelectedWinner] = useState<any | null>(null);

  const [editingDraw, setEditingDraw] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrizeType, setEditPrizeType] =
    useState<PrizeType>("cash");
  const [editPrizeAmount, setEditPrizeAmount] = useState("");
  const [editPrizeValue, setEditPrizeValue] = useState("");
  const [editPrizeDescription, setEditPrizeDescription] =
    useState("");
  const [editPrizeImage, setEditPrizeImage] = useState("");
  const [editSelectedMedia, setEditSelectedMedia] = useState<File[]>([]);
  const [editPrizeMedia, setEditPrizeMedia] = useState<
    Array<{ type: "image" | "video"; url: string }>
  >([]);
  const [editRules, setEditRules] = useState("");
  const [editWinnerCount, setEditWinnerCount] = useState("1");
  const [editMaxEntries, setEditMaxEntries] = useState("");
  const [editDurationDays, setEditDurationDays] = useState("1");
  const [editStartsAt, setEditStartsAt] = useState("");
  const [editSelectionAt, setEditSelectionAt] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [claims, setClaims] = useState<any[]>([]);
  const [loadingClaims, setLoadingClaims] = useState(false);
  const [updatingClaimId, setUpdatingClaimId] = useState<string | null>(null);

  async function getSession() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session;
  }

  async function loadData() {
    const session = await getSession();

    if (!session) {
      setMessage("Admin login required.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `/api/admin/lucky-draw?t=${Date.now()}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          cache: "no-store",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Could not load Lucky Draw.");
        return;
      }

      setTickets(data.tickets || []);
      setDraws(data.draws || []);
      setTotalRevenue(Number(data.totalRevenue || 0));
    } catch {
      setMessage("Could not load Lucky Draw.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();

    const interval = window.setInterval(() => {
      void loadData();
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  const isAutoPaidPrize =
    prizeType === "cash" || prizeType === "rent";

  const isEditAutoPaidPrize =
    editPrizeType === "cash" || editPrizeType === "rent";

  async function uploadPrizeMedia(file: File) {
    setUploadingImage(true);
    setMessage("");

    try {
      const session = await getSession();

      if (!session) {
        setMessage("Admin login required.");
        return "";
      }

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        "/api/admin/lucky-draw/upload-image",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      const responseText = await res.text();

      let data: any = {};

      try {
        data = JSON.parse(responseText);
      } catch {
        console.error(
          "UPLOAD IMAGE RAW RESPONSE:",
          responseText
        );
        setMessage(
          `Image upload failed (${res.status}): ${responseText.slice(
            0,
            200
          )}`
        );
        return "";
      }

      if (!res.ok) {
        setMessage(data.error || "Could not upload image.");
        return "";
      }

      return data.url || "";
    } catch (error) {
      console.error("UPLOAD IMAGE ERROR:", error);
      setMessage("Could not upload image.");
      return "";
    } finally {
      setUploadingImage(false);
    }
  }

  function setStartNow() {
    const now = new Date();
    now.setSeconds(0, 0);

    const localValue =
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-` +
      `${String(now.getDate()).padStart(2, "0")}T` +
      `${String(now.getHours()).padStart(2, "0")}:` +
      `${String(now.getMinutes()).padStart(2, "0")}`;

    setStartsAt(localValue);
  }

  function cancelCreateDraw() {
    setTitle("");
    setPrizeType("");
    setPrizeAmount("");
    setPrizeValue("");
    setPrizeDescription("");
    setPrizeImage("");
    setSelectedMedia([]);
    setTicketPrice("");
    setRules("");
    setWinnerCount("1");
    setMaxEntries("");
    setStartsAt("");
    setSelectionAt("");
    setScheduleMode("upcoming");
    setMessage("");
  }

  async function createDraw() {
    setMessage("");

    const ticket = Number(ticketPrice);
    const amount = Number(prizeAmount || 0);
    const value = Number(prizeValue || 0);
    const winners = Number(winnerCount);

    let uploadedImageUrl = prizeImage;
    let uploadedMedia = [...prizeMedia];

    if (selectedMedia.length > 0) {
      setUploadingImage(true);

      try {
        const results: Array<{
          type: "image" | "video";
          url: string;
        }> = [];

        for (const file of selectedMedia) {
          const uploaded = await uploadPrizeMedia(file);

          if (!uploaded) return;

          results.push(uploaded);
        }

        uploadedMedia = results;
      } finally {
        setUploadingImage(false);
      }

      setPrizeMedia(uploadedMedia);

      const firstMedia =
        uploadedMedia.find((item) => item.type === "image") ||
        uploadedMedia[0];

      uploadedImageUrl = firstMedia?.url || uploadedImageUrl;
    }

    if (!title.trim()) {
      setMessage("Enter a prize title.");
      return;
    }

    if (!Number.isFinite(ticket) || ticket <= 0) {
      setMessage("Enter a valid ticket price.");
      return;
    }

    if (!Number.isInteger(winners) || winners < 1) {
      setMessage("Number of winners must be at least 1.");
      return;
    }

    if (!startsAt) {
      setMessage("Select the draw start date and time.");
      return;
    }

    if (!selectionAt) {
      setMessage("Select the winner selection date and time.");
      return;
    }

    const startDate = new Date(startsAt);
    const selectionDate = new Date(selectionAt);

    const finalDurationDays = Number(durationDays);

    if (
      !Number.isInteger(finalDurationDays) ||
      finalDurationDays < 1
    ) {
      setMessage("Duration must be a whole number of days greater than 0.");
      return;
    }

    const calculatedEndDate = new Date(startDate);
    calculatedEndDate.setDate(
      calculatedEndDate.getDate() + finalDurationDays
    );

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(selectionDate.getTime())
    ) {
      setMessage("Enter valid draw dates and times.");
      return;
    }

    if (calculatedEndDate <= startDate) {
      setMessage("Draw end time must be after the draw start time.");
      return;
    }

    if (selectionDate < calculatedEndDate) {
      setMessage(
        "Winner selection time must be at or after the draw end time."
      );
      return;
    }

    if (
      isAutoPaidPrize &&
      (!Number.isFinite(amount) || amount <= 0)
    ) {
      setMessage("Enter a valid cash or rent prize amount.");
      return;
    }

    if (
      !isAutoPaidPrize &&
      (!Number.isFinite(value) || value <= 0)
    ) {
      setMessage("Enter the estimated value of the prize.");
      return;
    }

    const confirmed = window.confirm(
      `Create this Lucky Draw?

Prize: ${title}
Type: ${prizeType}
Ticket: GH₵${ticket.toFixed(2)}
Winners: ${winners}
Starts: ${startDate.toLocaleString()}
Selection: ${selectionDate.toLocaleString()}`
    );

    if (!confirmed) return;

    setCreating(true);

    try {
      const session = await getSession();

      if (!session) {
        setMessage("Admin login required.");
        return;
      }

      const res = await fetch(
        "/api/admin/lucky-draw/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            title: title.trim(),
            prizeType,
            prizeAmount: isAutoPaidPrize ? amount : 0,
            prizeValue: isAutoPaidPrize ? amount : value,
            prizeDescription: prizeDescription.trim(),
            prizeImage: uploadedImageUrl.trim(),
            prizeMedia: uploadedMedia,
            ticketPrice: ticket,
            rules: rules.trim(),
            winnerCount: winners,
            maxEntries:
              maxEntries.trim() === ""
                ? null
                : Number(maxEntries),
            startsAt: startDate.toISOString(),
            endsAt: calculatedEndDate.toISOString(),
            durationDays: finalDurationDays,
            selectionAt: selectionDate.toISOString(),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(
          data.error || "Could not create Lucky Draw."
        );
        return;
      }

      setTitle("");
      setPrizeType("");
      setPrizeAmount("");
      setPrizeValue("");
      setPrizeDescription("");
      setPrizeImage("");
      setSelectedMedia([]);
      setPrizeMedia([]);
      setTicketPrice("");
      setRules("");
      setWinnerCount("1");
      setStartsAt("");
      setSelectionAt("");
      setScheduleMode("upcoming");
      setMessage("🎉 New Lucky Draw created successfully.");

      await loadData();
    } catch {
      setMessage("Could not create Lucky Draw.");
    } finally {
      setCreating(false);
    }
  }

  function toDateTimeLocal(value: string | null | undefined) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);

    return localDate.toISOString().slice(0, 16);
  }

  async function selectNextWinner(draw: any) {
    setMessage("");
    setSelectedWinner(null);
    setSelectingWinner(draw.id);

    try {
      const session = await getSession();

      if (!session) {
        setMessage("Admin login required.");
        return;
      }

      const res = await fetch(
        "/api/admin/lucky-draw/select-next-winner",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            drawId: draw.id,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Could not select winner.");
        return;
      }

      if (data.winner) {
        setSelectedWinner({
          ...data.winner,
          drawTitle: draw.title,
          prizeDescription:
            draw.prize_description ||
            draw.prize_type ||
            "Lucky Draw Prize",
          winnerCount: draw.winner_count || 1,
        });

        setMessage(
          `Winner ${data.winner.winner_position} selected successfully.`
        );
      }

      await loadData();
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong while selecting the winner.");
    } finally {
      setSelectingWinner(null);
    }
  }

  function startEdit(draw: any) {
    setEditingDraw(draw);
    setEditTitle(draw.title || "");
    setEditPrizeType(draw.prize_type || "cash");
    setEditPrizeAmount(
      String(draw.prize_amount ?? "")
    );
    setEditPrizeValue(
      String(draw.prize_value ?? draw.prize_amount ?? "")
    );
    setEditPrizeDescription(
      draw.prize_description || ""
    );
    setEditPrizeImage(draw.prize_image || "");
    setEditSelectedMedia([]);

    const existingPrizeMedia =
      normalizePrizeMedia(draw.prize_media);

    setEditPrizeMedia(
      existingPrizeMedia.length > 0
        ? existingPrizeMedia
        : draw.prize_image
        ? [
            {
              type: "image",
              url: draw.prize_image,
            },
          ]
        : []
    );

    setEditRules(draw.rules || "");
    setEditWinnerCount(String(draw.winner_count || 1));
    setEditMaxEntries(
      draw.max_entries == null
        ? ""
        : String(draw.max_entries)
    );

    const existingDuration =
      draw.duration_days != null
        ? Number(draw.duration_days)
        : draw.starts_at && draw.ends_at
        ? Math.max(
            1,
            Math.ceil(
              (new Date(draw.ends_at).getTime() -
                new Date(draw.starts_at).getTime()) /
                86400000
            )
          )
        : 1;

    setEditDurationDays(String(existingDuration));
    setEditStartsAt(toDateTimeLocal(draw.starts_at));
    setEditSelectionAt(toDateTimeLocal(draw.selection_at));
    setMessage("");
  }

  function cancelEdit() {
    setEditingDraw(null);
    setEditTitle("");
    setEditPrizeType("cash");
    setEditPrizeAmount("");
    setEditPrizeValue("");
    setEditPrizeDescription("");
    setEditPrizeImage("");
    setEditSelectedMedia([]);
    setEditPrizeMedia([]);
    setEditRules("");
    setEditWinnerCount("1");
    setEditMaxEntries("");
    setEditDurationDays("1");
    setEditStartsAt("");
    setEditSelectionAt("");
  }

  async function saveEdit() {
    if (!editingDraw) return;

    setMessage("");

    const amount = Number(editPrizeAmount || 0);
    const value = Number(editPrizeValue || 0);
    const winners = Number(editWinnerCount);

    if (!editTitle.trim()) {
      setMessage("Enter a prize title.");
      return;
    }

    if (!Number.isInteger(winners) || winners < 1) {
      setMessage("Number of winners must be at least 1.");
      return;
    }

    if (!editStartsAt || !editSelectionAt) {
      setMessage(
        "Select both the draw start time and winner selection time."
      );
      return;
    }

    const startDate = new Date(editStartsAt);
    const selectionDate = new Date(editSelectionAt);

    const finalDurationDays = Number(editDurationDays);

    if (
      !Number.isInteger(finalDurationDays) ||
      finalDurationDays < 1
    ) {
      setMessage("Duration must be a whole number of days greater than 0.");
      return;
    }

    const calculatedEndDate = new Date(startDate);
    calculatedEndDate.setDate(
      calculatedEndDate.getDate() + finalDurationDays
    );

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(selectionDate.getTime())
    ) {
      setMessage("Enter valid draw dates and times.");
      return;
    }

    if (calculatedEndDate <= startDate) {
      setMessage("Draw end time must be after the draw start time.");
      return;
    }

    if (selectionDate < calculatedEndDate) {
      setMessage(
        "Winner selection time must be at or after the draw end time."
      );
      return;
    }

    if (
      isEditAutoPaidPrize &&
      (!Number.isFinite(amount) || amount <= 0)
    ) {
      setMessage("Enter a valid cash or rent prize amount.");
      return;
    }

    if (
      !isEditAutoPaidPrize &&
      (!Number.isFinite(value) || value <= 0)
    ) {
      setMessage("Enter a valid prize value.");
      return;
    }

    const confirmed = window.confirm(
      `Save changes to this Lucky Draw?

Prize: ${editTitle}
Type: ${editPrizeType}`
    );

    if (!confirmed) return;

    setSavingEdit(true);

    try {
      let uploadedImageUrl = editPrizeImage;
      let uploadedMedia = [...editPrizeMedia];

      if (editSelectedMedia.length > 0) {
        setUploadingImage(true);

        try {
          const results: Array<{
            type: "image" | "video";
            url: string;
          }> = [];

          for (const file of editSelectedMedia) {
            const uploaded = await uploadPrizeMedia(file);

            if (!uploaded) return;

            results.push(uploaded);
          }

          uploadedMedia = [
            ...uploadedMedia,
            ...results,
          ];
        } finally {
          setUploadingImage(false);
        }

        const firstMedia =
          uploadedMedia.find((item) => item.type === "image") ||
          uploadedMedia[0];

        uploadedImageUrl = firstMedia?.url || uploadedImageUrl;
      }

      const session = await getSession();

      if (!session) {
        setMessage("Admin login required.");
        return;
      }

      const res = await fetch(
        "/api/admin/lucky-draw/edit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            id: editingDraw.id,
            title: editTitle.trim(),
            prizeType: editPrizeType,
            prizeAmount: isEditAutoPaidPrize
              ? amount
              : 0,
            prizeValue: isEditAutoPaidPrize
              ? amount
              : value,
            prizeDescription:
              editPrizeDescription.trim(),
            prizeImage: uploadedImageUrl.trim(),
            prizeMedia: uploadedMedia,
            rules: editRules.trim(),
            winnerCount: winners,
            maxEntries:
              editMaxEntries.trim() === ""
                ? null
                : Number(editMaxEntries),
            startsAt: startDate.toISOString(),
            endsAt: calculatedEndDate.toISOString(),
            durationDays: finalDurationDays,
            selectionAt: selectionDate.toISOString(),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(
          data.error || "Could not update Lucky Draw."
        );
        return;
      }

      setMessage("✅ Lucky Draw updated successfully.");
      cancelEdit();
      await loadData();
    } catch {
      setMessage("Could not update Lucky Draw.");
    } finally {
      setSavingEdit(false);
    }
  }

  function runAgain(draw: any) {
    setEditingDraw(null);

    setTitle(String(draw.title || ""));
    setPrizeType((draw.prize_type || "") as PrizeType | "");
    setPrizeAmount(
      draw.prize_type === "cash"
        ? String(draw.prize_amount ?? "")
        : ""
    );
    setPrizeValue(String(draw.prize_value ?? ""));
    setPrizeDescription(String(draw.prize_description || ""));
    setPrizeImage(String(draw.prize_image || ""));
    setSelectedMedia([]);
    setPrizeMedia([]);
    setTicketPrice(String(draw.ticket_price ?? ""));
    setRules(String(draw.rules || ""));
    setWinnerCount(String(draw.winner_count || 1));

    // New draw = new schedule and zero old tickets.
    setStartsAt("");
    setSelectionAt("");
    setScheduleMode("upcoming");

    setMessage(
      "✅ Draw copied. Choose new start and winner-selection times, then create the new draw."
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function updateDrawStatus(
    drawId: string,
    newStatus: "open" | "paused" | "suspended" | "cancelled"
  ) {
    const labels = {
      open: "resume",
      paused: "pause",
      suspended: "suspend",
      cancelled: "cancel",
    };

    let cancelReason = "";

    if (newStatus === "cancelled") {
      cancelReason = window.prompt(
        "Why are you cancelling this Lucky Draw?\n\nExample: Insufficient participation",
        "Insufficient participation"
      ) || "";

      if (!cancelReason.trim()) return;
    }

    const confirmed = window.confirm(
      newStatus === "cancelled"
        ? `Cancel this Lucky Draw?\n\nReason: ${cancelReason}`
        : `Are you sure you want to ${labels[newStatus]} this Lucky Draw?`
    );

    if (!confirmed) return;

    setMessage("");

    try {
      const session = await getSession();

      if (!session) {
        setMessage("Admin login required.");
        return;
      }

      const res = await fetch(
        "/api/admin/lucky-draw/update-status",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            drawId,
            status: newStatus,
            cancelReason:
              newStatus === "cancelled"
                ? cancelReason
                : undefined,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(
          data.error ||
            "Could not update Lucky Draw status."
        );
        return;
      }

      setMessage(`Lucky Draw is now ${newStatus}.`);
      await loadData();
    } catch {
      setMessage("Could not update Lucky Draw status.");
    }
  }

  async function loadClaims() {
    setLoadingClaims(true);

    try {
      const session = await getSession();

      if (!session) {
        setMessage("Admin login required.");
        return;
      }

      const res = await fetch(
        "/api/admin/lucky-draw/claims",
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          cache: "no-store",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Could not load prize claims.");
        return;
      }

      setClaims(data.claims || []);
    } catch {
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

      const res = await fetch(
        "/api/admin/lucky-draw/claims",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            claimId,
            status,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(
          data.error || "Could not update prize claim."
        );
        return;
      }

      setMessage("Prize claim status updated successfully.");
      await loadClaims();
    } catch {
      setMessage("Could not update prize claim.");
    } finally {
      setUpdatingClaimId(null);
    }
  }

  async function completeDraw(draw: any) {
    const prizeType = draw.prize_type || "cash";
    const isCashOrRent =
      prizeType === "cash" || prizeType === "rent";

    const prizeText = isCashOrRent
      ? `GH₵${Number(
          draw.prize_amount || 0
        ).toFixed(2)}`
      : draw.title;

    const confirmed = window.confirm(
      isCashOrRent
        ? `Select a random winner, close "${draw.title}", and automatically credit ${prizeText} to the winner's wallet?`
        : `Select a random winner and close "${draw.title}"?

The winner will receive: ${prizeText}

No cash will automatically be credited. Delivery or collection details will be requested from the winner.`
    );

    if (!confirmed) return;

    setCompleting(true);
    setMessage("");

    try {
      const session = await getSession();

      if (!session) {
        setMessage("Admin login required.");
        return;
      }

      const res = await fetch(
        "/api/admin/lucky-draw/complete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            drawId: draw.id,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(
          data.error || "Could not complete Lucky Draw."
        );
        return;
      }

      if (data.result?.prize_paid) {
        setMessage(
          `🏆 Winner selected! Ticket ${
            data.result.ticket_number
          } won GH₵${Number(
            data.result.prize_amount
          ).toFixed(2)} and the prize was credited to their wallet.`
        );
      } else {
        setMessage(
          `🏆 Winner selected! Ticket ${
            data.result?.ticket_number
          } won ${draw.title}. The winner can now submit delivery details.`
        );
      }

      await loadData();
    } catch {
      setMessage("Could not complete Lucky Draw.");
    } finally {
      setCompleting(false);
    }
  }

  function getPrizeLabel(draw: any) {
    const type = draw.prize_type || "cash";

    if (type === "cash") return "💰 Cash Prize";
    if (type === "rent") return "🏠 Rent Support";
    if (type === "grocery") return "🛒 Grocery Prize";
    if (type === "physical") return "🎁 Physical Prize";

    return "🎁 Other Prize";
  }



  return (
    <main className="min-h-screen bg-[#071A33] px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-[#FFD54A]">
              Lucky Draw Admin
            </h1>

            <p className="mt-2 text-[#9AAAC1]">
              Create, edit and manage Lucky Draw prizes,
              tickets and winners.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-xl border border-[#38BDF8]/15 bg-[#0B2545]/70 px-5 py-3 font-bold"
          >
            Back to Admin
          </Link>
        </div>

        {message && (
          <div className="mt-8 min-w-0 rounded-2xl border border-[#FFD54A]/20 bg-[#FFD54A]/10 p-5 text-yellow-200">
            {message}
          </div>
        )}

        {loading && (
          <p className="mt-8 text-[#9AAAC1]">
            Loading Lucky Draw...
          </p>
        )}

        {!loading && (
          <>
            <section className="mt-8 min-w-0 rounded-3xl border border-[#FFD54A]/30 bg-[#FFD54A]/10 p-6">
              <h2 className="text-2xl font-black text-[#FFD54A]">
                Create New Lucky Draw
              </h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-bold text-[#9AAAC1]">
                    Prize Title
                  </label>

                  <input
                    spellCheck={false}
                    value={title}
                    onChange={(e) =>
                      setTitle(e.target.value)
                    }
                    placeholder="Example: iPhone 16 Pro Max"
                    className="mt-2 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3 outline-none focus:border-[#FFD54A]"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-[#9AAAC1]">
                    Prize Type
                  </label>

                  <select
                    value={prizeType}
                    onChange={(e) =>
                      setPrizeType(
                        e.target.value as PrizeType | ""
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3 outline-none focus:border-[#FFD54A]"
                  >
                    <option value="" disabled>
                      Select prize type
                    </option>
                    <option value="cash">Cash</option>
                    <option value="rent">Rent Support</option>
                    <option value="physical">
                      Physical Item
                    </option>
                    <option value="grocery">Grocery</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {isAutoPaidPrize ? (
                  <div>
                    <label className="text-sm font-bold text-[#9AAAC1]">
                      Prize Amount
                    </label>

                    <input
                      spellCheck={false}
                      type="number"
                      value={prizeAmount}
                      onChange={(e) =>
                        setPrizeAmount(e.target.value)
                      }
                      placeholder="Example: 1000"
                      className="mt-2 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3 outline-none focus:border-[#FFD54A]"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-bold text-[#9AAAC1]">
                      Estimated Prize Value
                    </label>

                    <input
                      type="number"
                      value={prizeValue}
                      onChange={(e) =>
                        setPrizeValue(e.target.value)
                      }
                      placeholder="Example: 5000"
                      className="mt-2 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3 outline-none focus:border-[#FFD54A]"
                    />
                  </div>
                )}

                <div>
                  <label className="text-sm font-bold text-[#9AAAC1]">
                    Ticket Price
                  </label>

                  <input
                    spellCheck={false}
                    type="number"
                    value={ticketPrice}
                    onChange={(e) =>
                      setTicketPrice(e.target.value)
                    }
                    placeholder="Example: 10"
                    className="mt-2 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3 outline-none focus:border-[#FFD54A]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-bold text-[#9AAAC1]">
                    Prize Description
                  </label>

                  <textarea
                    spellCheck={false}
                    value={prizeDescription}
                    onChange={(e) =>
                      setPrizeDescription(e.target.value)
                    }
                    placeholder="Describe the prize"
                    className="mt-2 min-h-28 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3 outline-none focus:border-[#FFD54A]"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-[#9AAAC1]">
                    Prize Media
                  </label>

                  <input
                    type="file"
                    multiple
                    accept="image/*,video/mp4,video/webm,video/quicktime"
                    onChange={(e) =>
                      setSelectedMedia((current) => [
                        ...current,
                        ...Array.from(e.target.files || []),
                      ])
                    }
                    className="mt-2 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3"
                  />

                  {selectedMedia.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {selectedMedia.map((file, index) => (
                        <div
                          key={`${file.name}-${index}`}
                          className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2"
                        >
                          <p className="min-w-0 truncate text-sm font-semibold text-slate-700">
                            ✓ {file.name}
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedMedia((current) =>
                                current.filter((_, i) => i !== index)
                              )
                            }
                            className="shrink-0 rounded-lg px-2 py-1 text-sm font-black text-red-600 hover:bg-red-50"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="mt-2 text-xs text-[#8295B0]">
                    Add more images and/or videos. Existing media stays unless you remove it.
                  </p>
                </div>
                <div>
                  <label className="text-sm font-bold text-[#9AAAC1]">
                    Maximum Entries
                  </label>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    inputMode="numeric"
                    value={maxEntries}
                    onChange={(e) =>
                      setMaxEntries(e.target.value)
                    }
                    placeholder="Example: 55"
                    className="mt-2 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3 outline-none focus:border-[#FFD54A]"
                  />

                  <p className="mt-2 text-xs text-[#8295B0]">
                    Enter any whole number from 1 upward.
                    Leave blank for unlimited entries.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-bold text-[#9AAAC1]">
                    Number of Winners
                  </label>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={winnerCount}
                    onChange={(e) =>
                      setWinnerCount(e.target.value)
                    }
                    placeholder="Example: 5"
                    className="mt-2 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3"
                  />

                  <p className="mt-2 text-xs text-[#8295B0]">
                    🏆 {Number(winnerCount) > 0
                      ? `${Number(winnerCount)} winner${
                          Number(winnerCount) === 1 ? "" : "s"
                        } will be selected one by one.`
                      : "Enter the number of winners."}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-bold text-[#9AAAC1]">
                    Draw Schedule
                  </label>

                  <div className="mt-2 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setScheduleMode("upcoming");
                      }}
                      className={`rounded-xl px-5 py-3 font-black ${
                        scheduleMode === "upcoming"
                          ? "bg-[#059669] text-white"
                          : "border border-slate-300 bg-white text-slate-900"
                      }`}
                    >
                      Upcoming
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setScheduleMode("now");
                        setStartNow();
                      }}
                      className={`rounded-xl px-5 py-3 font-black ${
                        scheduleMode === "now"
                          ? "bg-[#059669] text-white"
                          : "border border-slate-300 bg-white text-slate-900"
                      }`}
                    >
                      Start Now
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-[#8295B0]">
                    Upcoming draws appear to users with a live countdown until the scheduled start.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-bold text-[#9AAAC1]">
                    Draw Duration (Days)
                  </label>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    inputMode="numeric"
                    value={durationDays}
                    onChange={(e) =>
                      setDurationDays(e.target.value)
                    }
                    placeholder="Example: 7"
                    className="mt-2 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3 outline-none focus:border-[#FFD54A]"
                  />

                  <p className="mt-2 text-xs text-[#8295B0]">
                    The draw will run for this many days from the start time.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-bold text-[#9AAAC1]">
                    Draw Start Date & Time
                  </label>

                  <input
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) =>
                      setStartsAt(e.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-[#9AAAC1]">
                    Winner Selection Date & Time
                  </label>

                  <input
                    type="datetime-local"
                    value={selectionAt}
                    onChange={(e) =>
                      setSelectionAt(e.target.value)
                    }
                    className="mt-2 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3"
                  />

                  <p className="mt-2 text-xs text-[#8295B0]">
                    Entries will close when this time is reached and
                    the transparent winner selection will begin.
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-bold text-[#9AAAC1]">
                    Lucky Draw Rules
                  </label>

                  <textarea
                    spellCheck={false}
                    value={rules}
                    onChange={(e) =>
                      setRules(e.target.value)
                    }
                    placeholder="Enter the rules and conditions for this specific Lucky Draw..."
                    className="mt-2 min-h-32 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3 outline-none focus:border-[#FFD54A]"
                  />

                  <p className="mt-2 text-xs text-[#8295B0]">
                    These rules will be shown with this Lucky Draw.
                  </p>
                </div>

              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={createDraw}
                  disabled={creating || uploadingImage}
                  className="rounded-xl bg-[#059669] px-6 py-3 font-black text-white disabled:opacity-50"
                >
                  {creating || uploadingImage
                    ? "Please wait..."
                    : "Create Lucky Draw"}
                </button>

                <button
                  type="button"
                  onClick={cancelCreateDraw}
                  disabled={creating || uploadingImage}
                  className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-black text-slate-900 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </section>

            {editingDraw && (
              <section className="mt-8 min-w-0 rounded-3xl border border-blue-400/30 bg-[#3F82DD]/10 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-blue-300">
                      Edit Lucky Draw
                    </h2>
                    <p className="mt-1 text-sm text-[#9AAAC1]">
                      Correct any mistake before completing
                      the draw.
                    </p>
                  </div>

                  <button
                    onClick={cancelEdit}
                    className="rounded-xl border border-[#38BDF8]/20 px-4 py-2 font-bold"
                  >
                    Cancel Edit
                  </button>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-bold text-[#9AAAC1]">
                      Prize Title
                    </label>

                    <input
                      value={editTitle}
                      onChange={(e) =>
                        setEditTitle(e.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-[#9AAAC1]">
                      Prize Type
                    </label>

                    <select
                      value={editPrizeType}
                      onChange={(e) =>
                        setEditPrizeType(
                          e.target.value as PrizeType
                        )
                      }
                      className="mt-2 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3"
                    >
                      <option value="cash">Cash</option>
                      <option value="rent">
                        Rent Support
                      </option>
                      <option value="physical">
                        Physical Item
                      </option>
                      <option value="grocery">
                        Grocery
                      </option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {isEditAutoPaidPrize ? (
                    <div>
                      <label className="text-sm font-bold text-[#9AAAC1]">
                        Prize Amount
                      </label>

                      <input
                        type="number"
                        value={editPrizeAmount}
                        onChange={(e) =>
                          setEditPrizeAmount(
                            e.target.value
                          )
                        }
                        className="mt-2 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-sm font-bold text-[#9AAAC1]">
                        Estimated Prize Value
                      </label>

                      <input
                        type="number"
                        value={editPrizeValue}
                        onChange={(e) =>
                          setEditPrizeValue(
                            e.target.value
                          )
                        }
                        className="mt-2 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3"
                      />
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label className="text-sm font-bold text-[#9AAAC1]">
                      Prize Description
                    </label>

                    <textarea
                      value={editPrizeDescription}
                      onChange={(e) =>
                        setEditPrizeDescription(
                          e.target.value
                        )
                      }
                      className="mt-2 min-h-28 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-[#9AAAC1]">
                      Manage Prize Media
                    </label>

                    <input
                      type="file"
                      multiple
                      accept="image/*,video/mp4,video/webm,video/quicktime"
                      onChange={(e) =>
                        setEditSelectedMedia((current) => [
                          ...current,
                          ...Array.from(e.target.files || []),
                        ])
                      }
                      className="mt-2 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3"
                    />

                    {editPrizeMedia.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-black text-[#9AAAC1]">
                          Current Prize Media — remove anything you do not want
                        </p>

                        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {editPrizeMedia.map((media, index) => (
                            <div
                              key={`${media.url}-${index}`}
                              className="relative overflow-hidden rounded-xl border border-slate-200 bg-white"
                            >
                              {media.type === "video" ? (
                                <video
                                  src={media.url}
                                  muted
                                  playsInline
                                  preload="metadata"
                                  className="h-28 w-full object-cover"
                                />
                              ) : (
                                <img
                                  src={media.url}
                                  alt={`Prize media ${index + 1}`}
                                  className="h-28 w-full object-cover"
                                />
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  setEditPrizeMedia((current) =>
                                    current.filter(
                                      (_, i) => i !== index
                                    )
                                  )
                                }
                                className="absolute right-2 top-2 rounded-full bg-red-600 px-2 py-1 text-xs font-black text-white shadow"
                              >
                                ✕
                              </button>

                              <div className="px-2 py-1 text-center text-[11px] font-bold text-slate-600">
                                {media.type === "video"
                                  ? "Video"
                                  : "Image"}{" "}
                                {index + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {editSelectedMedia.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {editSelectedMedia.map((file, index) => (
                          <div
                            key={`${file.name}-${index}`}
                            className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2"
                          >
                            <p className="min-w-0 truncate text-sm font-semibold text-slate-700">
                              ✓ {file.name}
                            </p>

                            <button
                              type="button"
                              onClick={() =>
                                setEditSelectedMedia((current) =>
                                  current.filter((_, i) => i !== index)
                                )
                              }
                              className="shrink-0 rounded-lg px-2 py-1 text-sm font-black text-red-600 hover:bg-red-50"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-bold text-[#9AAAC1]">
                      Maximum Entries
                    </label>

                    <input
                      type="number"
                      min="1"
                      step="1"
                      inputMode="numeric"
                      value={editMaxEntries}
                      onChange={(e) =>
                        setEditMaxEntries(e.target.value)
                      }
                      placeholder="Example: 55"
                      className="mt-2 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3 outline-none focus:border-[#FFD54A]"
                    />

                    <p className="mt-2 text-xs text-[#8295B0]">
                      Enter any whole number from 1 upward.
                      Leave blank for unlimited entries.
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-[#9AAAC1]">
                      Number of Winners
                    </label>

                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={editWinnerCount}
                      onChange={(e) =>
                        setEditWinnerCount(e.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3"
                    />

                    <p className="mt-2 text-xs text-[#8295B0]">
                      🏆 {Number(editWinnerCount) > 0
                        ? `${Number(editWinnerCount)} winner${
                            Number(editWinnerCount) === 1
                              ? ""
                              : "s"
                          } will be selected one by one.`
                        : "Enter the number of winners."}
                    </p>
                  </div>

                                    <div>
                    <label className="text-sm font-bold text-[#9AAAC1]">
                      Draw Duration (Days)
                    </label>

                    <input
                      type="number"
                      min="1"
                      step="1"
                      inputMode="numeric"
                      value={editDurationDays}
                      onChange={(e) =>
                        setEditDurationDays(e.target.value)
                      }
                      placeholder="Example: 7"
                      className="mt-2 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3 outline-none focus:border-[#FFD54A]"
                    />

                    <p className="mt-2 text-xs text-[#8295B0]">
                      The draw will run for this many days from the start time.
                    </p>
                  </div>

<div>
                    <label className="text-sm font-bold text-[#9AAAC1]">
                      Draw Start Date & Time
                    </label>

                    <input
                      type="datetime-local"
                      value={editStartsAt}
                      onChange={(e) =>
                        setEditStartsAt(e.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-[#9AAAC1]">
                      Winner Selection Date & Time
                    </label>

                    <input
                      type="datetime-local"
                      value={editSelectionAt}
                      onChange={(e) =>
                        setEditSelectionAt(e.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3"
                    />

                    <p className="mt-2 text-xs text-[#8295B0]">
                      Entries close at this time and transparent winner
                      selection can begin.
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-bold text-[#9AAAC1]">
                      Lucky Draw Rules
                    </label>

                    <textarea
                      spellCheck={false}
                      value={editRules}
                      onChange={(e) =>
                        setEditRules(e.target.value)
                      }
                      placeholder="Enter the rules and conditions for this Lucky Draw..."
                      className="mt-2 min-h-32 w-full rounded-xl border border-[#38BDF8]/15 bg-[#071A33] px-4 py-3 outline-none focus:border-[#FFD54A]"
                    />

                    <p className="mt-2 text-xs text-[#8295B0]">
                      These rules apply specifically to this draw.
                    </p>
                  </div>

                </div>

                <button
                  onClick={saveEdit}
                  disabled={savingEdit || uploadingImage}
                  className="mt-6 rounded-xl bg-blue-400 px-6 py-3 font-black text-black disabled:opacity-50"
                >
                  {savingEdit || uploadingImage
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </section>
            )}

            <section className="mt-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-2xl font-black text-[#FFD54A]">
                  All Active Lucky Draws
                </h2>

                <div className="rounded-xl border border-[#38BDF8]/15 bg-[#0B2545]/70 px-4 py-2 text-sm text-[#B4C0D1]">
                  Total Revenue: GH₵
                  {totalRevenue.toFixed(2)}
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                {draws.map((draw) => {
                  const drawTickets = tickets.filter(
                    (ticket) =>
                      ticket.draw_id === draw.id
                  );

                  const revenue =
                    drawTickets.length *
                    Number(draw.ticket_price || 0);

                  const refundedTickets = drawTickets.filter(
                    (ticket: any) => Boolean(ticket.refunded_at)
                  );

                  const refundedAmount = refundedTickets.reduce(
                    (total: number, ticket: any) =>
                      total + Number(ticket.amount || 0),
                    0
                  );

                  const prizeText =
                    draw.prize_type === "cash" ||
                    draw.prize_type === "rent"
                      ? `GH₵${Number(
                          draw.prize_amount || 0
                        ).toFixed(2)}`
                      : draw.title;

                  return (
                    <div
                      key={draw.id}
                      className="min-w-0 rounded-xl border border-slate-200 bg-white p-3"
>
                      {(() => {
                        const media =
                          normalizePrizeMedia(draw.prize_media);

                        const fallback = draw.prize_image
                          ? [
                              {
                                type: "image" as const,
                                url: draw.prize_image,
                              },
                            ]
                          : [];

                        const items =
                          media.length > 0 ? media : fallback;

                        if (items.length === 0) return null;

                        // Prefer an image for the compact admin thumbnail.
                        // If there is no image, fall back to the first video.
                        const preview =
                          items.find(
                            (item) => item.type === "image"
                          ) || items[0];

                        return (
                          <div className="mb-5 flex justify-center">
                            <div className="relative h-40 w-32 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
                              {preview.type === "image" ? (
                                <img
                                  src={preview.url}
                                  alt={draw.title}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display =
                                      "none";
                                  }}
                                />
                              ) : (
                                <video
                                  src={preview.url}
                                  muted
                                  playsInline
                                  autoPlay
                                  loop
                                  preload="auto"
                                  className="h-full w-full object-cover"
                                />
                              )}

                              {items.length > 1 && (
                                <span className="absolute bottom-2 left-2 right-2 rounded-lg bg-black/75 px-2 py-1 text-center text-xs font-black text-white">
                                  View {items.length} media
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()}




                      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-[#8295B0]">
                            {getPrizeLabel(draw)}
                          </p>

                          <h3 className="mt-1 text-2xl font-black text-[#FFD54A]">
                            {draw.title}
                          </h3>

                          <p className="mt-2 text-sm text-[#9AAAC1]">
                            Status:{" "}
                            <span className="font-bold">
                              {draw.status}
                            </span>
                          </p>

                          {draw.status === "cancelled" &&
                            draw.cancel_reason && (
                              <p className="mt-2 text-sm text-orange-600">
                                Reason: {draw.cancel_reason}
                              </p>
                            )}

                          {draw.status === "cancelled" && (
                            <div className="mt-3 grid grid-cols-2 gap-3">
                              <div className="rounded-xl border border-green-200 bg-green-50 p-3">
                                <p className="text-xs font-bold text-slate-500">
                                  Refunded Tickets
                                </p>
                                <p className="mt-1 text-lg font-black text-green-700">
                                  {refundedTickets.length}
                                </p>
                              </div>

                              <div className="rounded-xl border border-green-200 bg-green-50 p-3">
                                <p className="text-xs font-bold text-slate-500">
                                  Refunded Amount
                                </p>
                                <p className="mt-1 text-lg font-black text-green-700">
                                  GH₵{refundedAmount.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => startEdit(draw)}
                          disabled={draw.status === "completed" || draw.status === "cancelled"}
                          className="rounded-xl border border-blue-400/40 px-4 py-2 font-black text-blue-300 disabled:opacity-40"
                        >
                          ✏ Edit
                        </button>
                      </div>

                      {draw.prize_description && (
                        <p className="mt-4 text-sm text-[#B4C0D1]">
                          {draw.prize_description}
                        </p>
                      )}

                      <div className="mt-6 flex flex-wrap gap-3">
                        {draw.status === "cancelled" && (
                          <button
                            type="button"
                            onClick={() => runAgain(draw)}
                            className="rounded-xl bg-green-600 px-4 py-2 font-black text-white"
                          >
                            ↻ Run Again
                          </button>
                        )}

                        {draw.status === "open" && (
                          <>
                            <button
                              onClick={() =>
                                updateDrawStatus(
                                  draw.id,
                                  "paused"
                                )
                              }
                              className="rounded-xl bg-[#FFD54A] px-4 py-2 font-black text-black"
                            >
                              ⏸ Pause
                            </button>

                            <button
                              onClick={() =>
                                updateDrawStatus(
                                  draw.id,
                                  "suspended"
                                )
                              }
                              className="rounded-xl border border-red-400/40 px-4 py-2 font-bold text-red-600"
                            >
                              ⚠ Suspend
                            </button>

                            <button
                              onClick={() =>
                                updateDrawStatus(
                                  draw.id,
                                  "cancelled"
                                )
                              }
                              className="rounded-xl border border-orange-400/40 px-4 py-2 font-bold text-orange-600"
                            >
                              ✕ Cancel Draw
                            </button>
                          </>
                        )}

                        {draw.status === "paused" && (
                          <>
                            <button
                              onClick={() =>
                                updateDrawStatus(
                                  draw.id,
                                  "open"
                                )
                              }
                              className="rounded-xl bg-green-400 px-4 py-2 font-black text-black"
                            >
                              ▶ Resume
                            </button>

                            <button
                              onClick={() =>
                                updateDrawStatus(
                                  draw.id,
                                  "suspended"
                                )
                              }
                              className="rounded-xl border border-red-400/40 px-4 py-2 font-bold text-red-600"
                            >
                              ⚠ Suspend
                            </button>

                            <button
                              onClick={() =>
                                updateDrawStatus(
                                  draw.id,
                                  "cancelled"
                                )
                              }
                              className="rounded-xl border border-orange-400/40 px-4 py-2 font-bold text-orange-600"
                            >
                              ✕ Cancel Draw
                            </button>
                          </>
                        )}

                        {draw.status === "suspended" && (
                          <button
                            onClick={() =>
                              updateDrawStatus(
                                draw.id,
                                "open"
                              )
                            }
                            className="rounded-xl bg-green-400 px-4 py-2 font-black text-black"
                          >
                            ▶ Resume
                          </button>
                        )}
                      </div>

                      <div className="mt-6 grid gap-4 md:grid-cols-4">
                        <div className="min-w-0 rounded-2xl border border-[#FFD54A]/20 bg-[#FFD54A]/10 p-4">
                          <p className="text-sm text-[#9AAAC1]">
                            Prize
                          </p>
                          <h3 className="mt-2 text-xl font-black text-[#FFD54A]">
                            {prizeText}
                          </h3>
                        </div>

                        <div className="min-w-0 rounded-2xl border border-[#38BDF8]/15 bg-[#071A33]/20 p-4">
                          <p className="text-sm text-[#9AAAC1]">
                            Ticket Price
                          </p>
                          <h3 className="mt-2 text-xl font-black">
                            GH₵
                            {Number(
                              draw.ticket_price || 0
                            ).toFixed(2)}
                          </h3>
                        </div>

                        <div className="min-w-0 rounded-2xl border border-blue-400/20 bg-[#3F82DD]/10 p-4">
                          <p className="text-sm text-[#9AAAC1]">
                            Tickets Sold
                          </p>
                          <h3 className="mt-2 text-xl font-black text-blue-300">
                            {drawTickets.length}
                          </h3>
                        </div>

                        <div className="min-w-0 rounded-2xl border border-purple-400/20 bg-purple-400/10 p-4">
                          <p className="text-sm text-[#9AAAC1]">
                            Draw Schedule
                          </p>

                          <h3 className="mt-2 text-lg font-black text-purple-300">
                            {draw.duration_days
                              ? `${draw.duration_days} day${draw.duration_days === 1 ? "" : "s"}`
                              : "Not set"}
                          </h3>

                          <p className="mt-1 text-xs text-white/60">
                            {draw.starts_at
                              ? `Starts: ${new Date(draw.starts_at).toLocaleString()}`
                              : "Start not set"}
                          </p>

                          <p className="mt-1 text-xs text-white/60">
                            {draw.ends_at
                              ? `Ends: ${new Date(draw.ends_at).toLocaleString()}`
                              : "End not set"}
                          </p>

                          {draw.selection_at && (
                            <p className="mt-1 text-xs text-white/60">
                              {`Selection: ${new Date(draw.selection_at).toLocaleString()}`}
                            </p>
                          )}
                        </div>

                        <div className="min-w-0 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                          <p className="text-sm text-[#9AAAC1]">
                            Maximum Entries
                          </p>

                          <h3 className="mt-2 text-xl font-black text-emerald-300">
                            {draw.max_entries == null
                              ? "Unlimited"
                              : Number(draw.max_entries).toLocaleString()}
                          </h3>

                          {draw.max_entries != null && (
                            <p className="mt-1 text-xs font-bold text-emerald-200/70">
                              {Math.max(
                                0,
                                Number(draw.max_entries) -
                                  drawTickets.length
                              ).toLocaleString()}{" "}
                              remaining
                            </p>
                          )}
                        </div>

                        <div className="min-w-0 rounded-2xl border border-green-400/20 bg-green-500/10 p-4">
                          <p className="text-sm text-[#9AAAC1]">
                            Revenue
                          </p>
                          <h3 className="mt-2 text-xl font-black text-green-300">
                            GH₵{revenue.toFixed(2)}
                          </h3>
                        </div>
                      </div>

                      {selectedWinner?.draw_id === draw.id && (
                        <div className="mt-6 min-w-0 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-5 text-center">
                          <p className="text-sm font-bold text-yellow-300">
                            🎉 WINNER {selectedWinner.winner_position} SELECTED
                          </p>

                          <h3 className="mt-2 text-xl font-black text-white">
                            {selectedWinner.full_name ||
                              selectedWinner.name ||
                              selectedWinner.email ||
                              "Winner Selected"}
                          </h3>

                          {selectedWinner.ticket_number && (
                            <p className="mt-1 text-sm text-[#9AAAC1]">
                              Ticket: {selectedWinner.ticket_number}
                            </p>
                          )}
                        </div>
                      )}

                      <button
                        onClick={() => selectNextWinner(draw)}
                        disabled={
                          selectingWinner === draw.id ||
                          drawTickets.length === 0 ||
                          draw.status === "completed" ||
                          draw.status === "cancelled"
                        }
                        className={`mt-6 w-full rounded-xl px-5 py-3 font-black disabled:cursor-not-allowed disabled:opacity-40 ${
                          draw.status === "cancelled"
                            ? "bg-slate-200 text-slate-500"
                            : "bg-green-600 text-white"
                        }`}
                      >
                        {draw.status === "completed"
                          ? "🎉 Draw Completed"
                          : draw.status === "cancelled"
                          ? "✕ Draw Cancelled — No Winner Selection"
                          : selectingWinner === draw.id
                          ? "Selecting Winner..."
                          : drawTickets.length === 0
                          ? "No Tickets Yet"
                          : `🏆 ${
                              selectedWinner?.draw_id === draw.id
                                ? "Select Next Winner"
                                : "Start Transparent Selection"
                            }`}
                      </button>
                    </div>
                  );
                })}
              </div>

              {draws.length === 0 && (
                <div className="mt-6 min-w-0 rounded-2xl border border-[#38BDF8]/15 bg-[#0B2545]/70 p-8 text-center text-[#9AAAC1]">
                  No active Lucky Draws yet.
                </div>
              )}
            </section>
          </>
        )}
      </div>


    </main>
  );
}
