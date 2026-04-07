"use client";

import Link from "next/link";
import { useState } from "react";
import Sidebar from "../../components/sidebar";
type CustomerMode = "existing" | "new";

export default function WalkInPage() {
  const [customerMode, setCustomerMode] = useState<CustomerMode>("existing");

  // existing customer search fields
  const [existingFirstName, setExistingFirstName] = useState("");
  const [existingLastName, setExistingLastName] = useState("");

  // new customer fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [idType, setIdType] = useState("");
  const [idValue, setIdValue] = useState("");

  // renting fields
  const [hotelID, setHotelID] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreateWalkIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (startDate >= endDate) {
      setMessage({ type: "error", text: "End date must be after start date." });
      setLoading(false);
      return;
    }

    try {
      const payload =
        customerMode === "existing"
          ? {
              customerMode,
              first_name: existingFirstName,
              last_name: existingLastName,
              hotelID: Number(hotelID),
              room_number: Number(roomNumber),
              start_date: startDate,
              end_date: endDate,
            }
          : {
              customerMode,
              first_name: firstName,
              last_name: lastName,
              street,
              city,
              province,
              postal_code: postalCode,
              id_type: idType,
              id_value: idValue,
              hotelID: Number(hotelID),
              room_number: Number(roomNumber),
              start_date: startDate,
              end_date: endDate,
            };

      const response = await fetch("/api/rentings/walkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({
          type: "error",
          text: data.error || "Failed to create walk-in renting.",
        });
        setLoading(false);
        return;
      }

      setMessage({
        type: "success",
        text: data.message || "Walk-in renting created successfully.",
      });

      // reset all fields
      setExistingFirstName("");
      setExistingLastName("");
      setFirstName("");
      setLastName("");
      setStreet("");
      setCity("");
      setProvince("");
      setPostalCode("");
      setIdType("");
      setIdValue("");
      setHotelID("");
      setRoomNumber("");
      setStartDate("");
      setEndDate("");
    } catch (error) {
      console.error("Walk-in form error:", error);
      setMessage({
        type: "error",
        text: "Something went wrong while creating the renting.",
      });
    }

    setLoading(false);
  }

  const inputClass =
    "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass =
    "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500";

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        <Sidebar role="employee" />

        <section className="flex-1 overflow-auto">
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Walk-In Renting
              </Link>
              <Link
                href="/employee/rentings"
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                All Rentings
              </Link>
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleCreateWalkIn} className="space-y-5 max-w-3xl">
              {/* Customer type toggle */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-semibold text-gray-900">
                  Customer Type
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Choose whether this is an existing customer or a new one.
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomerMode("existing")}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                      customerMode === "existing"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Existing Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerMode("new")}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                      customerMode === "new"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    New Customer
                  </button>
                </div>
              </div>

              {/* Customer fields */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-1 text-base font-semibold text-gray-900">
                  {customerMode === "existing"
                    ? "Existing Customer"
                    : "New Customer Info"}
                </h3>
                <p className="mb-5 text-sm text-gray-500">
                  {customerMode === "existing"
                    ? "Search for the customer by first and last name."
                    : "Enter the new customer's details."}
                </p>

                {customerMode === "existing" ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>First Name</label>
                      <input
                        type="text"
                        value={existingFirstName}
                        onChange={(e) => setExistingFirstName(e.target.value)}
                        className={inputClass}
                        required
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Last Name</label>
                      <input
                        type="text"
                        value={existingLastName}
                        onChange={(e) => setExistingLastName(e.target.value)}
                        className={inputClass}
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className={inputClass}
                        required
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className={inputClass}
                        required
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Street</label>
                      <input
                        type="text"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className={inputClass}
                        required
                      />
                    </div>
                    <div>
                      <label className={labelClass}>City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className={inputClass}
                        required
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Province</label>
                      <input
                        type="text"
                        value={province}
                        onChange={(e) => setProvince(e.target.value)}
                        className={inputClass}
                        required
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Postal Code</label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className={inputClass}
                        required
                      />
                    </div>
                    <div>
                      <label className={labelClass}>ID Type</label>
                      <select
                        value={idType}
                        onChange={(e) => setIdType(e.target.value)}
                        className={inputClass}
                        required
                      >
                        <option value="">Select ID Type</option>
                        <option value="SIN">SIN</option>
                        <option value="PASSPORT">Passport</option>
                        <option value="DRIVING_LICENSE">Driving License</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>ID Value</label>
                      <input
                        type="text"
                        value={idValue}
                        onChange={(e) => setIdValue(e.target.value)}
                        className={inputClass}
                        required
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Renting info */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-1 text-base font-semibold text-gray-900">
                  Renting Info
                </h3>
                <p className="mb-5 text-sm text-gray-500">
                  Enter the hotel, room number, and renting dates.
                </p>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>Hotel ID</label>
                    <input
                      type="number"
                      value={hotelID}
                      onChange={(e) => setHotelID(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Room Number</label>
                    <input
                      type="number"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {loading ? "Creating..." : "Create Walk-In Renting"}
                  </button>

                  {message && (
                    <p
                      className={`text-sm font-medium ${message.type === "success" ? "text-green-600" : "text-red-600"}`}
                    >
                      {message.text}
                    </p>
                  )}
                </div>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
