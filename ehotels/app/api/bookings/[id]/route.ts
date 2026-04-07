import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const bookingID = parseInt(id);

    if (isNaN(bookingID)) {
      return NextResponse.json(
        { error: "Invalid booking ID." },
        { status: 400 },
      );
    }

    const result = await db.query(
      `SELECT * FROM ehotels.Booking WHERE bookingID = $1`,
      [bookingID],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 },
      );
    }

    const b = result.rows[0];
    return NextResponse.json({
      bookingID: b.bookingid, // ← DB gives lowercase, rename to capital
      customerid: b.customerid,
      hotelid: b.hotelid,
      room_number: b.room_number,
      start_date: b.start_date,
      end_date: b.end_date,
      status: b.status,
      customer_name_snapshot: b.customer_name_snapshot,
      customer_id_snapshot: b.customer_id_snapshot,
      room_snapshot: b.room_snapshot,
      hotel_snapshot: b.hotel_snapshot,
      chain_name_snapshot: b.chain_name_snapshot,
    });
  } catch (error) {
    console.error("GET /api/bookings/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to load booking." },
      { status: 500 },
    );
  }
}
// ── PATCH: Cancel a booking (Customer Side) ──────────────────────────────────
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const bookingID = parseInt(id);

    if (isNaN(bookingID)) {
      return NextResponse.json(
        { error: "Invalid booking ID." },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { customerID } = body;

    if (!customerID) {
      return NextResponse.json(
        { error: "customerID is required." },
        { status: 400 },
      );
    }

    // Verify booking exists and belongs to this customer
    const existing = await db.query(
      `SELECT bookingID, status, start_date, customerID
       FROM ehotels.Booking
       WHERE bookingID = $1`,
      [bookingID],
    );

    if (existing.rows.length === 0) {
      return NextResponse.json(
        { error: "Booking not found." },
        { status: 404 },
      );
    }

    const booking = existing.rows[0];

    if (parseInt(booking.customerid) !== parseInt(customerID)) {
      return NextResponse.json({ error: "Not authorized." }, { status: 403 });
    }

    if (booking.status === "cancelled") {
      return NextResponse.json(
        { error: "Booking is already cancelled." },
        { status: 400 },
      );
    }

    const today = new Date();
    const checkIn = new Date(booking.start_date);
    today.setHours(0, 0, 0, 0);

    if (checkIn <= today) {
      return NextResponse.json(
        {
          error:
            "Cannot cancel a booking whose check-in date has already passed.",
        },
        { status: 400 },
      );
    }

    await db.query(
      `UPDATE ehotels.Booking SET status = 'cancelled' WHERE bookingID = $1`,
      [bookingID],
    );

    return NextResponse.json({ success: true, bookingID });
  } catch (error) {
    console.error("PATCH /api/bookings/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to cancel booking." },
      { status: 500 },
    );
  }
}
