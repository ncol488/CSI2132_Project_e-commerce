"use client";

// manage room changes

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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

export default function RoomsPage() {
  const [rooms, setRooms] = useState<RoomRow[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
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
        setMessage(data.error || "Could not load rooms.");
        return;
      }

      setRooms(data);
    } catch (error) {
      setMessage("Failed to load rooms.");
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
    setEditingKey(null);
  }

  function startEdit(room: RoomRow) {
    setEditingKey({
      hotelID: room.hotelID,
      roomNumber: room.roomNumber,
    });

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

    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

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
          headers: {
            "Content-Type": "application/json",
          },
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
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Could not save room.");
        return;
      }

      setMessage(
        isEditing
          ? `Room ${editingKey?.roomNumber} in hotel ${editingKey?.hotelID} updated successfully.`
          : "Room created successfully."
      );

      resetForm();
      fetchRooms();
    } catch (error) {
      setMessage("Something went wrong while saving the room.");
    }
  }

  async function handleDelete(hotelID: number, roomNumber: number) {
    const confirmed = window.confirm(
      `Are you sure you want to delete room ${roomNumber} from hotel ${hotelID}?`
    );

    if (!confirmed) return;

    setMessage("");

    try {
      const response = await fetch(`/api/rooms/${hotelID}/${roomNumber}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Could not delete room.");
        return;
      }

      setMessage(
        `Room ${roomNumber} from hotel ${hotelID} deleted successfully.`
      );

      if (
        editingKey &&
        editingKey.hotelID === hotelID &&
        editingKey.roomNumber === roomNumber
      ) {
        resetForm();
      }

      fetchRooms();
    } catch (error) {
      setMessage("Something went wrong while deleting the room.");
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
              className="block rounded-xl px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Hotels
            </Link>

            <Link
              href="/employee/management/rooms"
              className="block rounded-xl bg-blue-50 px-4 py-3 font-medium text-blue-700"
            >
              Rooms
            </Link>
          </nav>
        </aside>

        <section className="flex-1 p-8">
          <div className="mx-auto w-full max-w-5xl">
            <header className="mb-6">
              <h2 className="text-4xl font-bold text-gray-900">Room Management</h2>
              <p className="mt-2 text-gray-600">
                View, add, edit, and delete room price, amenities, availability, and damages/problems
              </p>
            </header>

            {message && (
              <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                {message}
              </div>
            )}

            <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingKey
                    ? `Edit Room #${editingKey.roomNumber} (Hotel #${editingKey.hotelID})`
                    : "Add New Room"}
                </h3>

                {editingKey && (
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
                    Room Number
                  </label>
                  <input
                    name="roomNumber"
                    type="number"
                    value={form.roomNumber}
                    onChange={handleChange}
                    required
                    disabled={editingKey !== null}
                    className="w-full rounded-lg border p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Hotel ID
                  </label>
                  <input
                    name="hotelID"
                    type="number"
                    value={form.hotelID}
                    onChange={handleChange}
                    required
                    disabled={editingKey !== null}
                    className="w-full rounded-lg border p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Price
                  </label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border p-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Capacity
                  </label>
                  <input
                    name="capacity"
                    type="number"
                    value={form.capacity}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border p-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    View Type
                  </label>
                  <select
                    name="viewType"
                    value={form.viewType}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border p-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select view type</option>
                    <option value="sea">Sea</option>
                    <option value="mountain">Mountain</option>
                    <option value="none">None</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Extendable
                  </label>
                  <select
                    name="extendable"
                    value={form.extendable}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border p-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select option</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Amenities
                  </label>
                  <input
                    name="amenities"
                    value={form.amenities}
                    onChange={handleChange}
                    placeholder="Example: TV, WiFi, Air Conditioning"
                    className="w-full rounded-lg border p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Damages / Problems
                  </label>
                  <input
                    name="problemsDamages"
                    value={form.problemsDamages}
                    onChange={handleChange}
                    placeholder="Example: Lamp needs replacement"
                    className="w-full rounded-lg border p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
                  >
                    {editingKey ? "Save Changes" : "Add Room"}
                  </button>
                </div>
              </form>
            </section>

            <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <label
                htmlFor="search-rooms"
                className="mb-3 block text-lg font-semibold text-gray-700"
              >
                Search Rooms
              </label>

              <input
                id="search-rooms"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by room number, hotel ID, hotel name, city, view type, amenities, or availability..."
                className="w-full rounded-lg border p-3 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </section>

            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="bg-gray-50 text-sm uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Room</th>
                      <th className="px-6 py-4 font-semibold">Hotel</th>
                      <th className="px-6 py-4 font-semibold">City</th>
                      <th className="px-6 py-4 font-semibold">Price</th>
                      <th className="px-6 py-4 font-semibold">Capacity</th>
                      <th className="px-6 py-4 font-semibold">Amenities</th>
                      <th className="px-6 py-4 font-semibold">Availability</th>
                      <th className="px-6 py-4 font-semibold">Damages</th>
                      <th className="px-6 py-4 font-semibold">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr className="border-t border-gray-200">
                        <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                          Loading rooms...
                        </td>
                      </tr>
                    ) : filteredRooms.length === 0 ? (
                      <tr className="border-t border-gray-200">
                        <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                          No rooms found.
                        </td>
                      </tr>
                    ) : (
                      filteredRooms.map((room) => (
                        <tr
                          key={`${room.hotelID}-${room.roomNumber}`}
                          className="border-t border-gray-200 text-base text-gray-800"
                        >
                          <td className="px-6 py-5 font-medium">{room.roomNumber}</td>
                          <td className="px-6 py-5">
                            #{room.hotelID} - {room.hotelName}
                          </td>
                          <td className="px-6 py-5">{room.city}</td>
                          <td className="px-6 py-5">${Number(room.price).toFixed(2)}</td>
                          <td className="px-6 py-5">{room.capacity}</td>
                          <td className="px-6 py-5">
                            {room.amenities.length > 0
                              ? room.amenities.join(", ")
                              : "None"}
                          </td>
                          <td className="px-6 py-5">{room.availability}</td>
                          <td className="px-6 py-5">
                            {room.problemsDamages || "None"}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex gap-3">
                              <button
                                onClick={() => startEdit(room)}
                                className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() =>
                                  handleDelete(room.hotelID, room.roomNumber)
                                }
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