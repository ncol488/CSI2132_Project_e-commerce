export type BookingStatus =
  | "confirmed"
  | "pending"
  | "cancelled"
  | "checked-in";

export type Booking = {
  bookingID: number;
  start_date: string;
  end_date: string;
  status: BookingStatus;
  room_number: number;
  hotel_id: number;
  hotel_name: string;
  chain_name: string;
  city: string;
  room_snapshot: string;
  hotel_snapshot: string;
  chain_name_snapshot: string;
  price_per_night: number | null;
  nights: number;
  total_price: number | null;
  checkin_datetime?: string | null;
};
export type Renting = Booking & {
  rentingID: number;
  employeeID: number;
  checkout_datetime?: string | null;
};

export type Payment = {
  paymentID: number;
  rentingID: number;
  amount: number;
  payment_method: "Credit Card" | "Debit" | "Cash";
  payment_date: string;
};

export type Room = {
  room_id: number;
  hotel_id: number;
  hotel_name: string;
  is_available: boolean;
  chain_name: string;
  area: string;
  address: string;
  category: number;
  capacity: string;
  price: number;
  amenities: string[];
  has_sea_view: boolean;
  has_mountain_view: boolean;
  is_extendable: boolean;
  total_rooms: number;
};

export const HOTEL_CHAINS = [
  "All Chains",
  "Star Gold Hotels",
  "North Stay",
  "Maple Lux",
  "Aurora Hotels",
  "Urban Peak",
];

export const CAPACITIES = [
  "Any",
  "Single",
  "Double",
  "Triple",
  "Quad",
  "Suite",
];

export const MIN_PRICE = 0;
export const MAX_PRICE = 1000;
