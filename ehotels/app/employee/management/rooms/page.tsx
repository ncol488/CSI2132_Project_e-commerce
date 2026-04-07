"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/app/components/sidebar";

type RoomRow = {
  roomNumber: number;
  hotelID: number;
  hotelName: string;
  city: string;
  price: number;
  capacity: number;
  viewType: string;
  extendable: boolean;
  problemsDamages: string | null;
  amenities: string[];
  availability: string;
};

type RoomForm = {
  roomNumber: string;
  hotelID: string;
  price: string;
  capacity: string;
  viewType: string;
  extendable: string;
  problemsDamages: string;
  amenities: string;
};

const emptyForm: RoomForm = {
  roomNumber: "",
  hotelID: "",
  price: "",
  capacity: "",
  viewType: "",
  extendable: "",
  problemsDamages: "",
  amenities: "",
};

const inputClass =
  "w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400";
const labelClass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<RoomRow[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<RoomForm>(emptyForm);
  const [editingKey, setEditingKey] = useState<{
    hotelID: number;
    roomNumber: number;
  } | null>(null);

  async function fetchRooms() {
    try {
      setLoading(true);
      const response = await fetch("/api/rooms");
      const data = await response.json();
      if (!response.ok) {
        setMessage({
          type: "error",
          text: data.error || "Could not load rooms.",
        });
        return;
      }
      setRooms(data);
    } catch {
      setMessage({ type: "error", text: "Failed to load rooms." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRooms();
  }, []);

  const filteredRooms = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter((room) => {
      const amenitiesText = room.amenities.join(", ").toLowerCase();
      return (
        room.roomNumber.toString().includes(q) ||
        room.hotelID.toString().includes(q) ||
        room.hotelName.toLowerCase().includes(q) ||
        room.city.toLowerCase().includes(q) ||
        room.viewType.toLowerCase().includes(q) ||
        room.availability.toLowerCase().includes(q) ||
        amenitiesText.includes(q)
      );
    });
  }, [rooms, search]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingKey(null);
  }

  function startEdit(room: RoomRow) {
    setEditingKey({ hotelID: room.hotelID, roomNumber: room.roomNumber });
    setForm({
      roomNumber: String(room.roomNumber),
      hotelID: String(room.hotelID),
      price: String(room.price),
      capacity: String(room.capacity),
      viewType: room.viewType,
      extendable: room.extendable ? "true" : "false",
      problemsDamages: room.problemsDamages || "",
      amenities: room.amenities.join(", "),
    });
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    try {
      const isEditing = editingKey !== null;
      const amenitiesArray = form.amenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);
      const response = await fetch(
        isEditing
          ? `/api/rooms/${editingKey.hotelID}/${editingKey.roomNumber}`
          : "/api/rooms",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomNumber: Number(form.roomNumber),
            hotelID: Number(form.hotelID),
            price: Number(form.price),
            capacity: Number(form.capacity),
            viewType: form.viewType,
            extendable: form.extendable === "true",
            problemsDamages: form.problemsDamages,
            amenities: amenitiesArray,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        setMessage({
          type: "error",
          text: data.error || "Could not save room.",
        });
        return;
      }
      setMessage({
        type: "success",
        text: isEditing
          ? `Room ${editingKey?.roomNumber} in hotel ${editingKey?.hotelID} updated.`
          : "Room created successfully.",
      });
      resetForm();
      fetchRooms();
    } catch {
      setMessage({ type: "error", text: "Something went wrong." });
    }
  }

  async function handleDelete(hotelID: number, roomNumber: number) {
    if (!window.confirm(`Delete room ${roomNumber} from hotel ${hotelID}?`))
      return;
    setMessage(null);
    try {
      const response = await fetch(`/api/rooms/${hotelID}/${roomNumber}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage({
          type: "error",
          text: data.error || "Could not delete room.",
        });
        return;
      }
      setMessage({
        type: "success",
        text: `Room ${roomNumber} from hotel ${hotelID} deleted.`,
      });
      if (
        editingKey?.hotelID === hotelID &&
        editingKey?.roomNumber === roomNumber
      )
        resetForm();
      fetchRooms();
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
              Room Management
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              View, add, edit, and delete room details, amenities, and damages
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
                    tab.label === "Rooms"
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
                  {editingKey
                    ? `Edit Room #${editingKey.roomNumber} (Hotel #${editingKey.hotelID})`
                    : "Add New Room"}
                </h3>
                {editingKey && (
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
                  <label className={labelClass}>Room Number</label>
                  <input
                    name="roomNumber"
                    type="number"
                    value={form.roomNumber}
                    onChange={handleChange}
                    required
                    disabled={editingKey !== null}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Hotel ID</label>
                  <input
                    name="hotelID"
                    type="number"
                    value={form.hotelID}
                    onChange={handleChange}
                    required
                    disabled={editingKey !== null}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Price ($)</label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Capacity</label>
                  <input
                    name="capacity"
                    type="number"
                    value={form.capacity}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>View Type</label>
                  <select
                    name="viewType"
                    value={form.viewType}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  >
                    <option value="">Select view type</option>
                    <option value="sea">Sea</option>
                    <option value="mountain">Mountain</option>
                    <option value="none">None</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Extendable</label>
                  <select
                    name="extendable"
                    value={form.extendable}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  >
                    <option value="">Select option</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Amenities</label>
                  <input
                    name="amenities"
                    value={form.amenities}
                    onChange={handleChange}
                    placeholder="e.g. TV, WiFi, Air Conditioning"
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Damages / Problems</label>
                  <input
                    name="problemsDamages"
                    value={form.problemsDamages}
                    onChange={handleChange}
                    placeholder="e.g. Lamp needs replacement"
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    {editingKey ? "Save Changes" : "Add Room"}
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
                Search Rooms
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by room number, hotel ID, hotel name, city, view type, amenities, or availability..."
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
                        "Room",
                        "Hotel",
                        "City",
                        "Price",
                        "Capacity",
                        "Amenities",
                        "Availability",
                        "Damages",
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
                          colSpan={9}
                          className="px-6 py-10 text-center text-sm text-gray-400"
                        >
                          Loading rooms...
                        </td>
                      </tr>
                    ) : filteredRooms.length === 0 ? (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-6 py-10 text-center text-sm text-gray-400"
                        >
                          No rooms found.
                        </td>
                      </tr>
                    ) : (
                      filteredRooms.map((room) => (
                        <tr
                          key={`${room.hotelID}-${room.roomNumber}`}
                          className="border-t border-gray-100 hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {room.roomNumber}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            #{room.hotelID} {room.hotelName}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {room.city}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            ${Number(room.price).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {room.capacity}
                          </td>
                          <td className="px-6 py-4 text-gray-700 max-w-[160px] truncate">
                            {room.amenities.length > 0
                              ? room.amenities.join(", ")
                              : "—"}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {room.availability}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {room.problemsDamages || "—"}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEdit(room)}
                                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  handleDelete(room.hotelID, room.roomNumber)
                                }
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
