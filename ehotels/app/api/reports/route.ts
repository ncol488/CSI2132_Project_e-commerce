import { NextResponse } from "next/server";
import pool from "@/lib/db";

// to implement views
export async function GET() {
  try {
    const availableRoomsResult = await pool.query(`
      SELECT
        area,
        available_rooms AS "availableRooms"
      FROM ehotels.availableroomsperarea
      ORDER BY area;
    `);

    // Join directly against tables to get hotel name + occupied beds
    // instead of relying on the limited hoteltotalcapacity view
    const hotelCapacityResult = await pool.query(`
      SELECT
        h.hotelID   AS "hotelID",
        h.hotel_name AS "hotelName",
        h.city,
        COALESCE(SUM(r.capacity), 0)::int AS "totalCapacity",
        COALESCE((
          SELECT SUM(r2.capacity)
          FROM ehotels.Room r2
          JOIN ehotels.Renting re
            ON re.room_number = r2.room_number
            AND re.hotelID = r2.hotelID
          WHERE r2.hotelID = h.hotelID
            AND re.checkout_datetime IS NULL
        ), 0)::int AS "occupiedBeds"
      FROM ehotels.Hotel h
      LEFT JOIN ehotels.Room r ON r.hotelID = h.hotelID
      GROUP BY h.hotelID, h.hotel_name, h.city
      ORDER BY h.hotelID;
    `);

    return NextResponse.json({
      availableRoomsPerArea: availableRoomsResult.rows,
      hotelTotalCapacity: hotelCapacityResult.rows,
    });
  } catch (error) {
    console.error("GET /api/reports error:", error);
    return NextResponse.json(
      { error: "Failed to load reports." },
      { status: 500 },
    );
  }
}
