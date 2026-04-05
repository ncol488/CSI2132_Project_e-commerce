import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // 1. Extract query parameters
  const showAll = searchParams.get("showAll") === "true";
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const area = searchParams.get("area");
  const chain = searchParams.get("chain");
  const capacity = searchParams.get("capacity");
  const starsRaw = searchParams.get("stars");
  const minPrice = searchParams.get("minPrice") || "0";
  const maxPrice = searchParams.get("maxPrice") || "1000";

  // Parse star ratings into an array of numbers
  const starList: number[] = starsRaw
    ? starsRaw
        .split(",")
        .map(Number)
        .filter((n) => !isNaN(n))
    : [];

  try {
    // 2. The Integrated SQL Query
    // We use EXISTS to check for ANY upcoming confirmed booking or active renting.
    let query = `
      SELECT
        r.room_number,
        r.hotelID,
        h.hotel_name,
        hc.chain_name,
        h.city,
        h.category,
        r.capacity,
        r.price,
        r.view_type,
        r.extendable,
        r.problems_damages,
        -- TRIGGER: Flag as occupied if a confirmed booking exists for the future
        EXISTS (
          SELECT 1 FROM ehotels.Booking b 
          WHERE b.room_number = r.room_number 
            AND b.hotelID = r.hotelID
            AND b.status IN ('confirmed', 'checked-in')
            AND b.end_date >= CURRENT_DATE
        ) as is_occupied,
        -- Aggregate amenities into a JSON array
        COALESCE(
          json_agg(a.name ORDER BY a.name) FILTER (WHERE a.name IS NOT NULL),
          '[]'
        ) AS amenities
      FROM ehotels.Room r
      JOIN ehotels.Hotel h       ON r.hotelID  = h.hotelID
      JOIN ehotels.HotelChain hc ON h.chainID  = hc.chainID
      LEFT JOIN ehotels.Room_Amenity ra
        ON ra.room_number = r.room_number AND ra.hotelID = r.hotelID
      LEFT JOIN ehotels.Amenity a ON a.amenityID = ra.amenityID
    `;

    const values: any[] = [];
    const where: string[] = [];

    // 3. Apply Filters
    // Note: We no longer use "NOT IN" to hide rooms; we want them to show up as "Reserved"
    where.push(
      `r.price BETWEEN $${values.length + 1} AND $${values.length + 2}`,
    );
    values.push(parseFloat(minPrice), parseFloat(maxPrice));

    if (area && area !== "") {
      where.push(`h.city ILIKE $${values.length + 1}`);
      values.push(`%${area}%`);
    }

    if (chain && chain !== "" && chain !== "All Chains") {
      where.push(`hc.chain_name ILIKE $${values.length + 1}`);
      values.push(`%${chain}%`);
    }

    if (capacity && capacity !== "" && capacity !== "Any") {
      // Use the capacity string or number based on your DB schema
      where.push(`r.capacity = $${values.length + 1}`);
      values.push(capacity);
    }

    if (starList.length > 0) {
      const placeholders = starList
        .map((_, i) => `$${values.length + i + 1}`)
        .join(", ");
      where.push(`h.category IN (${placeholders})`);
      values.push(...starList);
    }

    // Assemble the final query string
    if (where.length > 0) {
      query += " WHERE " + where.join(" AND ");
    }

    query += `
      GROUP BY
        r.room_number, r.hotelID,
        h.hotel_name, hc.chain_name,
        h.city, h.category,
        r.capacity, r.price,
        r.view_type, r.extendable, r.problems_damages
      ORDER BY h.city, r.price ASC
    `;

    const result = await db.query(query, values);

    // 4. Map DB rows to Frontend Room type
    const formattedRooms = result.rows.map((row: any) => ({
      room_id: row.room_number,
      hotel_id: row.hotelid,
      hotel_name: row.hotel_name,
      chain_name: row.chain_name,
      area: row.city,
      category: row.category,
      capacity: row.capacity,
      price: parseFloat(row.price),
      has_sea_view: row.view_type === "sea",
      has_mountain_view: row.view_type === "mountain",
      is_extendable: row.extendable === true,
      amenities: Array.isArray(row.amenities) ? row.amenities : [],
      // is_available is the inverse of is_occupied
      is_available: !row.is_occupied,
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
