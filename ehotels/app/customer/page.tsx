"use client";

import { useEffect, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import { Room, HOTEL_CHAINS, CAPACITIES, MIN_PRICE, MAX_PRICE } from "./type";
import DualRangeSlider from "./components/DualRangeSlider";
import RoomCard from "./components/RoomCard";
import BookingModal from "./components/BookingModal";
import Sidebar from "../components/sidebar";

type BookingModalProps = {
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
  }) => Promise<void>;
  loading: boolean;
  success: boolean;
  error: string;
};

const TypedBookingModal = BookingModal as ComponentType<BookingModalProps>;

export default function CustomerPage() {
  const [customerID, setCustomerID] = useState<number | null>(null);
  const router = useRouter();

  // State for search filters
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [area, setArea] = useState("");
  const [chain, setChain] = useState("All Chains");
  const [capacity, setCapacity] = useState("Any");
  const [stars, setStars] = useState<number[]>([]);
  const [minPrice, setMinPrice] = useState(MIN_PRICE);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);

  // State for results and UI
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [showingAll, setShowingAll] = useState(false);

  // State for booking process
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("customerID");
    if (!stored) {
      router.push("/");
      return;
    }
    setCustomerID(parseInt(stored));
  }, [router]);

  const toggleStar = (s: number) =>
    setStars((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );

  const handleSearch = async () => {
    if (!checkIn || !checkOut) {
      setSearchError("Please select check-in and check-out dates.");
      return;
    }
    if (checkIn >= checkOut) {
      setSearchError("Check-out must be after check-in.");
      return;
    }
    setSearchError("");
    setLoading(true);
    setSearched(true);
    setShowingAll(false);

    try {
      const params = new URLSearchParams({
        checkIn,
        checkOut,
        area,
        chain: chain === "All Chains" ? "" : chain,
        capacity: capacity === "Any" ? "" : capacity,
        stars: stars.length === 0 || stars.length === 5 ? "" : stars.join(","),
        minPrice: String(minPrice),
        maxPrice: String(maxPrice),
      });

      const res = await fetch(`/api/rooms?${params}`);
      const data = await res.json();

      if (!res.ok) {
        setSearchError(data.error || "Failed to fetch rooms.");
        setRooms([]);
      } else {
        setRooms(data.rooms || []);
      }
    } catch {
      setSearchError("Something went wrong. Please try again.");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShowAll = async () => {
    setSearchError("");
    setLoading(true);
    setSearched(true);
    setShowingAll(true);

    try {
      const res = await fetch("/api/rooms?showAll=true");
      const data = await res.json();

      if (!res.ok) {
        setSearchError(data.error || "Failed to fetch rooms.");
        setRooms([]);
      } else {
        setRooms(data.rooms || []);
      }
    } catch {
      setSearchError("Something went wrong. Please try again.");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (details: {
    fullName: string;
    address: string;
    idType: string;
    idNumber: string;
    checkIn: string;
    checkOut: string;
  }) => {
    if (!bookingRoom) return;
    setBookingLoading(true);
    setBookingError("");

    console.log("bookingRoom:", bookingRoom);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerID: customerID,
          room_number: bookingRoom.room_id,
          hotelID: bookingRoom.hotel_id,
          checkIn: details.checkIn,
          checkOut: details.checkOut,
          fullName: details.fullName,
          idType: details.idType,
          idNumber: details.idNumber,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setBookingError(data.error || "Booking failed.");
      } else {
        setBookingSuccess(true);
      }
    } catch {
      setBookingError("Something went wrong. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  const closeModal = () => {
    if (bookingSuccess) {
      router.push("/customer/bookings");
    }
    setBookingRoom(null);
    setBookingSuccess(false);
    setBookingError("");
  };

  return (
    <div
      className="min-h-screen bg-gray-50 flex"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* 2. Swapped hardcoded <aside> for your Sidebar component */}
      <Sidebar role="customer" />

      <main className="flex-1 flex flex-col">
        <div
          className="px-10 pt-14 pb-20 text-center"
          style={{
            background:
              "linear-gradient(135deg, #2d3bff 0%, #4f46e5 60%, #6366f1 100%)",
          }}
        >
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Find Your Perfect Stay
          </h1>
          <p className="text-blue-100 mt-2 text-sm">
            Discover exceptional accommodations across 5 premier hotel chains
          </p>
        </div>

        <div className="px-8 -mt-10 z-10">
          <div className="bg-white rounded-2xl shadow-lg p-6 max-w-6xl mx-auto">
            {/* Search Controls */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
                  <CalendarIcon /> Check-in Date
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
                  <CalendarIcon /> Check-out Date
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
                  <LocationIcon /> Destination / Area
                </label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g., Miami Beach"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              {/* Hotel Chain Select */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
                  <StarIcon /> Hotel Chain
                </label>
                <div className="relative">
                  <select
                    value={chain}
                    onChange={(e) => setChain(e.target.value)}
                    className="w-full appearance-none px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition pr-8"
                  >
                    {HOTEL_CHAINS.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Capacity Select */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
                  <UsersIcon /> Room Capacity
                </label>
                <div className="relative">
                  <select
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full appearance-none px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition pr-8"
                  >
                    {CAPACITIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category Stars */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
                  <StarIcon /> Category / Stars
                </label>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setStars([])}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${stars.length === 0 ? "bg-blue-600 border-blue-600 text-white shadow-sm" : "bg-white border-gray-200 text-gray-600 hover:border-blue-300"}`}
                  >
                    All
                  </button>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => toggleStar(s)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${stars.includes(s) ? "bg-blue-600 border-blue-600 text-white shadow-sm" : "bg-white border-gray-200 text-gray-600 hover:border-blue-300"}`}
                    >
                      {s}★
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-3">
                <PriceIcon /> Price Range: ${minPrice} – ${maxPrice}
              </label>
              <DualRangeSlider
                min={MIN_PRICE}
                max={MAX_PRICE}
                low={minPrice}
                high={maxPrice}
                onChange={(lo, hi) => {
                  setMinPrice(lo);
                  setMaxPrice(hi);
                }}
              />
            </div>

            {searchError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-4">
                {searchError}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleShowAll}
                disabled={loading}
                className="flex items-center justify-center gap-2 border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3.5 px-5 rounded-xl transition-colors disabled:opacity-60 text-sm whitespace-nowrap"
              >
                Show All Rooms
              </button>

              <button
                onClick={handleSearch}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-60 text-sm"
              >
                {loading ? "Searching..." : "Search Available Rooms"}
              </button>
            </div>
          </div>
        </div>

        {/* Results section */}
        <div className="px-8 py-8 max-w-6xl mx-auto w-full">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : searched && rooms.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 font-medium">No rooms found</p>
            </div>
          ) : (
            rooms.length > 0 && (
              <>
                <h2 className="text-base font-semibold text-gray-800 mb-5">
                  {showingAll
                    ? `All ${rooms.length} rooms`
                    : `${rooms.length} rooms available`}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {rooms.map((room) => (
                    <RoomCard
                      key={`${room.hotel_id}-${room.room_id}`}
                      room={room}
                      onBook={setBookingRoom}
                    />
                  ))}
                </div>
              </>
            )
          )}
        </div>
      </main>

      {bookingRoom && (
        <TypedBookingModal
          room={bookingRoom}
          checkIn={checkIn}
          checkOut={checkOut}
          onClose={closeModal}
          onConfirm={handleBook}
          loading={bookingLoading}
          success={bookingSuccess}
          error={bookingError}
        />
      )}
    </div>
  );
}

// Simple Helper Icons to keep main code clean
const CalendarIcon = () => (
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
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
);
const LocationIcon = () => (
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
);
const StarIcon = () => (
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
      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
    />
  </svg>
);
const UsersIcon = () => (
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
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);
const PriceIcon = () => (
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
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
