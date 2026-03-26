import { NextResponse } from "next/server";
import pool from "@/lib/db";

//get ALL bookings

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        b.bookingID AS "bookingID",
        b.customer_name_snapshot AS "customerName",
        b.room_number AS "roomNumber",
        b.start_date AS "startDate",
        b.end_date AS "endDate",
        b.status
      FROM ehotels.booking b
      WHERE NOT EXISTS ( 
        SELECT 1
        FROM ehotels.renting r
        WHERE r.bookingid = b.bookingid
      )
      ORDER BY b.bookingID;
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("BOOKINGS API ERROR:", error);
    return NextResponse.json(
      {
        error: "Server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}