import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const showAll = searchParams.get("showAll") === "true";
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const area = searchParams.get("area");
  const chain = searchParams.get("chain");
  const capacity = searchParams.get("capacity");
  const starsRaw = searchParams.get("stars");
  const minPrice = searchParams.get("minPrice") || "0";
  const maxPrice = searchParams.get("maxPrice") || "1000";

  // Is this a customer search or the employee raw list?
  const isCustomerSearch =
    showAll ||
    searchParams.has("checkIn") ||
    searchParams.has("area") ||
    searchParams.has("minPrice") ||
    searchParams.has("capacity") ||
    searchParams.has("chain") ||
    searchParams.has("stars");

  const starList: number[] =
    starsRaw && starsRaw !== ""
      ? starsRaw
          .split(",")
          .map(Number)
          .filter((n) => !isNaN(n))
      : [];

  try {
    if (isCustomerSearch) {
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
          COALESCE(
            json_agg(a.name ORDER BY a.name) FILTER (WHERE a.name IS NOT NULL),
            '[]'
          ) AS amenities,
          -- is_available: false if room is booked or rented for the searched dates
          ${
            checkIn && checkOut
              ? `
          NOT EXISTS (
            SELECT 1 FROM ehotels.Booking b
            WHERE b.room_number = r.room_number
              AND b.hotelID     = r.hotelID
              AND b.status     != 'cancelled'
              AND b.start_date  < '${checkOut}'::date
              AND b.end_date    > '${checkIn}'::date
          ) AND NOT EXISTS (
            SELECT 1 FROM ehotels.Renting rt
            WHERE rt.room_number = r.room_number
              AND rt.hotelID     = r.hotelID
              AND rt.start_date  < '${checkOut}'::date
              AND rt.end_date    > '${checkIn}'::date
          )`
              : `
          NOT EXISTS (
            SELECT 1 FROM ehotels.Booking b
            WHERE b.room_number = r.room_number
              AND b.hotelID     = r.hotelID
              AND b.status     != 'cancelled'
              AND b.end_date > CURRENT_DATE
          ) AND NOT EXISTS (
            SELECT 1 FROM ehotels.Renting rt
            WHERE rt.room_number = r.room_number
              AND rt.hotelID     = r.hotelID
              AND rt.end_date    > CURRENT_DATE
          )`
          } AS is_available
        FROM ehotels.Room r
        JOIN ehotels.Hotel h       ON r.hotelID  = h.hotelID
        JOIN ehotels.HotelChain hc ON h.chainID  = hc.chainID
        LEFT JOIN ehotels.Room_Amenity ra
          ON ra.room_number = r.room_number AND ra.hotelID = r.hotelID
        LEFT JOIN ehotels.Amenity a ON a.amenityID = ra.amenityID
      `;

      const values: (number | string)[] = [];
      const where: string[] = [];
      if (!showAll) {
        where.push(
          `r.price BETWEEN $${values.length + 1} AND $${values.length + 2}`,
        );
        values.push(parseFloat(minPrice), parseFloat(maxPrice));
      }
      if (!showAll && checkIn && checkOut) {
        where.push(`
          NOT EXISTS (
            SELECT 1 FROM ehotels.Booking b
            WHERE b.room_number = r.room_number
              AND b.hotelID     = r.hotelID
              AND b.status     != 'cancelled'
              AND b.start_date  < $${values.length + 2}::date
              AND b.end_date    > $${values.length + 1}::date
          )
          AND NOT EXISTS (
            SELECT 1 FROM ehotels.Renting rt
            WHERE rt.room_number = r.room_number
              AND rt.hotelID     = r.hotelID
              AND rt.start_date  < $${values.length + 2}::date
              AND rt.end_date    > $${values.length + 1}::date
          )
        `);
        values.push(checkIn, checkOut);
      }

      // Area filter
      if (area && area !== "") {
        where.push(`h.city ILIKE $${values.length + 1}`);
        values.push(`%${area}%`);
      }

      // Chain filter
      if (chain && chain !== "") {
        where.push(`hc.chain_name ILIKE $${values.length + 1}`);
        values.push(`%${chain}%`);
      }

      // Capacity filter
      if (capacity && capacity !== "" && capacity !== "Any") {
        where.push(`r.capacity = $${values.length + 1}`);
        values.push(parseInt(capacity));
      }

      // Stars filter
      if (starList.length > 0) {
        const placeholders = starList
          .map((_, i) => `$${values.length + i + 1}`)
          .join(", ");
        where.push(`h.category IN (${placeholders})`);
        values.push(...starList);
      }

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
        ORDER BY h.city, r.price
      `;

      const result = await db.query(query, values);

      const rooms = result.rows.map((row: any) => ({
        room_id: row.room_number,
        room_number: row.room_number,
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
        has_damage: !!row.problems_damages,
        amenities: Array.isArray(row.amenities) ? row.amenities : [],
        is_available: row.is_available === true || row.is_available === "true",
      }));

      return NextResponse.json({ rooms });
    }
    const result = await db.query(`
      SELECT
        r.room_number    AS "roomNumber",
        r.hotelid        AS "hotelID",
        h.hotel_name     AS "hotelName",
        h.city,
        r.price,
        r.capacity,
        r.view_type      AS "viewType",
        r.extendable,
        r.problems_damages AS "problemsDamages",
        COALESCE(
          ARRAY_AGG(DISTINCT a.name) FILTER (WHERE a.name IS NOT NULL),
          '{}'
        ) AS "amenities"
      FROM ehotels.room r
      JOIN ehotels.hotel h ON r.hotelid = h.hotelid
      LEFT JOIN ehotels.room_amenity ra
        ON r.room_number = ra.room_number AND r.hotelid = ra.hotelid
      LEFT JOIN ehotels.amenity a ON ra.amenityid = a.amenityid
      GROUP BY r.room_number, r.hotelid, h.hotel_name, h.city,
               r.price, r.capacity, r.view_type, r.extendable, r.problems_damages
      ORDER BY r.hotelid, r.room_number
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("GET /api/rooms error:", error);
    return NextResponse.json(
      { error: "Failed to load rooms" },
      { status: 500 },
    );
  }
}
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
    console.error("POST /api/rooms error:", error);
    return NextResponse.json({ error: "Failed to add room." }, { status: 500 });
  } finally {
    client.release();
  }
}
