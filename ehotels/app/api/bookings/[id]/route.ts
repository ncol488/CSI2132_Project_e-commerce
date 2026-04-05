import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

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
