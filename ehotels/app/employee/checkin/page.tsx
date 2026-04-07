"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/app/components/sidebar";

type BookingRow = {
  bookingID: number;
  customer_name_snapshot: string;
  room_number: number | null;
  start_date: string;
  end_date: string;
  status: string;
};

type BookingDetails = {
  bookingID: number;
  customerid: number;
  hotelid: number;
  room_number: number;
  start_date: string;
  end_date: string;
  status: string;
  customer_name_snapshot: string;
  customer_id_snapshot: string;
  room_snapshot: string;
  hotel_snapshot: string;
  chain_name_snapshot: string;
};

function formatBookingId(id: number) {
  return `B${id?.toString().padStart(3, "0") || "000"}`;
}

function formatDate(dateString: string) {
  if (!dateString) return "-";
  return new Date(dateString).toISOString().split("T")[0];
}

function getStatusBadge(status: string) {
  const normalized = status?.toLowerCase() || "";
  if (normalized === "confirmed") return "bg-green-100 text-green-700";
  if (normalized === "pending") return "bg-yellow-100 text-yellow-800";
  if (normalized === "checked-in" || normalized === "checked in")
    return "bg-blue-100 text-blue-700";
  return "bg-gray-100 text-gray-700";
}

export default function CheckInPage() {
  const [search, setSearch] = useState("");
  const [bookingRows, setBookingRows] = useState<BookingRow[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingDetails | null>(
    null,
  );
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [loadingTable, setLoadingTable] = useState(true);
  const [loadingBookingId, setLoadingBookingId] = useState<number | null>(null);
  // Load Bookings on Mount
  useEffect(() => {
    async function fetchBookings() {
      try {
        const response = await fetch("/api/bookings");
        const data = await response.json();
        if (!response.ok) {
          setMessage({
            type: "error",
            text: data.error || "Could not load bookings.",
          });
          return;
        }
        // Handle both {bookings: []} and [] formats
        const rows = data.bookings || (Array.isArray(data) ? data : []);
        setBookingRows(rows);
      } catch {
        setMessage({ type: "error", text: "Failed to load bookings." });
      } finally {
        setLoadingTable(false);
      }
    }
    fetchBookings();
  }, []);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return bookingRows;
    return bookingRows.filter(
      (row) =>
        formatBookingId(row.bookingID).toLowerCase().includes(q) ||
        row.customer_name_snapshot?.toLowerCase().includes(q) ||
        (row.room_number?.toString() ?? "").includes(q),
    );
  }, [search, bookingRows]);

  // Logic to show details for a specific booking
  async function handleViewDetails(bookingID: number) {
    setLoadingBookingId(bookingID);
    setMessage(null);
    try {
      // Note: You must have an API route at /api/bookings/[id]/route.ts for this to work
      const response = await fetch(`/api/bookings/${bookingID}`);
      const data = await response.json();
      console.log("booking details response:", data);
      if (!response.ok) {
        setSelectedBooking(null);
        setMessage({
          type: "error",
          text: data.error || "Could not load details.",
        });
        return;
      }
      setSelectedBooking(data);
    } catch {
      setSelectedBooking(null);
      setMessage({ type: "error", text: "Failed to load details." });
    } finally {
      setLoadingBookingId(null);
    }
  }

  async function handleCheckIn() {
    if (!selectedBooking) return;
    setMessage(null);
    try {
      const response = await fetch(
        `/api/bookings/${selectedBooking.bookingID}/checkin`,
        { method: "POST" },
      );
      const data = await response.json();
      if (!response.ok) {
        setMessage({ type: "error", text: data.error || "Check-in failed." });
        return;
      }
      setMessage({
        type: "success",
        text: `Check-in successful! Renting ID: ${data.rentingID}`,
      });

      // Refresh Table
      const refreshed = await fetch("/api/bookings");
      const refreshedData = await refreshed.json();
      setBookingRows(refreshedData.bookings || refreshedData);
      setSelectedBooking(null);
    } catch {
      setMessage({ type: "error", text: "Something went wrong." });
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex">
      <Sidebar role="employee" />

      <section className="flex-1 overflow-auto">
        <div className="border-b border-gray-200 bg-white px-8 py-6">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Front Desk Operations
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Check-in guests and manage reservations
          </p>
        </div>

        <div className="border-b border-gray-200 bg-white px-8">
          <div className="flex gap-6">
            <Link
              href="/employee/checkin"
              className="border-b-2 border-blue-600 py-3.5 text-sm font-semibold text-blue-600"
            >
              Check-In Desk
            </Link>
            <Link
              href="/employee/walkin"
              className="border-b-2 border-transparent py-3.5 text-sm font-semibold text-gray-500 transition hover:text-gray-700"
            >
              Walk-In Renting
            </Link>
            <Link
              href="/employee/rentings"
              className="border-b-2 border-transparent py-3.5 text-sm font-semibold text-gray-500 transition hover:text-gray-700"
            >
              All Rentings
            </Link>
          </div>
        </div>

        <div className="p-8">
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400">
              Search Reservations
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Guest name or ID (e.g. B001)..."
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">
                    ID
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">
                    Guest
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">
                    Room
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">
                    Dates
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loadingTable ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-gray-400"
                    >
                      Loading bookings...
                    </td>
                  </tr>
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-gray-400"
                    >
                      No matching reservations.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr
                      key={row.bookingID}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 font-mono font-bold text-blue-600">
                        {formatBookingId(row.bookingID)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {row.customer_name_snapshot}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {row.room_number ?? "-"}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {formatDate(row.start_date)} to{" "}
                        {formatDate(row.end_date)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${getStatusBadge(row.status)}`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewDetails(row.bookingID)}
                          disabled={loadingBookingId === row.bookingID}
                          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
                        >
                          {loadingBookingId === row.bookingID
                            ? "..."
                            : "Details"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {message && (
            <div
              className={`mt-4 rounded-xl border p-4 text-sm font-medium ${message.type === "error" ? "border-red-100 bg-red-50 text-red-800" : "border-green-100 bg-green-50 text-green-800"}`}
            >
              {message.text}
            </div>
          )}

          {selectedBooking && (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
              <div className="mb-8 flex items-center justify-between border-b border-slate-100 pb-6">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    Check-In Confirmation
                  </h3>
                  <p className="text-sm text-slate-500">
                    Verify guest credentials before proceeding
                  </p>
                </div>
                <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-lg border border-indigo-100">
                  REF: {formatBookingId(selectedBooking.bookingID)}
                </span>
              </div>

              <div className="grid gap-8 md:grid-cols-2">
                {/* --- Guest Details Section --- */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                    Guest Identification
                  </h4>
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5 space-y-3 text-sm">
                    <p className="flex justify-between">
                      <span className="font-medium text-slate-500">
                        Guest Name
                      </span>
                      <span className="font-bold text-slate-900">
                        {selectedBooking.customer_name_snapshot}
                      </span>
                    </p>
                    <p className="flex justify-between border-t border-slate-200/60 pt-3">
                      <span className="font-medium text-slate-500">
                        Document ID
                      </span>
                      <span className="font-bold text-slate-900">
                        {selectedBooking.customer_id_snapshot}
                      </span>
                    </p>
                    <p className="flex justify-between border-t border-slate-200/60 pt-3">
                      <span className="font-medium text-slate-500">
                        Duration
                      </span>
                      <span className="font-bold text-slate-900">
                        {formatDate(selectedBooking.start_date)} →{" "}
                        {formatDate(selectedBooking.end_date)}
                      </span>
                    </p>
                  </div>
                </div>

                {/* --- Assigned Room Section --- */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-indigo-400">
                    Assigned Room
                  </h4>
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-5 space-y-3 text-sm">
                    <p className="flex items-start gap-3">
                      <span className="mt-0.5 rounded bg-indigo-600 p-1 text-white">
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                      </span>
                      <span className="font-semibold text-indigo-900">
                        {selectedBooking.room_snapshot}
                      </span>
                    </p>
                    <p className="text-indigo-800/80 pl-8 text-xs italic">
                      {selectedBooking.hotel_snapshot}
                    </p>
                    <p className="pl-8 text-xs font-bold text-indigo-600 uppercase tracking-tighter">
                      {selectedBooking.chain_name_snapshot}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckIn}
                className="mt-10 w-full rounded-xl bg-slate-900 py-4 text-sm font-bold text-white shadow-xl transition-all hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-[0.98]"
              >
                Confirm Identity & Issue Key
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
