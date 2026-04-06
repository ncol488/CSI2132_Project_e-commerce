"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
      } catch (error) {
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

    return rentings.filter((row) => {
      return (
        formatRentingId(row.rentingid).toLowerCase().includes(q) ||
        formatBookingId(row.bookingid).toLowerCase().includes(q) ||
        (row.customer_name_snapshot ?? "").toLowerCase().includes(q) ||
        (row.room_number?.toString() ?? "").includes(q) ||
        (row.hotelid?.toString() ?? "").includes(q)
      );
    });
  }, [search, rentings]);

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="flex min-h-screen">
        <aside className="flex w-72 flex-col border-r border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-6">
            <h1 className="text-2xl font-bold text-gray-900">e-Hotels</h1>
            <p className="text-sm text-gray-500">Management System</p>
          </div>

          <div className="border-b border-gray-200 p-4">
            <div className="flex gap-2">
              <button className="flex-1 rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600">
                Customer
              </button>
              <button className="flex-1 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white">
                Employee
              </button>
            </div>
          </div>

          <nav className="flex-1 space-y-2 p-4">
            <Link
              href="/employee/checkin"
              className="block rounded-xl bg-blue-50 px-4 py-3 font-medium text-blue-700"
            >
              Front Desk
            </Link>

            <Link
              href="/employee#management"
              className="block rounded-xl px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Management
            </Link>

            <Link
              href="/employee/reports"
              className="block rounded-xl px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Reports
            </Link>
          </nav>
        </aside>

        <section className="min-w-0 flex-1 p-8">
          <header className="mb-6">
            <h2 className="text-4xl font-bold text-gray-900">Front Desk Operations</h2>
            <p className="mt-2 text-gray-600">
              Check-in guests, manage walk-in rentings, and view all rentings
            </p>
          </header>

          <div className="mb-8 border-b border-gray-200">
            <div className="flex gap-8">
              <Link
                href="/employee/checkin"
                className="px-1 py-3 text-lg font-semibold text-gray-600 transition hover:text-gray-900"
              >
                Check-In Desk
              </Link>

              <Link
                href="/employee/walkin"
                className="px-1 py-3 text-lg font-semibold text-gray-600 transition hover:text-gray-900"
              >
                Walk-In Renting
              </Link>

              <Link
                href="/employee/rentings"
                className="border-b-2 border-blue-600 px-1 py-3 text-lg font-semibold text-blue-600"
              >
                All Rentings
              </Link>
            </div>
          </div>

          <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <label
              htmlFor="search-rentings"
              className="mb-3 block text-lg font-semibold text-gray-700"
            >
              Search Rentings
            </label>

            <input
              id="search-rentings"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by renting ID, booking ID, customer name, room number, or hotel ID..."
              className="w-full rounded-lg border p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </section>

          {message && (
            <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
              {message}
            </div>
          )}

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-2xl font-bold text-gray-900">Renting Information</h3>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[1200px] text-left">
                  <thead className="bg-gray-50 text-sm uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Renting ID</th>
                      <th className="px-6 py-4 font-semibold">Booking Ref</th>
                      <th className="px-6 py-4 font-semibold">Customer Name</th>
                      <th className="px-6 py-4 font-semibold">Customer ID</th>
                      <th className="px-6 py-4 font-semibold">Hotel ID</th>
                      <th className="px-6 py-4 font-semibold">Room</th>
                      <th className="px-6 py-4 font-semibold">Start Date</th>
                      <th className="px-6 py-4 font-semibold">End Date</th>
                      <th className="px-6 py-4 font-semibold">Check-In Time</th>
                      <th className="px-6 py-4 font-semibold">Check-Out Time</th>
                      <th className="px-6 py-4 font-semibold">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr className="border-t border-gray-200">
                        <td colSpan={11} className="px-6 py-8 text-center text-gray-500">
                          Loading rentings...
                        </td>
                      </tr>
                    ) : filteredRentings.length === 0 ? (
                      <tr className="border-t border-gray-200">
                        <td colSpan={11} className="px-6 py-8 text-center text-gray-500">
                          No rentings found.
                        </td>
                      </tr>
                    ) : (
                      filteredRentings.map((row, index) => (
                        <tr
                          key={`${row.rentingid ?? "unknown"}-${index}`}
                          className="border-t border-gray-200 text-base text-gray-800"
                        >
                          <td className="px-6 py-5 font-medium">
                            {formatRentingId(row.rentingid)}
                          </td>
                          <td className="px-6 py-5">{formatBookingId(row.bookingid)}</td>
                          <td className="px-6 py-5">{row.customer_name_snapshot ?? "-"}</td>
                          <td className="px-6 py-5">{row.customerid ?? "-"}</td>
                          <td className="px-6 py-5">{row.hotelid ?? "-"}</td>
                          <td className="px-6 py-5">{row.room_number ?? "-"}</td>
                          <td className="px-6 py-5">{formatDate(row.start_date)}</td>
                          <td className="px-6 py-5">{formatDate(row.end_date)}</td>
                          <td className="px-6 py-5">{formatDateTime(row.checkin_datetime)}</td>
                          <td className="px-6 py-5">{formatDateTime(row.checkout_datetime)}</td>
                          <td className="px-6 py-5">
                            <Link
                              href={`/employee/payments?rentingID=${row.rentingid}`}
                              className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                            >
                              Record Payment
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}