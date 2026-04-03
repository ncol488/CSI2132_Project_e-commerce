// get all rooms, so all can be listed / new room can be added

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        r.room_number AS "roomNumber",
        r.hotelid AS "hotelID",
        h.hotel_name AS "hotelName",
        h.city,
        r.price,
        r.capacity,
        r.view_type AS "viewType",
        r.extendable,
        r.problems_damages AS "problemsDamages",
        COALESCE(
          ARRAY_AGG(DISTINCT a.name) FILTER (WHERE a.name IS NOT NULL),
          '{}'
        ) AS "amenities",
        CASE
          WHEN EXISTS (
            SELECT 1
            FROM ehotels.booking b
            WHERE b.hotelid = r.hotelid
              AND b.room_number = r.room_number
              AND b.status <> 'cancelled'
          )
          OR EXISTS (
            SELECT 1
            FROM ehotels.renting rt
            WHERE rt.hotelid = r.hotelid
              AND rt.room_number = r.room_number
              AND rt.checkout_datetime IS NULL
          )
          THEN 'Occupied / Booked'
          ELSE 'Available'
        END AS "availability"
      FROM ehotels.room r
      JOIN ehotels.hotel h
        ON r.hotelid = h.hotelid
      LEFT JOIN ehotels.room_amenity ra
        ON r.room_number = ra.room_number
       AND r.hotelid = ra.hotelid
      LEFT JOIN ehotels.amenity a
        ON ra.amenityid = a.amenityid
      GROUP BY
        r.room_number,
        r.hotelid,
        h.hotel_name,
        h.city,
        r.price,
        r.capacity,
        r.view_type,
        r.extendable,
        r.problems_damages
      ORDER BY r.hotelid, r.room_number;
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("GET /api/rooms error:", error);
    return NextResponse.json(
      { error: "Failed to load rooms." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const client = await pool.connect();

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

    if (
      roomNumber === undefined ||
      hotelID === undefined ||
      price === undefined ||
      capacity === undefined ||
      !viewType ||
      extendable === undefined
    ) {
      return NextResponse.json(
        { error: "Please fill in all required room fields." },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    const hotelCheck = await client.query(
      `
      SELECT hotelid
      FROM ehotels.hotel
      WHERE hotelid = $1
      `,
      [hotelID]
    );

    if (hotelCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "Hotel does not exist." },
        { status: 400 }
      );
    }

    await client.query(
      `
      INSERT INTO ehotels.room (
        room_number,
        hotelid,
        price,
        capacity,
        view_type,
        extendable,
        problems_damages
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        roomNumber,
        hotelID,
        price,
        capacity,
        viewType,
        extendable,
        problemsDamages || null,
      ]
    );

    if (Array.isArray(amenities) && amenities.length > 0) {
      for (const amenityName of amenities) {
        const trimmed = String(amenityName).trim();
        if (!trimmed) continue;

        const amenityResult = await client.query(
          `
          SELECT amenityid
          FROM ehotels.amenity
          WHERE LOWER(name) = LOWER($1)
          `,
          [trimmed]
        );

        if (amenityResult.rows.length === 0) {
          continue;
        }

        const amenityID = amenityResult.rows[0].amenityid;

        await client.query(
          `
          INSERT INTO ehotels.room_amenity (room_number, hotelid, amenityid)
          VALUES ($1, $2, $3)
          ON CONFLICT DO NOTHING
          `,
          [roomNumber, hotelID, amenityID]
        );
      }
    }

    await client.query("COMMIT");

    return NextResponse.json(
      { message: "Room added successfully." },
      { status: 201 }
    );
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("POST /api/rooms error:", error);

    if (error.code === "23505") {
      return NextResponse.json(
        { error: "That room already exists for this hotel." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to add room." },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}