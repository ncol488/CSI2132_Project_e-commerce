"use client";

import { Room } from "../type";

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
  onConfirm: () => void;
  loading: boolean;
  success: boolean;
  error: string;
}) {
  const nights =
    checkIn && checkOut
      ? Math.max(
          0,
          Math.round(
            (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
              86400000,
          ),
        )
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
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

        {success ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-7 h-7 text-green-600"
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
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              Booking Confirmed!
            </h3>
            <p className="text-sm text-gray-500">
              Your room at {room.hotel_name} has been reserved.
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              Confirm Booking
            </h2>
            <p className="text-sm text-gray-400 mb-5">
              {room.hotel_name} · {room.area}
            </p>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Check-in</span>
                <span className="font-medium text-gray-800">{checkIn}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Check-out</span>
                <span className="font-medium text-gray-800">{checkOut}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Capacity</span>
                <span className="font-medium text-gray-800">
                  {room.capacity}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Stars</span>
                <span className="font-medium text-gray-800">
                  {"★".repeat(room.category)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-semibold">
                <span className="text-gray-700">
                  Total ({nights} night{nights !== 1 ? "s" : ""})
                </span>
                <span className="text-blue-600">
                  ${(room.price * nights).toFixed(2)}
                </span>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Booking..." : "Confirm"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
