"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/app/components/sidebar";

type RentingRow = {
  rentingid: number;
  bookingid: number | null;
  customerid: number | null;
  hotelid: number | null;
  room_number: number | null;
  start_date: string;
  end_date: string;
  checkin_datetime: string | null;
  checkout_datetime: string | null;
  customer_name_snapshot: string;
  customer_id_snapshot: string;
  room_snapshot: string;
  hotel_snapshot: string;
  chain_name_snapshot: string;
};

function formatRentingId(id: number | null | undefined) {
  if (id === null || id === undefined) return "-";
  return `R${id.toString().padStart(3, "0")}`;
}

function formatBookingId(id: number | null | undefined) {
  if (id === null || id === undefined) return "Walk-in";
  return `B${id.toString().padStart(3, "0")}`;
}

function formatDate(dateString: string | null | undefined) {
  if (!dateString) return "-";
  return new Date(dateString).toISOString().split("T")[0];
}

function formatDateTime(dateString: string | null | undefined) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString();
}

export default function RentingsPage() {
  const [search, setSearch] = useState("");
  const [rentings, setRentings] = useState<RentingRow[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRentings() {
      try {
        const response = await fetch("/api/rentings");
        const data = await response.json();
        if (!response.ok) {
          setMessage(data.error || "Could not load rentings.");
          return;
        }
        setRentings(Array.isArray(data) ? data : []);
      } catch {
        setMessage("Failed to load rentings.");
      } finally {
        setLoading(false);
      }
    }
    fetchRentings();
  }, []);

  const filteredRentings = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rentings;
    return rentings.filter(
      (row) =>
        formatRentingId(row.rentingid).toLowerCase().includes(q) ||
        formatBookingId(row.bookingid).toLowerCase().includes(q) ||
        (row.customer_name_snapshot ?? "").toLowerCase().includes(q) ||
        (row.room_number?.toString() ?? "").includes(q) ||
        (row.hotelid?.toString() ?? "").includes(q),
    );
  }, [search, rentings]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        <Sidebar role="employee" />

        <section className="min-w-0 flex-1 overflow-auto">
          {/* Page header */}
          <div className="border-b border-gray-200 bg-white px-8 py-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Front Desk Operations
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Check-in guests, manage walk-in rentings, and view all rentings
            </p>
          </div>

          {/* Tab bar */}
          <div className="border-b border-gray-200 bg-white px-8">
            <div className="flex gap-6">
              <Link
                href="/employee/checkin"
                className="flex items-center gap-2 border-b-2 border-transparent py-3.5 text-sm font-semibold text-gray-500 transition hover:text-gray-700"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Check-In Desk
              </Link>
              <Link
                href="/employee/walkin"
                className="flex items-center gap-2 border-b-2 border-transparent py-3.5 text-sm font-semibold text-gray-500 transition hover:text-gray-700"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Walk-In Renting
              </Link>
              <Link
                href="/employee/rentings"
                className="flex items-center gap-2 border-b-2 border-blue-600 py-3.5 text-sm font-semibold text-blue-600"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                All Rentings
              </Link>
            </div>
          </div>

          <div className="p-8">
            {/* Search */}
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <svg
                  className="h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
                  />
                </svg>
                Search Rentings
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by renting ID, booking ID, customer name, room number, or hotel ID..."
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {message && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {message}
              </div>
            )}

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[1200px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-white">
                      {[
                        "Renting ID",
                        "Booking Ref",
                        "Customer Name",
                        "Customer ID",
                        "Hotel ID",
                        "Room",
                        "Start Date",
                        "End Date",
                        "Check-In Time",
                        "Check-Out Time",
                        "Action",
                      ].map((col) => (
                        <th
                          key={col}
                          className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan={11}
                          className="px-6 py-10 text-center text-sm text-gray-400"
                        >
                          Loading rentings...
                        </td>
                      </tr>
                    ) : filteredRentings.length === 0 ? (
                      <tr>
                        <td
                          colSpan={11}
                          className="px-6 py-10 text-center text-sm text-gray-400"
                        >
                          No rentings found.
                        </td>
                      </tr>
                    ) : (
                      filteredRentings.map((row, index) => (
                        <tr
                          key={`${row.rentingid ?? "unknown"}-${index}`}
                          className="border-t border-gray-100 hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {formatRentingId(row.rentingid)}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {formatBookingId(row.bookingid)}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {row.customer_name_snapshot ?? "-"}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {row.customerid ?? "-"}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {row.hotelid ?? "-"}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {row.room_number ?? "-"}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {formatDate(row.start_date)}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {formatDate(row.end_date)}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {formatDateTime(row.checkin_datetime)}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {formatDateTime(row.checkout_datetime)}
                          </td>
                          <td className="px-6 py-4">
                            <Link
                              href={`/employee/payments?rentingID=${row.rentingid}`}
                              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition"
                            >
                              Payment
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
