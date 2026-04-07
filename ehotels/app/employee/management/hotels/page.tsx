"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/app/components/sidebar";

type HotelRow = {
  hotelID: number;
  hotelName: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  category: number;
  chainID: number;
  chainName: string;
  centralOfficeAddress: string;
  hotelEmail: string | null;
  hotelPhone: string | null;
  chainEmail: string | null;
  chainPhone: string | null;
};

type HotelForm = {
  hotelName: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  category: string;
  chainID: string;
  chainName: string;
  centralOfficeAddress: string;
  hotelEmail: string;
  hotelPhone: string;
  chainEmail: string;
  chainPhone: string;
};

const emptyForm: HotelForm = {
  hotelName: "",
  street: "",
  city: "",
  province: "",
  postalCode: "",
  category: "",
  chainID: "",
  chainName: "",
  centralOfficeAddress: "",
  hotelEmail: "",
  hotelPhone: "",
  chainEmail: "",
  chainPhone: "",
};

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelClass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500";

export default function HotelsPage() {
  const [hotels, setHotels] = useState<HotelRow[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<HotelForm>(emptyForm);
  const [editingHotelID, setEditingHotelID] = useState<number | null>(null);

  async function fetchHotels() {
    try {
      setLoading(true);
      const response = await fetch("/api/hotels");
      const data = await response.json();
      if (!response.ok) {
        setMessage({
          type: "error",
          text: data.error || "Could not load hotels.",
        });
        return;
      }
      setHotels(data);
    } catch {
      setMessage({ type: "error", text: "Failed to load hotels." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHotels();
  }, []);

  const filteredHotels = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return hotels;
    return hotels.filter(
      (h) =>
        h.hotelID.toString().includes(q) ||
        h.hotelName.toLowerCase().includes(q) ||
        h.city.toLowerCase().includes(q) ||
        h.province.toLowerCase().includes(q) ||
        h.chainName.toLowerCase().includes(q) ||
        h.chainID.toString().includes(q),
    );
  }, [hotels, search]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingHotelID(null);
  }

  function startEdit(hotel: HotelRow) {
    setEditingHotelID(hotel.hotelID);
    setForm({
      hotelName: hotel.hotelName || "",
      street: hotel.street || "",
      city: hotel.city || "",
      province: hotel.province || "",
      postalCode: hotel.postalCode || "",
      category: String(hotel.category || ""),
      chainID: String(hotel.chainID || ""),
      chainName: hotel.chainName || "",
      centralOfficeAddress: hotel.centralOfficeAddress || "",
      hotelEmail: hotel.hotelEmail || "",
      hotelPhone: hotel.hotelPhone || "",
      chainEmail: hotel.chainEmail || "",
      chainPhone: hotel.chainPhone || "",
    });
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    try {
      const isEditing = editingHotelID !== null;
      const response = await fetch(
        isEditing ? `/api/hotels/${editingHotelID}` : "/api/hotels",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            category: Number(form.category),
            chainID: Number(form.chainID),
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        setMessage({
          type: "error",
          text: data.error || "Could not save hotel.",
        });
        return;
      }
      setMessage({
        type: "success",
        text: isEditing
          ? `Hotel ${editingHotelID} updated.`
          : "Hotel added successfully.",
      });
      resetForm();
      fetchHotels();
    } catch {
      setMessage({ type: "error", text: "Something went wrong." });
    }
  }

  async function handleDelete(hotelID: number) {
    if (!window.confirm(`Delete hotel ${hotelID}?`)) return;
    setMessage(null);
    try {
      const response = await fetch(`/api/hotels/${hotelID}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage({
          type: "error",
          text: data.error || "Could not delete hotel.",
        });
        return;
      }
      setMessage({ type: "success", text: `Hotel ${hotelID} deleted.` });
      if (editingHotelID === hotelID) resetForm();
      fetchHotels();
    } catch {
      setMessage({ type: "error", text: "Something went wrong." });
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        <Sidebar role="employee" />

        <section className="flex-1 overflow-auto">
          <div className="border-b border-gray-200 bg-white px-8 py-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Hotel Management
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              View, add, edit, and delete hotel records
            </p>
          </div>

          <div className="border-b border-gray-200 bg-white px-8">
            <div className="flex gap-6">
              {[
                { label: "Customers", href: "/employee/management/customers" },
                { label: "Employees", href: "/employee/management/employees" },
                { label: "Hotels", href: "/employee/management/hotels" },
                { label: "Rooms", href: "/employee/management/rooms" },
              ].map((tab) => (
                <a
                  key={tab.href}
                  href={tab.href}
                  className={`border-b-2 py-3.5 text-sm font-semibold transition ${
                    tab.label === "Hotels"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </a>
              ))}
            </div>
          </div>

          <div className="p-8">
            {message && (
              <div
                className={`mb-6 rounded-xl border px-4 py-3 text-sm font-medium ${
                  message.type === "success"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Form */}
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">
                  {editingHotelID
                    ? `Edit Hotel #${editingHotelID}`
                    : "Add New Hotel"}
                </h3>
                {editingHotelID && (
                  <button
                    onClick={resetForm}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <form
                onSubmit={handleSubmit}
                className="grid gap-4 md:grid-cols-2"
              >
                <div>
                  <label className={labelClass}>Hotel Name</label>
                  <input
                    name="hotelName"
                    value={form.hotelName}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Category</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  >
                    <option value="">Select category</option>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} star
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Street</label>
                  <input
                    name="street"
                    value={form.street}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>City</label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Province</label>
                  <input
                    name="province"
                    value={form.province}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Postal Code</label>
                  <input
                    name="postalCode"
                    value={form.postalCode}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Hotel Email</label>
                  <input
                    type="email"
                    name="hotelEmail"
                    value={form.hotelEmail}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Hotel Phone</label>
                  <input
                    name="hotelPhone"
                    value={form.hotelPhone}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                {/* Divider */}
                <div className="md:col-span-2 pt-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Chain Information
                  </p>
                  <div className="mt-2 border-t border-gray-100" />
                </div>

                <div>
                  <label className={labelClass}>Chain ID</label>
                  <input
                    type="number"
                    name="chainID"
                    value={form.chainID}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Chain Name</label>
                  <input
                    name="chainName"
                    value={form.chainName}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Central Office Address</label>
                  <input
                    name="centralOfficeAddress"
                    value={form.centralOfficeAddress}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Chain Email</label>
                  <input
                    type="email"
                    name="chainEmail"
                    value={form.chainEmail}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Chain Phone</label>
                  <input
                    name="chainPhone"
                    value={form.chainPhone}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    {editingHotelID ? "Save Changes" : "Add Hotel"}
                  </button>
                </div>
              </form>
            </div>

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
                Search Hotels
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by hotel name, city, province, chain name, hotel ID, or chain ID..."
                className={inputClass}
              />
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {[
                        "Hotel ID",
                        "Hotel Name",
                        "City",
                        "Province",
                        "Category",
                        "Chain",
                        "Actions",
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
                          colSpan={7}
                          className="px-6 py-10 text-center text-sm text-gray-400"
                        >
                          Loading hotels...
                        </td>
                      </tr>
                    ) : filteredHotels.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-10 text-center text-sm text-gray-400"
                        >
                          No hotels found.
                        </td>
                      </tr>
                    ) : (
                      filteredHotels.map((hotel) => (
                        <tr
                          key={hotel.hotelID}
                          className="border-t border-gray-100 hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {hotel.hotelID}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {hotel.hotelName}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {hotel.city}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {hotel.province}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {"★".repeat(hotel.category)}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {hotel.chainName}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEdit(hotel)}
                                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(hotel.hotelID)}
                                className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
                              >
                                Delete
                              </button>
                            </div>
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
