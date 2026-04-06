"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

//payment recording form, saves into a payment table

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

export default function PaymentsPage() {
  const searchParams = useSearchParams();
  const rentingID = searchParams.get("rentingID");

  const [details, setDetails] = useState<PaymentDetails | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadPaymentPage() {
      if (!rentingID) {
        setMessage("No renting was selected.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/payments?rentingID=${rentingID}`);
        const data = await response.json();

        if (!response.ok) {
          setMessage(data.error || "Could not load payment details.");
          return;
        }

        setDetails(data);
      } catch (error) {
        console.error("Payment page load error:", error);
        setMessage("Failed to load payment details.");
      } finally {
        setLoading(false);
      }
    }

    loadPaymentPage();
  }, [rentingID]);

  async function handleRecordPayment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!rentingID) {
      setMessage("No renting was selected.");
      return;
    }

    if (!paymentMethod) {
      setMessage("Please select a payment method.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rentingID: Number(rentingID),
          payment_method: paymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Could not record payment.");
        return;
      }

      setMessage(data.message || "Payment recorded successfully.");

      // reload details so the page updates to "already paid"
      const refreshResponse = await fetch(`/api/payments?rentingID=${rentingID}`);
      const refreshData = await refreshResponse.json();

      if (refreshResponse.ok) {
        setDetails(refreshData);
      }
    } catch (error) {
      console.error("Payment submit error:", error);
      setMessage("Something went wrong while recording the payment.");
    } finally {
      setSubmitting(false);
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
            <h2 className="text-4xl font-bold text-gray-900">Record Payment</h2>
            <p className="mt-2 text-gray-600">
              Attach a payment to an existing renting.
            </p>
          </header>

          <div className="mb-8">
            <Link
              href="/employee/rentings"
              className="inline-block rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300"
            >
              Back to All Rentings
            </Link>
          </div>

          {message && (
            <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
              {message}
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-gray-600">Loading payment details...</p>
            </div>
          ) : !details ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-gray-600">No renting details found.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* have renting info */}
              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-2xl font-bold text-gray-900">
                  Renting Details
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Renting ID</p>
                    <p className="text-lg text-gray-900">
                      {formatRentingId(details.renting.rentingid)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500">Booking Ref</p>
                    <p className="text-lg text-gray-900">
                      {formatBookingId(details.renting.bookingid)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500">Customer</p>
                    <p className="text-lg text-gray-900">
                      {details.renting.customer_name_snapshot}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500">Hotel ID</p>
                    <p className="text-lg text-gray-900">{details.renting.hotelid ?? "-"}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500">Room Number</p>
                    <p className="text-lg text-gray-900">{details.renting.room_number ?? "-"}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500">Check-In Time</p>
                    <p className="text-lg text-gray-900">
                      {formatDateTime(details.renting.checkin_datetime)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500">Start Date</p>
                    <p className="text-lg text-gray-900">
                      {formatDate(details.renting.start_date)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500">End Date</p>
                    <p className="text-lg text-gray-900">
                      {formatDate(details.renting.end_date)}
                    </p>
                  </div>
                </div>
              </section>

              {/* payment calculation summary, shows amount and how many days stayed */}
              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-2xl font-bold text-gray-900">
                  Payment Summary
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-sm font-medium text-gray-500">Price per day</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${details.pricePerDay.toFixed(2)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-sm font-medium text-gray-500">Number of days</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {details.numberOfDays}
                    </p>
                  </div>

                  <div className="rounded-xl bg-blue-50 p-4">
                    <p className="text-sm font-medium text-blue-600">Total amount</p>
                    <p className="text-2xl font-bold text-blue-700">
                      ${details.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </section>

              {details.existingPayment ? (
                <section className="rounded-2xl border border-green-200 bg-green-50 p-6 shadow-sm">
                  <h3 className="mb-4 text-2xl font-bold text-green-800">
                    Payment Already Recorded
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm font-medium text-green-700">Payment ID</p>
                      <p className="text-lg text-green-900">
                        {details.existingPayment.paymentid}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-green-700">Method</p>
                      <p className="text-lg text-green-900">
                        {details.existingPayment.payment_method}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-green-700">Amount</p>
                      <p className="text-lg text-green-900">
                        ${Number(details.existingPayment.amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </section>
              ) : (
                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 text-2xl font-bold text-gray-900">
                    Payment Form
                  </h3>

                  <form onSubmit={handleRecordPayment} className="space-y-4">
                    <div className="max-w-md">
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Payment Method
                      </label>

                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
                        required
                      >
                        <option value="">Select payment method</option>
                        <option value="Cash">Cash</option>
                        <option value="Debit">Debit</option>
                        <option value="Credit">Credit</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                      {submitting ? "Recording..." : "Record Payment"}
                    </button>
                  </form>
                </section>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}