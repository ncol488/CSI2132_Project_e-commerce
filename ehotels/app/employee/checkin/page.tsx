"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/app/components/sidebar";

type BookingRow = {
  bookingid: number;
  customer_name_snapshot: string;
  room_number: number | null;
  start_date: string;
  end_date: string;
  status: string;
};

type BookingDetails = {
  bookingid: number;
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
        formatBookingId(row.bookingid).toLowerCase().includes(q) ||
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
        `/api/checkin/${selectedBooking.bookingid}`,
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
                      key={row.bookingid}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 font-mono font-bold text-blue-600">
                        {formatBookingId(row.bookingid)}
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
                          onClick={() => handleViewDetails(row.bookingid)}
                          disabled={loadingBookingId === row.bookingid}
                          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
                        >
                          {loadingBookingId === row.bookingid
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
            <div className="mt-8 rounded-xl border border-gray-200 bg-white p-8 shadow-md">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  Check-In Confirmation
                </h3>
                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {formatBookingId(selectedBooking.bookingid)}
                </span>
              </div>
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase text-gray-400">
                    Stay Information
                  </h4>
                  <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-2 text-sm">
                    <p>
                      <span className="font-bold text-gray-900">Guest:</span>{" "}
                      {selectedBooking.customer_name_snapshot}
                    </p>
                    <p>
                      <span className="font-bold text-gray-900">ID Info:</span>{" "}
                      {selectedBooking.customer_id_snapshot}
                    </p>
                    <p>
                      <span className="font-bold text-gray-900">Dates:</span>{" "}
                      {formatDate(selectedBooking.start_date)} →{" "}
                      {formatDate(selectedBooking.end_date)}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold uppercase text-gray-400">
                    Assigned Room
                  </h4>
                  <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-4 space-y-2 text-sm">
                    <p>
                      <span className="font-bold text-blue-900">Room:</span>{" "}
                      {selectedBooking.room_snapshot}
                    </p>
                    <p>
                      <span className="font-bold text-blue-900">Hotel:</span>{" "}
                      {selectedBooking.hotel_snapshot}
                    </p>
                    <p>
                      <span className="font-bold text-blue-900">Chain:</span>{" "}
                      {selectedBooking.chain_name_snapshot}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleCheckIn}
                className="mt-8 w-full rounded-xl bg-blue-600 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-blue-700 active:scale-[0.99]"
              >
                Verify Guest & Complete Check-In
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
