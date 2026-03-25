import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookingID = Number(id);

    const result = await pool.query(
      `
      SELECT 
        b.bookingID AS "bookingID",
        b.customerID AS "customerID",
        b.hotelID AS "hotelID",
        b.room_number AS "roomNumber",
        b.start_date AS "startDate",
        b.end_date AS "endDate",
        b.status,
        b.customer_name_snapshot AS "customerName",
        b.customer_id_snapshot AS "customerIdSnapshot",
        b.room_snapshot AS "roomSnapshot",
        b.hotel_snapshot AS "hotelSnapshot",
        b.chain_name_snapshot AS "chainName"
      FROM ehotels.booking b
      WHERE b.bookingID = $1;
      `,
      [bookingID]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("BOOKING API ERROR:", error);
    return NextResponse.json(
      {
        error: "Server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}