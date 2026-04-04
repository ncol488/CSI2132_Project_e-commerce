"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Booking } from "../../type";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function StatusBadge({ status }: { status: Booking["status"] }) {
  const styles: Record<Booking["status"], string> = {
    confirmed: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    cancelled: "bg-red-100 text-red-600",
    "checked-in": "bg-blue-100 text-blue-700",
  };
  return (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function MyBookingsPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [cancelError, setCancelError] = useState("");
  const [cancelSuccess, setCancelSuccess] = useState("");
  const [customerID, setCustomerID] = useState<number | null>(null);

  const handlePay = async (bookingID: number) => {
    const confirmPayment = confirm(
      "Would you like to pay the full balance for this renting?",
    );

    if (confirmPayment) {
      try {
        const res = await fetch(`/api/payments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingID,
            amount: bookings.find((b) => b.bookingID === bookingID)
              ?.total_price,
          }),
        });

        if (res.ok) {
          alert("Payment successful! Thank you for staying with us.");
          fetchBookings();
        }
      } catch (err) {
        alert("Payment failed. Please try again.");
      }
    }
  };

  useEffect(() => {
    if (customerID !== null) fetchBookings();
  }, [customerID]);

  useEffect(() => {
    const stored = localStorage.getItem("customerID");
    if (!stored) {
      router.push("/");
      return;
    }
    setCustomerID(parseInt(stored));
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/bookings?customerID=${customerID}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load bookings.");
      } else {
        setBookings(data.bookings || []);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingID: number) => {
    setCancelling(bookingID);
    setCancelError("");
    setCancelSuccess("");

    try {
      const res = await fetch(`/api/bookings/${bookingID}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerID }),
      });
      const data = await res.json();

      if (!res.ok) {
        setCancelError(data.error || "Failed to cancel booking.");
      } else {
        setCancelSuccess(`Booking #${bookingID} has been cancelled.`);
        fetchBookings();
      }
    } catch {
      setCancelError("Something went wrong. Please try again.");
    } finally {
      setCancelling(null);
    }
  };

  const canCancel = (booking: Booking) => {
    if (booking.status === "cancelled") return false;
    const today = new Date();
    const checkIn = new Date(booking.start_date);
    today.setHours(0, 0, 0, 0);
    return checkIn > today;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Active stay (The "Renting" phase)
  // Only show if the employee has officially checked them in.
  const active = bookings.filter((b) => b.status === "checked-in");

  // Upcoming reservations
  // Must be confirmed, NOT checked-in yet, and the start date is today or later.
  const upcoming = bookings.filter(
    (b) => b.status === "confirmed" && new Date(b.start_date) >= today,
  );

  // Past and cancelled
  // Includes anything explicitly 'cancelled' OR 'confirmed' stays that have already ended.
  const past = bookings.filter(
    (b) =>
      b.status === "cancelled" ||
      (b.status === "confirmed" && new Date(b.end_date) < today) ||
      (b.status === "checked-in" && new Date(b.end_date) < today),
  );

  return (
    <div
      className="min-h-screen bg-gray-50 flex"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Sidebar ── */}
      <aside className="w-64 min-h-screen bg-white border-r border-gray-100 flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-tight">
                e-Hotels
              </p>
              <p className="text-xs text-gray-400">Management System</p>
            </div>
          </div>
        </div>

        <div className="px-4 pt-5">
          <div className="flex gap-2">
            <button className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white shadow-sm">
              Customer
            </button>
            <button
              onClick={() => router.push("/employee")}
              className="flex-1 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-500 hover:border-gray-300 transition-colors"
            >
              Employee
            </button>
          </div>
        </div>

        <nav className="px-3 pt-4 flex-1 space-y-1">
          <button
            onClick={() => router.push("/customer")}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-500 hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Search &amp; Book
          </button>
          <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 text-sm font-medium">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            My Bookings
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <p className="text-xs text-gray-300">© 2026 e-Hotels Consortium</p>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col">
        {/* Hero */}
        <div
          className="px-10 pt-14 pb-16 text-center"
          style={{
            background:
              "linear-gradient(135deg, #2d3bff 0%, #4f46e5 60%, #6366f1 100%)",
          }}
        >
          <h1 className="text-4xl font-bold text-white tracking-tight">
            My Bookings
          </h1>
          <p className="text-blue-100 mt-2 text-sm">
            View and manage all your room reservations
          </p>
        </div>

        <div className="px-8 py-8 max-w-4xl mx-auto w-full">
          {/* Feedback banners */}
          {cancelSuccess && (
            <div className="mb-5 flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 text-sm px-4 py-3 rounded-xl">
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {cancelSuccess}
            </div>
          )}
          {cancelError && (
            <div className="mb-5 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
              {cancelError}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="text-center py-20 text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && bookings.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">No bookings yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Search for rooms and make your first booking.
              </p>
              <button
                onClick={() => router.push("/customer")}
                className="mt-5 bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Search Rooms
              </button>
            </div>
          )}

          {/* ── Active Stays (Current Renting) ── */}
          {!loading && active.length > 0 && (
            <section className="mb-8">
              <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                Current Stay (Active Renting)
              </h2>
              <div className="space-y-3">
                {active.map((b) => (
                  <BookingCard
                    key={b.bookingID}
                    booking={b}
                    canCancel={false}
                    cancelling={false}
                    onPay={handlePay}
                    onCancel={() => {}}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── Upcoming bookings ── */}
          {!loading && upcoming.length > 0 && (
            <section className="mb-8">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Upcoming ({upcoming.length})
              </h2>
              <div className="space-y-3">
                {upcoming.map((b) => (
                  <BookingCard
                    key={b.bookingID}
                    booking={b}
                    canCancel={canCancel(b)}
                    cancelling={cancelling === b.bookingID}
                    onPay={handlePay}
                    onCancel={() => handleCancel(b.bookingID)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── Past / cancelled bookings ── */}
          {!loading && past.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Past &amp; Cancelled ({past.length})
              </h2>
              <div className="space-y-3">
                {past.map((b) => (
                  <BookingCard
                    key={b.bookingID}
                    booking={b}
                    canCancel={false}
                    onPay={handlePay}
                    cancelling={false}
                    onCancel={() => {}}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

function BookingCard({
  booking,
  canCancel,
  cancelling,
  onCancel,
  onPay,
}: {
  booking: Booking;
  canCancel: boolean;
  cancelling: boolean;
  onCancel: () => void;
  onPay: (id: number) => void;
}) {
  return (
    <div
      className={`bg-white border rounded-2xl p-5 shadow-sm transition-opacity ${
        booking.status === "cancelled" ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Hotel + chain */}
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 text-base leading-tight truncate">
              {booking.hotel_name}
            </h3>
            <StatusBadge status={booking.status} />
          </div>
          <p className="text-xs text-gray-400 mb-3">
            {booking.chain_name} · {booking.city}
          </p>

          {/* Dates */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <svg
              className="w-4 h-4 text-blue-500 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>
              {formatDate(booking.start_date)} → {formatDate(booking.end_date)}
              <span className="text-gray-400 ml-1">
                ({booking.nights} night{booking.nights !== 1 ? "s" : ""})
              </span>
            </span>
          </div>

          {/* Room details from snapshot */}
          <p className="text-xs text-gray-400 truncate">
            {booking.room_snapshot}
          </p>
        </div>

        {/* Price + cancel */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          {booking.total_price !== null ? (
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">
                ${booking.total_price.toFixed(2)}
              </p>
              {booking.price_per_night && (
                <p className="text-xs text-gray-400">
                  ${booking.price_per_night.toFixed(2)} / night
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-400">Price unavailable</p>
          )}

          {canCancel && (
            <button
              onClick={onCancel}
              disabled={cancelling}
              className="text-xs font-medium text-red-500 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelling ? "Cancelling..." : "Cancel Booking"}
            </button>
          )}
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-50">
        <p className="text-xs text-gray-300">Booking #{booking.bookingID}</p>
      </div>
    </div>
  );
}
