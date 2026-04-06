"use client";

//implements views from DB

import Link from "next/link";
import { useEffect, useState } from "react";

type AvailableRoomRow = {
  area: string;
  availableRooms: number;
};

type HotelCapacityRow = {
  hotelID: number;
  city: string;
  totalCapacity: number;
};

export default function ReportsPage() {
  const [availableRoomsPerArea, setAvailableRoomsPerArea] = useState<
    AvailableRoomRow[]
  >([]);
  const [hotelTotalCapacity, setHotelTotalCapacity] = useState<
    HotelCapacityRow[]
  >([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function fetchReports() {
    try {
      setLoading(true);

      const response = await fetch("/api/reports");
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Could not load reports.");
        return;
      }

      setAvailableRoomsPerArea(data.availableRoomsPerArea || []);
      setHotelTotalCapacity(data.hotelTotalCapacity || []);
    } catch (error) {
      setMessage("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 overflow-x-hidden">
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
              href="/employee#management"
              className="block rounded-xl px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Management
            </Link>

            <Link
              href="/employee/management/customers"
              className="block rounded-xl px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Customers
            </Link>

            <Link
              href="/employee/management/employees"
              className="block rounded-xl px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Employees
            </Link>

            <Link
              href="/employee/management/hotels"
              className="block rounded-xl px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Hotels
            </Link>

            <Link
              href="/employee/management/rooms"
              className="block rounded-xl px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Rooms
            </Link>

            <Link
              href="/employee/reports"
              className="block rounded-xl bg-blue-50 px-4 py-3 font-medium text-blue-700"
            >
              Reports
            </Link>
          </nav>
        </aside>

        <section className="flex-1 p-8">
          <div className="mx-auto w-full max-w-6xl">
            <header className="mb-6">
              <h2 className="text-4xl font-bold text-gray-900">Reports</h2>
            </header>

            {message && (
              <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                {message}
              </div>
            )}

            {loading ? (
              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-gray-500">Loading reports...</p>
              </section>
            ) : (
              <>
                {/* View 1 */}
                <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Available Rooms Per Area
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Number of currently available rooms grouped by city
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                      <thead className="bg-gray-50 text-sm uppercase tracking-wide text-gray-500">
                        <tr>
                          <th className="px-6 py-4 font-semibold">Area</th>
                          <th className="px-6 py-4 font-semibold">
                            Available Rooms
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {availableRoomsPerArea.length === 0 ? (
                          <tr className="border-t border-gray-200">
                            <td
                              colSpan={2}
                              className="px-6 py-8 text-center text-gray-500"
                            >
                              No data found.
                            </td>
                          </tr>
                        ) : (
                          availableRoomsPerArea.map((row) => (
                            <tr
                              key={row.area}
                              className="border-t border-gray-200 text-base text-gray-800"
                            >
                              <td className="px-6 py-5 font-medium">
                                {row.area}
                              </td>
                              <td className="px-6 py-5">
                                {row.availableRooms}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* View 2 */}
                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Hotel Total Capacity
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Aggregated room capacity for each hotel
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                      <thead className="bg-gray-50 text-sm uppercase tracking-wide text-gray-500">
                        <tr>
                          <th className="px-6 py-4 font-semibold">Hotel ID</th>
                          <th className="px-6 py-4 font-semibold">City</th>
                          <th className="px-6 py-4 font-semibold">
                            Total Capacity
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {hotelTotalCapacity.length === 0 ? (
                          <tr className="border-t border-gray-200">
                            <td
                              colSpan={3}
                              className="px-6 py-8 text-center text-gray-500"
                            >
                              No data found.
                            </td>
                          </tr>
                        ) : (
                          hotelTotalCapacity.map((row) => (
                            <tr
                              key={row.hotelID}
                              className="border-t border-gray-200 text-base text-gray-800"
                            >
                              <td className="px-6 py-5 font-medium">
                                {row.hotelID}
                              </td>
                              <td className="px-6 py-5">{row.city}</td>
                              <td className="px-6 py-5">
                                {row.totalCapacity}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}