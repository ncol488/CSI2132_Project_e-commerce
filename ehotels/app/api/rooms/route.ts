import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Detect if this is a Customer Search (has filters) or Employee List (no filters)
  const isSearch =
    searchParams.has("area") ||
    searchParams.has("minPrice") ||
    searchParams.has("capacity");

  try {
    if (isSearch) {
      // ── CUSTOMER SEARCH LOGIC (from HEAD) ──────────────────────────────────
      const area = searchParams.get("area");
      const minPrice = searchParams.get("minPrice") || "0";
      const maxPrice = searchParams.get("maxPrice") || "1000";
      const capacity = searchParams.get("capacity");

      let query = `
        SELECT r.room_number, r.hotelID, h.hotel_name, hc.chain_name, h.city, h.category,
               r.capacity, r.price, r.view_type, r.extendable, r.problems_damages,
               EXISTS (
                 SELECT 1 FROM ehotels.Booking b 
                 WHERE b.room_number = r.room_number AND b.hotelID = r.hotelID
                   AND b.status != 'cancelled' AND b.end_date >= CURRENT_DATE
               ) as is_occupied,
               COALESCE(json_agg(a.name) FILTER (WHERE a.name IS NOT NULL), '[]') AS amenities
        FROM ehotels.Room r
        JOIN ehotels.Hotel h ON r.hotelID = h.hotelID
        JOIN ehotels.HotelChain hc ON h.chainID = hc.chainID
        LEFT JOIN ehotels.Room_Amenity ra ON ra.room_number = r.room_number AND ra.hotelID = r.hotelID
        LEFT JOIN ehotels.Amenity a ON a.amenityID = ra.amenityID
      `;

      const values = [parseFloat(minPrice), parseFloat(maxPrice)];
      const where = [`r.price BETWEEN $1 AND $2`];

      if (area) {
        where.push(`h.city ILIKE $${values.length + 1}`);
        values.push(`%${area}%`);
      }
      if (capacity && capacity !== "Any") {
        where.push(`r.capacity >= $${values.length + 1}`);
        values.push(parseInt(capacity));
      }

      query +=
        " WHERE " +
        where.join(" AND ") +
        ` GROUP BY r.room_number, r.hotelID, h.hotel_name, hc.chain_name, h.city, h.category ORDER BY r.price ASC`;

      const result = await db.query(query, values);
      return NextResponse.json({ rooms: result.rows });
    } else {
      // ── EMPLOYEE MASTER LIST LOGIC (from Incoming) ─────────────────────────
      const result = await db.query(`
        SELECT r.room_number AS "roomNumber", r.hotelid AS "hotelID", h.hotel_name AS "hotelName",
               h.city, r.price, r.capacity, r.view_type AS "viewType", r.extendable,
               r.problems_damages AS "problemsDamages",
               COALESCE(ARRAY_AGG(DISTINCT a.name) FILTER (WHERE a.name IS NOT NULL), '{}') AS "amenities"
        FROM ehotels.room r
        JOIN ehotels.hotel h ON r.hotelid = h.hotelid
        LEFT JOIN ehotels.room_amenity ra ON r.room_number = ra.room_number AND r.hotelid = ra.hotelid
        LEFT JOIN ehotels.amenity a ON ra.amenityid = a.amenityid
        GROUP BY r.room_number, r.hotelid, h.hotel_name, h.city
        ORDER BY r.hotelid, r.room_number
      `);
      return NextResponse.json(result.rows);
    }
  } catch (error) {
    console.error("GET /api/rooms error:", error);
    return NextResponse.json(
      { error: "Failed to load rooms" },
      { status: 500 },
    );
  }
}

// ── POST: Add New Room (Employee Data Maintenance - from Incoming) ────────────
export async function POST(req: NextRequest) {
  const client = await db.connect();
  try {
    const body = await req.json();
    const {
      roomNumber,
      hotelID,
      price,
      capacity,
      viewType,
      extendable,
      problemsDamages,
      amenities,
    } = body;

    await client.query("BEGIN");
    await client.query(
      `INSERT INTO ehotels.room (room_number, hotelid, price, capacity, view_type, extendable, problems_damages)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        roomNumber,
        hotelID,
        price,
        capacity,
        viewType,
        extendable,
        problemsDamages || null,
      ],
    );

    if (Array.isArray(amenities)) {
      for (const name of amenities) {
        await client.query(
          `INSERT INTO ehotels.room_amenity (room_number, hotelid, amenityid)
           SELECT $1, $2, amenityid FROM ehotels.amenity WHERE LOWER(name) = LOWER($3)`,
          [roomNumber, hotelID, name],
        );
      }
    }
    await client.query("COMMIT");
    return NextResponse.json(
      { message: "Room added successfully." },
      { status: 201 },
    );
  } catch (error: any) {
    await client.query("ROLLBACK");
    return NextResponse.json({ error: "Failed to add room." }, { status: 500 });
  } finally {
    client.release();
  }
}
