"use client";

import { Room } from "../type";

export default function RoomCard({
  room,
  onBook,
}: {
  room: Room;
  onBook: (room: Room) => void;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gray-900 text-base leading-tight">
            {room.hotel_name}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">{room.chain_name}</p>
        </div>
        <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
          {"★".repeat(room.category)}
        </span>
      </div>

      <div className="flex gap-2 flex-wrap text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <svg
            className="w-3.5 h-3.5"
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
          {room.area}
        </span>
        <span>·</span>
        <span>{room.capacity}</span>
        {room.has_sea_view && (
          <>
            <span>·</span>
            <span>🌊 Sea View</span>
          </>
        )}
        {room.has_mountain_view && (
          <>
            <span>·</span>
            <span>⛰ Mountain View</span>
          </>
        )}
        {room.is_extendable && (
          <>
            <span>·</span>
            <span>Extendable</span>
          </>
        )}
      </div>

      {room.amenities && room.amenities.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {room.amenities.slice(0, 4).map((a) => (
            <span
              key={a}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
            >
              {a}
            </span>
          ))}
          {room.amenities.length > 4 && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              +{room.amenities.length - 4} more
            </span>
          )}
        </div>
      )}

      <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-50">
        <div>
          <span className="text-xl font-bold text-gray-900">${room.price}</span>
          <span className="text-xs text-gray-400 ml-1">/ night</span>
        </div>
        <button
          onClick={() => onBook(room)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}
