export type Room = {
  room_id: number;
  hotel_name: string;
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
  "Marriott",
  "Hilton",
  "Hyatt",
  "IHG",
  "Wyndham",
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
