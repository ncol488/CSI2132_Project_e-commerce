"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/app/components/sidebar";

type PaymentDetails = {
  renting: {
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
    price: number;
  };
  pricePerDay: number;
  numberOfDays: number;
  totalAmount: number;
  existingPayment: {
    paymentid: number;
    rentingid: number;
    amount: number;
    payment_date: string;
    payment_method: string;
  } | null;
};

function formatDate(dateString: string | null | undefined) {
  if (!dateString) return "-";
  return new Date(dateString).toISOString().split("T")[0];
}

function formatDateTime(dateString: string | null | undefined) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString();
}

export default function CustomerPaymentsPage() {
  const searchParams = useSearchParams();
  const rentingID = searchParams.get("rentingID");

  const [details, setDetails] = useState<PaymentDetails | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">(
    "info",
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      if (!rentingID) {
        setMessage("No renting was selected.");
        setMessageType("error");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/payments?rentingID=${rentingID}`);
        const data = await res.json();
        if (!res.ok) {
          setMessage(data.error || "Could not load payment details.");
          setMessageType("error");
          return;
        }
        setDetails(data);
      } catch {
        setMessage("Failed to load payment details.");
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [rentingID]);

  async function handleRecordPayment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!rentingID) {
      setMessage("No renting selected.");
      setMessageType("error");
      return;
    }
    if (!paymentMethod) {
      setMessage("Please select a payment method.");
      setMessageType("error");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rentingID: Number(rentingID),
          payment_method: paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Could not record payment.");
        setMessageType("error");
        return;
      }
      setMessage("Payment recorded successfully! Thank you for your stay.");
      setMessageType("success");

      // Refresh so the "already paid" section appears
      const refresh = await fetch(`/api/payments?rentingID=${rentingID}`);
      const refreshData = await refresh.json();
      if (refresh.ok) setDetails(refreshData);
    } catch {
      setMessage("Something went wrong. Please try again.");
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      className="min-h-screen bg-gray-50 flex"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <Sidebar role="customer" />

      <section className="flex-1 overflow-auto">
        {/* ── Header ── */}
        <div className="border-b border-gray-200 bg-white px-8 py-6">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Complete Payment
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Pay for your current stay
          </p>
        </div>

        <div className="p-8 max-w-3xl">
          {/* Back link */}
          <Link
            href="/customer/bookings"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to My Bookings
          </Link>

          {/* Feedback banner */}
          {message && (
            <div
              className={`mb-6 rounded-xl border p-4 text-sm font-medium ${
                messageType === "error"
                  ? "border-red-100 bg-red-50 text-red-800"
                  : messageType === "success"
                    ? "border-green-100 bg-green-50 text-green-800"
                    : "border-blue-100 bg-blue-50 text-blue-800"
              }`}
            >
              {message}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && !details && !message && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm text-sm text-gray-500">
              No renting details found.
            </div>
          )}

          {!loading && details && (
            <div className="space-y-5">
              {/* ── Stay details ── */}
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-6 py-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                    Stay Details
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-0 divide-x divide-y divide-gray-100 md:grid-cols-4">
                  {[
                    {
                      label: "Customer",
                      value: details.renting.customer_name_snapshot,
                    },
                    {
                      label: "Room",
                      value: details.renting.room_number ?? "-",
                    },
                    {
                      label: "Check-in",
                      value: formatDateTime(details.renting.checkin_datetime),
                    },
                    {
                      label: "Start Date",
                      value: formatDate(details.renting.start_date),
                    },
                    {
                      label: "End Date",
                      value: formatDate(details.renting.end_date),
                    },
                    {
                      label: "Hotel ID",
                      value: details.renting.hotelid ?? "-",
                    },
                  ].map(({ label, value }) => (
                    <div key={label} className="px-6 py-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                        {label}
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Payment summary ── */}
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-6 py-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                    Payment Summary
                  </h3>
                </div>
                <div className="grid grid-cols-3 p-6 gap-4">
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                      Price / Night
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${details.pricePerDay.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                      Nights
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {details.numberOfDays}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-500 mb-2">
                      Total Due
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      ${details.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Already paid ── */}
              {details.existingPayment ? (
                <div className="overflow-hidden rounded-xl border border-green-200 bg-green-50 shadow-sm">
                  <div className="border-b border-green-100 px-6 py-4 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-green-600"
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
                    <h3 className="text-sm font-bold uppercase tracking-wider text-green-700">
                      Payment Complete
                    </h3>
                  </div>
                  <div className="grid grid-cols-3 p-6 gap-4">
                    <div className="text-center">
                      <p className="text-xs font-semibold uppercase tracking-wide text-green-600 mb-1">
                        Payment ID
                      </p>
                      <p className="text-lg font-bold text-green-900">
                        {details.existingPayment.paymentid}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold uppercase tracking-wide text-green-600 mb-1">
                        Method
                      </p>
                      <p className="text-lg font-bold text-green-900">
                        {details.existingPayment.payment_method}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold uppercase tracking-wide text-green-600 mb-1">
                        Amount Paid
                      </p>
                      <p className="text-lg font-bold text-green-900">
                        ${Number(details.existingPayment.amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="px-6 pb-5 text-center">
                    <Link
                      href="/customer/bookings"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      ← Back to My Bookings
                    </Link>
                  </div>
                </div>
              ) : (
                /* ── Payment form ── */
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                  <div className="border-b border-gray-100 px-6 py-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                      Payment Method
                    </h3>
                  </div>
                  <form onSubmit={handleRecordPayment} className="p-6">
                    <div className="mb-5 max-w-sm">
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Select Payment Method
                      </label>
                      <div className="relative">
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          required
                          className="w-full appearance-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-8"
                        >
                          <option value="">Choose a method...</option>
                          <option value="Cash">Cash</option>
                          <option value="Debit">Debit</option>
                          <option value="Credit">Credit</option>
                        </select>
                        <svg
                          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
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
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                          </svg>
                          Pay ${details.totalAmount.toFixed(2)}
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
