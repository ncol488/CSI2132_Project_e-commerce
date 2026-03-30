"use client";

import Link from "next/link";
import { useState } from "react";

type CustomerMode = "existing" | "new";

export default function Page() {
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

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreateWalkIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // quick front-end check that dates make sense
    if (startDate >= endDate) {
      setMessage("End date must be after start date.");
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Failed to create walk-in renting.");
        setLoading(false);
        return;
      }

      setMessage(data.message || "Walk-in renting created successfully.");

      // reset all fields after success
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
      setMessage("Something went wrong while creating the renting.");
    }

    setLoading(false);
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
            <h2 className="text-4xl font-bold text-gray-900">
              Front Desk Operations
            </h2>
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
                className="border-b-2 border-blue-600 px-1 py-3 text-lg font-semibold text-blue-600"
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

          <form onSubmit={handleCreateWalkIn} className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900">
                Customer Type
              </h3>
              <p className="mt-2 text-gray-600">
                Choose whether this is an existing customer or a new one.
              </p>

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setCustomerMode("existing")}
                  className={`rounded-xl px-4 py-2 font-medium transition ${
                    customerMode === "existing"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Existing Customer
                </button>

                <button
                  type="button"
                  onClick={() => setCustomerMode("new")}
                  className={`rounded-xl px-4 py-2 font-medium transition ${
                    customerMode === "new"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  New Customer
                </button>
              </div>
            </div>

            {customerMode === "existing" ? (
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="text-2xl font-bold text-gray-900">
                  Existing Customer Info
                </h3>
                <p className="mt-2 text-gray-600">
                  Search for the customer by first and last name.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={existingFirstName}
                      onChange={(e) => setExistingFirstName(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
                      required={customerMode === "existing"}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={existingLastName}
                      onChange={(e) => setExistingLastName(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
                      required={customerMode === "existing"}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="text-2xl font-bold text-gray-900">
                  New Customer Info
                </h3>
                <p className="mt-2 text-gray-600">
                  Enter the new customer’s information.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
                      required={customerMode === "new"}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
                      required={customerMode === "new"}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Street
                    </label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
                      required={customerMode === "new"}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
                      required={customerMode === "new"}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Province
                    </label>
                    <input
                      type="text"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
                      required={customerMode === "new"}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
                      required={customerMode === "new"}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      ID Type
                    </label>
                    <select
                      value={idType}
                      onChange={(e) => setIdType(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
                      required={customerMode === "new"}
                    >
                      <option value="">Select ID Type</option>
                      <option value="SIN">SIN</option>
                      <option value="PASSPORT">Passport</option>
                      <option value="DRIVING_LICENSE">Driving License</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      ID Value
                    </label>
                    <input
                      type="text"
                      value={idValue}
                      onChange={(e) => setIdValue(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
                      required={customerMode === "new"}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900">
                Renting Info
              </h3>
              <p className="mt-2 text-gray-600">
                Enter the hotel, room number, and renting dates.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Hotel ID
                  </label>
                  <input
                    type="number"
                    value={hotelID}
                    onChange={(e) => setHotelID(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Room Number
                  </label>
                  <input
                    type="number"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {loading ? "Creating..." : "Create Walk-In Renting"}
              </button>

              {message && (
                <div className="mt-4 rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-700">
                  {message}
                </div>
              )}
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}