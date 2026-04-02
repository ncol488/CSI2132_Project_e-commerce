import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(request: Request) {
  const { room_id, check_in, check_out } = await request.json();
  try {
    await db.query(
      "INSERT INTO Booking (start_date, end_date, status, customerID, room_number, hotelID) VALUES ($1, $2, 'confirmed', 101, $3, 1)",
      [check_in, check_out, room_id],
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Room already booked" }, { status: 400 });
  }
}
