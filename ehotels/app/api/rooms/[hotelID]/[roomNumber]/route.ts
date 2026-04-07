// get / update / delete ONE room

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

type Params = {
  params: Promise<{
    hotelID: string;
    roomNumber: string;
  }>;
};

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { hotelID, roomNumber } = await params;

    const result = await pool.query(
      `
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
          THEN false -- No quotes! This is a boolean
          ELSE true  -- No quotes! This is a boolean
        END AS "is_available"
      FROM ehotels.room r
      JOIN ehotels.hotel h
        ON r.hotelid = h.hotelid
      LEFT JOIN ehotels.room_amenity ra
        ON r.room_number = ra.room_number
       AND r.hotelid = ra.hotelid
      LEFT JOIN ehotels.amenity a
        ON ra.amenityid = a.amenityid
      WHERE r.hotelid = $1
        AND r.room_number = $2
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
      `,
      [hotelID, roomNumber],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Room not found." }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("GET /api/rooms/[hotelID]/[roomNumber] error:", error);
    return NextResponse.json(
      { error: "Failed to load room." },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const client = await pool.connect();

  try {
    const { hotelID, roomNumber } = await params;
    const body = await req.json();

    const {
      price,
      capacity,
      viewType,
      extendable,
      problemsDamages,
      amenities,
    } = body;

    await client.query("BEGIN");

    const roomCheck = await client.query(
      `
      SELECT room_number, hotelid
      FROM ehotels.room
      WHERE hotelid = $1
        AND room_number = $2
      `,
      [hotelID, roomNumber],
    );

    if (roomCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Room not found." }, { status: 404 });
    }

    await client.query(
      `
      UPDATE ehotels.room
      SET price = $1,
          capacity = $2,
          view_type = $3,
          extendable = $4,
          problems_damages = $5
      WHERE hotelid = $6
        AND room_number = $7
      `,
      [
        price,
        capacity,
        viewType,
        extendable,
        problemsDamages || null,
        hotelID,
        roomNumber,
      ],
    );

    // replace amenities
    await client.query(
      `
      DELETE FROM ehotels.room_amenity
      WHERE hotelid = $1
        AND room_number = $2
      `,
      [hotelID, roomNumber],
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
          [trimmed],
        );

        // skip names that don't exist in Amenity table
        if (amenityResult.rows.length === 0) continue;

        const amenityID = amenityResult.rows[0].amenityid;

        await client.query(
          `
          INSERT INTO ehotels.room_amenity (room_number, hotelid, amenityid)
          VALUES ($1, $2, $3)
          `,
          [roomNumber, hotelID, amenityID],
        );
      }
    }

    await client.query("COMMIT");

    return NextResponse.json({ message: "Room updated successfully." });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("PUT /api/rooms/[hotelID]/[roomNumber] error:", error);
    return NextResponse.json(
      { error: "Failed to update room." },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const client = await pool.connect();

  try {
    const { hotelID, roomNumber } = await params;

    await client.query("BEGIN");

    const roomCheck = await client.query(
      `
      SELECT room_number, hotelid
      FROM ehotels.room
      WHERE hotelid = $1
        AND room_number = $2
      `,
      [hotelID, roomNumber],
    );

    if (roomCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Room not found." }, { status: 404 });
    }

    // block delete if room is used in bookings
    const bookingCheck = await client.query(
      `
      SELECT bookingid
      FROM ehotels.booking
      WHERE hotelid = $1
        AND room_number = $2
      LIMIT 1
      `,
      [hotelID, roomNumber],
    );

    if (bookingCheck.rows.length > 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        {
          error:
            "Cannot delete this room because it is linked to one or more bookings.",
        },
        { status: 400 },
      );
    }

    // block delete if room is used in rentings
    const rentingCheck = await client.query(
      `
      SELECT rentingid
      FROM ehotels.renting
      WHERE hotelid = $1
        AND room_number = $2
      LIMIT 1
      `,
      [hotelID, roomNumber],
    );

    if (rentingCheck.rows.length > 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        {
          error:
            "Cannot delete this room because it is linked to one or more rentings.",
        },
        { status: 400 },
      );
    }

    // delete amenities first
    await client.query(
      `
      DELETE FROM ehotels.room_amenity
      WHERE hotelid = $1
        AND room_number = $2
      `,
      [hotelID, roomNumber],
    );

    // then delete room
    await client.query(
      `
      DELETE FROM ehotels.room
      WHERE hotelid = $1
        AND room_number = $2
      `,
      [hotelID, roomNumber],
    );

    await client.query("COMMIT");

    return NextResponse.json({ message: "Room deleted successfully." });
  } catch (error: any) {
    await client.query("ROLLBACK");

    console.error("DELETE /api/rooms/[hotelID]/[roomNumber] error:", error);
    console.error("Postgres error code:", error?.code);
    console.error("Postgres detail:", error?.detail);

    return NextResponse.json(
      {
        error:
          "Failed to delete room. It may still be linked to bookings or rentings.",
      },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
