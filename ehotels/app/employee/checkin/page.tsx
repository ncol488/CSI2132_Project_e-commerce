"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

//check in desk page

type BookingRow = {
  bookingID: number;
  customerName: string;
  roomNumber: number | null;
  startDate: string;
  endDate: string;
  status: string;
};

type BookingDetails = {
  bookingID: number;
  customerID: number;
  hotelID: number;
  roomNumber: number;
  startDate: string;
  endDate: string;
  status: string;
  customerName: string;
  customerIdSnapshot: string;
  roomSnapshot: string;
  hotelSnapshot: string;
  chainName: string;
};

function formatBookingId(id: number) {
  return `B${id.toString().padStart(3, "0")}`;
}

function formatDate(dateString: string) {
  return new Date(dateString).toISOString().split("T")[0];
}

function getStatusBadge(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === "confirmed") {
    return "bg-green-100 text-green-700";
  }

  if (normalized === "pending") {
    return "bg-yellow-100 text-yellow-700";
  }

  if (normalized === "checked-in" || normalized === "checked in") {
    return "bg-blue-100 text-blue-700";
  }

  return "bg-gray-100 text-gray-700";
}

export default function CheckInPage() {
  const [search, setSearch] = useState("");
  const [bookingRows, setBookingRows] = useState<BookingRow[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingDetails | null>(null);
  const [message, setMessage] = useState("");
  const [loadingTable, setLoadingTable] = useState(true);
  const [loadingBookingId, setLoadingBookingId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const response = await fetch("/api/bookings");
        const data = await response.json();

        if (!response.ok) {
          setMessage(data.error || "Could not load bookings.");
          return;
        }

        setBookingRows(data);
      } catch (error) {
        setMessage("Failed to load bookings.");
      } finally {
        setLoadingTable(false);
      }
    }

    fetchBookings();
  }, []);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return bookingRows;

    return bookingRows.filter((row) => {
      return (
        formatBookingId(row.bookingID).toLowerCase().includes(q) ||
        row.bookingID.toString().includes(q) ||
        row.customerName.toLowerCase().includes(q) ||
        (row.roomNumber?.toString() ?? "").includes(q)
      );
    });
  }, [search, bookingRows]);

  async function handleViewDetails(bookingID: number) {
    setLoadingBookingId(bookingID);
    setMessage("");

    try {
      const response = await fetch(`/api/bookings/${bookingID}`);
      const data = await response.json();

      if (!response.ok) {
        setSelectedBooking(null);
        setMessage(data.error || "Could not load booking details.");
        return;
      }

      setSelectedBooking(data);
    } catch (error) {
      setSelectedBooking(null);
      setMessage("Failed to load booking details.");
    } finally {
      setLoadingBookingId(null);
    }
  }

  //to change booking to a renting, from pressing button "Complete Check-In" 

async function handleCheckIn() {
  if (!selectedBooking) return;

  setMessage("");

  try {
    const response = await fetch(
      `/api/bookings/${selectedBooking.bookingID}/checkin`,
      {
        method: "POST",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Check-in failed.");
      return;
    }

    setMessage(
      `Booking ${formatBookingId(
        selectedBooking.bookingID
      )} converted to renting ID ${data.rentingID}`
    );

    // refresh table
    const refreshed = await fetch("/api/bookings");
    setBookingRows(await refreshed.json());

    setSelectedBooking(null);
  } catch (error) {
    console.error(error);
    setMessage("Something went wrong.");
  }
}

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
              href="/employee/management"
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

        <section className="flex-1 p-8">
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
                className="border-b-2 border-blue-600 px-1 py-3 text-lg font-semibold text-blue-600"
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
                className="px-1 py-3 text-lg font-semibold text-gray-600 transition hover:text-gray-900"
              >
                All Rentings
              </Link>
            </div>
          </div>

          <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <label
              htmlFor="search-bookings"
              className="mb-3 block text-lg font-semibold text-gray-700"
            >
              Search Bookings
            </label>

            <input
              id="search-bookings"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, room number or booking ID..."
              className="w-full p-3 border rounded-lg
            text-black                /* input text color */
            placeholder-gray-500     /* darker placeholder */
            focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </section>

          <section className="mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-gray-50 text-sm uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Booking ID</th>
                    <th className="px-6 py-4 font-semibold">Customer Name</th>
                    <th className="px-6 py-4 font-semibold">Room</th>
                    <th className="px-6 py-4 font-semibold">Check-In</th>
                    <th className="px-6 py-4 font-semibold">Check-Out</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loadingTable ? (
                    <tr className="border-t border-gray-200">
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        Loading bookings...
                      </td>
                    </tr>
                  ) : filteredRows.length === 0 ? (
                    <tr className="border-t border-gray-200">
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        No bookings match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row) => (
                      <tr
                        key={row.bookingID}
                        className="border-t border-gray-200 text-base text-gray-800"
                      >
                        <td className="px-6 py-5 font-medium">
                          {formatBookingId(row.bookingID)}
                        </td>
                        <td className="px-6 py-5">{row.customerName}</td>
                        <td className="px-6 py-5">{row.roomNumber ?? "-"}</td>
                        <td className="px-6 py-5">{formatDate(row.startDate)}</td>
                        <td className="px-6 py-5">{formatDate(row.endDate)}</td>
                        <td className="px-6 py-5">
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusBadge(
                              row.status
                            )}`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <button
                            onClick={() => handleViewDetails(row.bookingID)}
                            disabled={loadingBookingId === row.bookingID}
                            className="rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                          >
                            {loadingBookingId === row.bookingID
                              ? "Loading..."
                              : "View Details"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {message && (
            <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
              {message}
            </div>
          )}

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-2xl font-bold text-gray-900">Booking Details</h3>

            {!selectedBooking ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-gray-500">
                Select a booking from the table to load its real database details.
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl bg-gray-50 p-5">
                    <h4 className="mb-3 text-lg font-semibold text-gray-800">Booking Info</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p><strong>Booking ID:</strong> {selectedBooking.bookingID}</p>
                      <p><strong>Customer ID:</strong> {selectedBooking.customerID}</p>
                      <p><strong>Hotel ID:</strong> {selectedBooking.hotelID}</p>
                      <p><strong>Room Number:</strong> {selectedBooking.roomNumber}</p>
                      <p><strong>Start Date:</strong> {formatDate(selectedBooking.startDate)}</p>
                      <p><strong>End Date:</strong> {formatDate(selectedBooking.endDate)}</p>
                      <p><strong>Status:</strong> {selectedBooking.status}</p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-5">
                    <h4 className="mb-3 text-lg font-semibold text-gray-800">Snapshot Info</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p><strong>Customer Name:</strong> {selectedBooking.customerName}</p>
                      <p><strong>Customer ID Snapshot:</strong> {selectedBooking.customerIdSnapshot}</p>
                      <p><strong>Room Snapshot:</strong> {selectedBooking.roomSnapshot}</p>
                      <p><strong>Hotel Snapshot:</strong> {selectedBooking.hotelSnapshot}</p>
                      <p><strong>Chain Name:</strong> {selectedBooking.chainName}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckIn}
                  className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  Complete Check-In
                </button>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}