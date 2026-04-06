"use client";

// manage hotel changes

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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

export default function HotelsPage() {
  const [hotels, setHotels] = useState<HotelRow[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<HotelForm>(emptyForm);

  // if null = add hotel mode, otherwise edit mode
  const [editingHotelID, setEditingHotelID] = useState<number | null>(null);

  async function fetchHotels() {
    try {
      setLoading(true);

      const response = await fetch("/api/hotels");
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Could not load hotels.");
        return;
      }

      setHotels(data);
    } catch (error) {
      setMessage("Failed to load hotels.");
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

    return hotels.filter((hotel) => {
      return (
        hotel.hotelID.toString().includes(q) ||
        hotel.hotelName.toLowerCase().includes(q) ||
        hotel.city.toLowerCase().includes(q) ||
        hotel.province.toLowerCase().includes(q) ||
        hotel.chainName.toLowerCase().includes(q) ||
        hotel.chainID.toString().includes(q)
      );
    });
  }, [hotels, search]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
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

    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    try {
      const isEditing = editingHotelID !== null;

      const response = await fetch(
        isEditing ? `/api/hotels/${editingHotelID}` : "/api/hotels",
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            category: Number(form.category),
            chainID: Number(form.chainID),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Could not save hotel.");
        return;
      }

      setMessage(
        isEditing
          ? `Hotel ${editingHotelID} updated successfully.`
          : `Hotel added successfully.`
      );

      resetForm();
      fetchHotels();
    } catch (error) {
      setMessage("Something went wrong while saving the hotel.");
    }
  }

  async function handleDelete(hotelID: number) {
    const confirmed = window.confirm(
      `Are you sure you want to delete hotel ${hotelID}?`
    );

    if (!confirmed) return;

    setMessage("");

    try {
      const response = await fetch(`/api/hotels/${hotelID}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Could not delete hotel.");
        return;
      }

      setMessage(`Hotel ${hotelID} deleted successfully.`);

      if (editingHotelID === hotelID) {
        resetForm();
      }

      fetchHotels();
    } catch (error) {
      setMessage("Something went wrong while deleting the hotel.");
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
              href="/employee#management"
              className="block rounded-xl bg-blue-50 px-4 py-3 font-medium text-blue-700"
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
              className="block rounded-xl bg-blue-50 px-4 py-3 font-medium text-blue-700"
            >
              Hotels
            </Link>

            <Link
              href="/employee/management/rooms"
              className="block rounded-xl px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Rooms
            </Link>
          </nav>
        </aside>

        <section className="flex flex-1 justify-center p-8">
          <div className="w-full max-w-6xl">
            <header className="mb-6">
              <h2 className="text-4xl font-bold text-gray-900">
                Hotel Management
              </h2>
              <p className="mt-2 text-gray-600">
                View, add, edit, and delete hotel records
              </p>
            </header>

            {message && (
              <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                {message}
              </div>
            )}

            {/* Add / Edit form */}
            <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingHotelID
                    ? `Edit Hotel #${editingHotelID}`
                    : "Add New Hotel"}
                </h3>

                {editingHotelID && (
                  <button
                    onClick={resetForm}
                    className="rounded-xl bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-300"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Hotel Name
                  </label>
                  <input
                    name="hotelName"
                    value={form.hotelName}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Category
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border p-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    <option value="1">1 star</option>
                    <option value="2">2 star</option>
                    <option value="3">3 star</option>
                    <option value="4">4 star</option>
                    <option value="5">5 star</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Street
                  </label>
                  <input
                    name="street"
                    value={form.street}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    City
                  </label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Province
                  </label>
                  <input
                    name="province"
                    value={form.province}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Postal Code
                  </label>
                  <input
                    name="postalCode"
                    value={form.postalCode}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Hotel Email
                  </label>
                  <input
                    type="email"
                    name="hotelEmail"
                    value={form.hotelEmail}
                    onChange={handleChange}
                    className="w-full rounded-lg border p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Hotel Phone
                  </label>
                  <input
                    name="hotelPhone"
                    value={form.hotelPhone}
                    onChange={handleChange}
                    className="w-full rounded-lg border p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2 mt-2">
                  <h4 className="text-lg font-bold text-gray-900">
                    Chain Information
                  </h4>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Chain ID
                  </label>
                  <input
                    type="number"
                    name="chainID"
                    value={form.chainID}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Chain Name
                  </label>
                  <input
                    name="chainName"
                    value={form.chainName}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Central Office Address
                  </label>
                  <input
                    name="centralOfficeAddress"
                    value={form.centralOfficeAddress}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Chain Email
                  </label>
                  <input
                    type="email"
                    name="chainEmail"
                    value={form.chainEmail}
                    onChange={handleChange}
                    className="w-full rounded-lg border p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Chain Phone
                  </label>
                  <input
                    name="chainPhone"
                    value={form.chainPhone}
                    onChange={handleChange}
                    className="w-full rounded-lg border p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
                  >
                    {editingHotelID ? "Save Changes" : "Add Hotel"}
                  </button>
                </div>
              </form>
            </section>

            {/* Search */}
            <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <label
                htmlFor="search-hotels"
                className="mb-3 block text-lg font-semibold text-gray-700"
              >
                Search Hotels
              </label>

              <input
                id="search-hotels"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by hotel name, city, province, chain name, hotel ID, or chain ID..."
                className="w-full rounded-lg border p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </section>

            {/* Hotel table */}
            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-gray-50 text-sm uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Hotel ID</th>
                      <th className="px-6 py-4 font-semibold">Hotel Name</th>
                      <th className="px-6 py-4 font-semibold">City</th>
                      <th className="px-6 py-4 font-semibold">Province</th>
                      <th className="px-6 py-4 font-semibold">Category</th>
                      <th className="px-6 py-4 font-semibold">Chain</th>
                      <th className="px-6 py-4 font-semibold">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr className="border-t border-gray-200">
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                          Loading hotels...
                        </td>
                      </tr>
                    ) : filteredHotels.length === 0 ? (
                      <tr className="border-t border-gray-200">
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                          No hotels found.
                        </td>
                      </tr>
                    ) : (
                      filteredHotels.map((hotel) => (
                        <tr
                          key={hotel.hotelID}
                          className="border-t border-gray-200 text-base text-gray-800"
                        >
                          <td className="px-6 py-5 font-medium">{hotel.hotelID}</td>
                          <td className="px-6 py-5">{hotel.hotelName}</td>
                          <td className="px-6 py-5">{hotel.city}</td>
                          <td className="px-6 py-5">{hotel.province}</td>
                          <td className="px-6 py-5">{hotel.category}</td>
                          <td className="px-6 py-5">{hotel.chainName}</td>
                          <td className="px-6 py-5">
                            <div className="flex gap-3">
                              <button
                                onClick={() => startEdit(hotel)}
                                className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() => handleDelete(hotel.hotelID)}
                                className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700"
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
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}