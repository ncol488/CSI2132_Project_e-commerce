import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const area = searchParams.get("area");
  const capacity = searchParams.get("capacity");
  const minPrice = searchParams.get("minPrice") || "0";
  const maxPrice = searchParams.get("maxPrice") || "1000";

  try {
    let query = `
      SELECT 
        r.room_number,
        h.hotel_name,
        hc.chain_name,
        h.city,
        h.category,
        r.capacity,
        r.price,
        r.view_type,
        r.extendable
      FROM Room r
      JOIN Hotel h ON r.hotelID = h.hotelID
      JOIN HotelChain hc ON h.chainID = hc.chainID
      WHERE r.price BETWEEN $1 AND $2
    `;

    const values: any[] = [parseFloat(minPrice), parseFloat(maxPrice)];

    if (area) {
      query += ` AND h.city ILIKE $${values.length + 1}`;
      values.push(`%${area}%`);
    }
    if (capacity && capacity !== "Any") {
      query += ` AND r.capacity = $${values.length + 1}`;
      values.push(capacity);
    }

    const res = await db.query(query, values);

    const formattedRooms = res.rows.map((row: any) => ({
      room_id: row.room_number,
      hotel_name: row.hotel_name,
      chain_name: row.chain_name,
      area: row.city,
      category: row.category,
      capacity: row.capacity,
      price: parseFloat(row.price),
      has_sea_view: row.view_type === "sea",
      has_mountain_view: row.view_type === "mountain",
      is_extendable: row.extendable === true,
      amenities: ["WiFi", "TV"],
    }));

    return NextResponse.json({ rooms: formattedRooms });
  } catch (error) {
    console.error("Room Search Error:", error);
    return NextResponse.json(
      { error: "Failed to load rooms" },
      { status: 500 },
    );
  }
}
