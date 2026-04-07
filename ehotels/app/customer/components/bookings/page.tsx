"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Booking } from "../../type";
import Sidebar from "@/app/components/sidebar";

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

type PaymentStatus = Record<number, "paid" | "unpaid" | "checking">;

export default function MyBookingsPage() {
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [cancelError, setCancelError] = useState("");
  const [cancelSuccess, setCancelSuccess] = useState("");
  const [customerID, setCustomerID] = useState<number | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({});

  // Read customerID from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("customerID");
    if (!stored) {
      router.push("/");
      return;
    }
    setCustomerID(parseInt(stored));
  }, []);
  useEffect(() => {
    if (customerID !== null) fetchBookings();
  }, [customerID]);

  useEffect(() => {
    const handleVisible = () => {
      if (document.visibilityState === "visible" && customerID !== null) {
        fetchBookings();
      }
    };
    document.addEventListener("visibilitychange", handleVisible);
    return () =>
      document.removeEventListener("visibilitychange", handleVisible);
  }, [customerID]);

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/bookings?customerID=${customerID}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load bookings.");
      } else {
        const rows: Booking[] = data.bookings || [];
        setBookings(rows);
        rows
          .filter((b) => b.status === "checked-in" && b.rentingID)
          .forEach((b) => {
            console.log(
              "will check payment for",
              b.bookingID,
              "rentingID:",
              b.rentingID,
            );
            checkPaymentStatus(b.bookingID, b.rentingID!);
          });
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const checkPaymentStatus = async (bookingID: number, rentingID: number) => {
    setPaymentStatus((prev) => ({ ...prev, [bookingID]: "checking" }));
    try {
      const res = await fetch(`/api/payments?rentingID=${rentingID}`);
      const data = await res.json();
      setPaymentStatus((prev) => ({
        ...prev,
        [bookingID]: data.existingPayment ? "paid" : "unpaid",
      }));
    } catch {
      setPaymentStatus((prev) => ({ ...prev, [bookingID]: "unpaid" }));
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

  const active = bookings.filter(
    (b) => b.status === "checked-in" && new Date(b.end_date) >= today,
  );
  const upcoming = bookings.filter(
    (b) => b.status === "confirmed" && new Date(b.start_date) >= today,
  );
  const past = bookings.filter((b) => {
    const isCancelled = b.status === "cancelled";
    const isPastConfirmed =
      b.status === "confirmed" && new Date(b.end_date) < today;
    const isPastCheckedIn =
      b.status === "checked-in" && new Date(b.end_date) < today;
    return isCancelled || isPastConfirmed || isPastCheckedIn;
  });

  return (
    <div
      className="min-h-screen bg-gray-50 flex"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <Sidebar role="customer" />

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

          {/* ── Current Stay ── */}
          {!loading && active.length > 0 && (
            <section className="mb-8">
              <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
                </span>
                Current Stay
              </h2>
              <div className="space-y-3">
                {active.map((b) => (
                  <BookingCard
                    key={b.bookingID}
                    booking={b}
                    canCancel={false}
                    cancelling={false}
                    onCancel={() => {}}
                    paymentStatus={paymentStatus[b.bookingID]}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── Upcoming ── */}
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
                    onCancel={() => handleCancel(b.bookingID)}
                    paymentStatus={undefined}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── Past & Cancelled ── */}
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
                    cancelling={false}
                    onCancel={() => {}}
                    paymentStatus={paymentStatus[b.bookingID]}
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
  paymentStatus,
}: {
  booking: Booking;
  canCancel: boolean;
  cancelling: boolean;
  onCancel: () => void;
  paymentStatus: "paid" | "unpaid" | "checking" | undefined;
}) {
  const isCheckedIn = booking.status === "checked-in";

  return (
    <div
      className={`bg-white border rounded-2xl p-5 shadow-sm transition-opacity ${
        booking.status === "cancelled" ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Hotel + status badge */}
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

          <p className="text-xs text-gray-400 truncate">
            {booking.room_snapshot}
          </p>

          {/* Payment status — only shown for checked-in bookings */}
          {isCheckedIn && (
            <div className="mt-3 flex items-center gap-2">
              {paymentStatus === "checking" && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <div className="w-3 h-3 border border-gray-300 border-t-transparent rounded-full animate-spin" />
                  Checking payment...
                </span>
              )}
              {paymentStatus === "paid" && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">
                  <svg
                    className="w-3 h-3"
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
                  Paid
                </span>
              )}
              {paymentStatus === "unpaid" && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Payment pending
                </span>
              )}
            </div>
          )}
        </div>

        {/* Price + action buttons */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          {booking.total_price !== null && booking.total_price !== undefined ? (
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

          {/* Pay Now — only shown when checked-in, unpaid, and rentingID exists */}
          {isCheckedIn && paymentStatus === "unpaid" && booking.rentingID && (
            <a
              href={`/customer/components/payment?rentingID=${booking.rentingID}`}
              className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              Pay Now
            </a>
          )}

          {/* Cancel booking */}
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
