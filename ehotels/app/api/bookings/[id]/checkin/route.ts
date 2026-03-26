import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// make booking into renting, from clicking View details and complete check in

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const client = await pool.connect();

  try {
    const { id } = await params;
    const bookingID = Number(id);

    if (Number.isNaN(bookingID)) {
      return NextResponse.json(
        { error: "Invalid booking ID" },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    // get booking
    const bookingResult = await client.query(
      `
      SELECT *
      FROM ehotels.booking
      WHERE bookingID = $1
      FOR UPDATE;
      `,
      [bookingID]
    );

    if (bookingResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    const booking = bookingResult.rows[0];

    // prevent renting twice
    const existingRenting = await client.query(
      `
      SELECT rentingID
      FROM ehotels.renting
      WHERE bookingID = $1;
      `,
      [bookingID]
    );

    if (existingRenting.rows.length > 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "Already converted to renting." },
        { status: 400 }
      );
    }

    // generate next renting ID
    const nextIdResult = await client.query(`
      SELECT COALESCE(MAX(rentingID), 0) + 1 AS "nextId"
      FROM ehotels.renting;
    `);

    const nextRentingID = nextIdResult.rows[0].nextId;

    // get employee for that hotel
    const employeeResult = await client.query(
      `
      SELECT employeeID
      FROM ehotels.employee
      WHERE hotelID = $1
      LIMIT 1;
      `,
      [booking.hotelid]
    );

    if (employeeResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "No employee found for hotel." },
        { status: 400 }
      );
    }

    const employeeID = employeeResult.rows[0].employeeid;

    // insert renting
    const rentingResult = await client.query(
      `
      INSERT INTO ehotels.renting (
        rentingID,
        start_date,
        end_date,
        checkin_datetime,
        checkout_datetime,
        customerID,
        room_number,
        hotelID,
        employeeID,
        bookingID,
        customer_name_snapshot,
        customer_id_snapshot,
        room_snapshot,
        hotel_snapshot,
        chain_name_snapshot
      )
      VALUES (
        $1,
        $2,
        $3,
        NOW(),
        NULL,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        $13
      )
      RETURNING rentingID;
      `,
      [
        nextRentingID,
        booking.start_date,
        booking.end_date,
        booking.customerid,
        booking.room_number,
        booking.hotelid,
        employeeID,
        booking.bookingid,
        booking.customer_name_snapshot,
        booking.customer_id_snapshot,
        booking.room_snapshot,
        booking.hotel_snapshot,
        booking.chain_name_snapshot,
      ]
    );

    await client.query("COMMIT");

    return NextResponse.json({
      message: "Check-in successful",
      rentingID: rentingResult.rows[0].rentingid,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("CHECK-IN ERROR:", error); //for any errors, shows doesnt work

    return NextResponse.json(
      {
        error: "Server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}