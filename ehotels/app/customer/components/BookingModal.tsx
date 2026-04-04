"use client";

import { useState } from "react";
import { Room } from "../type";

const ID_TYPES = ["SSN", "SIN", "Driving License", "Passport"];

export default function BookingModal({
  room,
  checkIn,
  checkOut,
  onClose,
  onConfirm,
  loading,
  success,
  error,
}: {
  room: Room;
  checkIn: string;
  checkOut: string;
  onClose: () => void;
  onConfirm: (details: {
    fullName: string;
    address: string;
    idType: string;
    idNumber: string;
    checkIn: string;
    checkOut: string;
  }) => void;
  loading: boolean;
  success: boolean;
  error: string;
}) {
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [idType, setIdType] = useState("SSN");
  const [idNumber, setIdNumber] = useState("");
  const [localCheckIn, setLocalCheckIn] = useState(checkIn);
  const [localCheckOut, setLocalCheckOut] = useState(checkOut);
  const [formError, setFormError] = useState("");

  const nights =
    localCheckIn && localCheckOut
      ? Math.max(
          0,
          Math.round(
            (new Date(localCheckOut).getTime() -
              new Date(localCheckIn).getTime()) /
              86400000,
          ),
        )
      : 0;

  const viewLabel = room.has_sea_view
    ? "Sea View"
    : room.has_mountain_view
      ? "Mountain View"
      : "No View";

  const handleConfirm = () => {
    if (!fullName.trim()) {
      setFormError("Full name is required.");
      return;
    }
    if (!address.trim()) {
      setFormError("Address is required.");
      return;
    }
    if (!idNumber.trim()) {
      setFormError("ID number is required.");
      return;
    }
    if (!localCheckIn || !localCheckOut) {
      setFormError("Please select check-in and check-out dates.");
      return;
    }
    if (localCheckIn >= localCheckOut) {
      setFormError("Check-out must be after check-in.");
      return;
    }
    setFormError("");
    onConfirm({
      fullName,
      address,
      idType,
      idNumber,
      checkIn: localCheckIn,
      checkOut: localCheckOut,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* ── Header ── */}
        <div
          className="px-6 py-5 relative"
          style={{
            background:
              "linear-gradient(135deg, #2d3bff 0%, #4f46e5 60%, #6366f1 100%)",
          }}
        >
          <h2 className="text-xl font-bold text-white">
            {success ? "Booking Confirmed!" : "Complete Your Booking"}
          </h2>
          <p className="text-blue-100 text-sm mt-0.5">
            {success
              ? "Your stay has been reserved successfully."
              : "Just a few more details to secure your stay"}
          </p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">
          {success ? (
            /* ── Success state ── */
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
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
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Booking Confirmed!
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Your room at {room.hotel_name} has been reserved.
              </p>
              <button
                onClick={onClose}
                className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* ── Booking Summary card ── */}
              <div className="bg-blue-50 rounded-xl p-4 mb-5">
                <h3 className="text-sm font-bold text-gray-900 mb-3">
                  Booking Summary
                </h3>
                <div className="grid grid-cols-2 gap-y-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Hotel</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {room.hotel_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Room Type</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {Number(room.capacity) === 1
                        ? "Single"
                        : Number(room.capacity) === 2
                          ? "Double"
                          : Number(room.capacity) === 3
                            ? "Triple"
                            : Number(room.capacity) === 4
                              ? "Quad"
                              : "Suite"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">View</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {viewLabel}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">
                      Price per Night
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      ${room.price}
                    </p>
                  </div>
                  {nights > 0 && (
                    <div className="col-span-2 border-t border-blue-100 pt-2 mt-1 flex justify-between">
                      <p className="text-xs text-gray-500">
                        Total ({nights} night{nights !== 1 ? "s" : ""})
                      </p>
                      <p className="text-sm font-bold text-blue-600">
                        ${(room.price * nights).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Full Name ── */}
              <div className="mb-4">
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              {/* ── Address ── */}
              <div className="mb-4">
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main Street, City, State, ZIP"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              {/* ── ID Type + ID Number ── */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                    <svg
                      className="w-4 h-4 text-blue-500"
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
                    ID Type
                  </label>
                  <div className="relative">
                    <select
                      value={idType}
                      onChange={(e) => setIdType(e.target.value)}
                      className="w-full appearance-none px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-8"
                    >
                      {ID_TYPES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
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
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-1.5">
                    <svg
                      className="w-4 h-4 text-blue-500"
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
                    ID Number
                  </label>
                  <input
                    type="text"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="123-45-6789"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* ── Check-in / Check-out ── */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    value={localCheckIn}
                    onChange={(e) => setLocalCheckIn(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    value={localCheckOut}
                    onChange={(e) => setLocalCheckOut(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* ── Errors ── */}
              {(formError || error) && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-4">
                  {formError || error}
                </p>
              )}

              {/* ── Confirm button ── */}
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background:
                    "linear-gradient(135deg, #2d3bff 0%, #4f46e5 60%, #6366f1 100%)",
                }}
              >
                {loading ? "Booking..." : "Confirm Booking"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
