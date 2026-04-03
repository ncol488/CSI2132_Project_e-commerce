import { NextResponse } from "next/server";
import pool from "@/lib/db";

//to implement views

export async function GET() {
  try {
    const availableRoomsResult = await pool.query(`
      SELECT
        area,
        available_rooms AS "availableRooms"
      FROM ehotels.availableroomsperarea
      ORDER BY area;
    `);

    const hotelCapacityResult = await pool.query(`
      SELECT
        hotelid AS "hotelID",
        city,
        total_capacity AS "totalCapacity"
      FROM ehotels.hoteltotalcapacity
      ORDER BY hotelid;
    `);

    return NextResponse.json({
      availableRoomsPerArea: availableRoomsResult.rows,
      hotelTotalCapacity: hotelCapacityResult.rows,
    });
  } catch (error) {
    console.error("GET /api/reports error:", error);
    return NextResponse.json(
      { error: "Failed to load reports." },
      { status: 500 }
    );
  }
}