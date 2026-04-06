import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// ── GET /api/bookings ─────────────────────────────────────────────────────────
// ?customerID=X  → customer's own bookings (My Bookings page)
// no params      → all confirmed bookings not yet checked in (employee tab)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const customerID = searchParams.get("customerID");

  try {
    // ── Customer: their own bookings ────────────────────────────────────────
    if (customerID) {
      const result = await db.query(
        `
        SELECT
          b.bookingID,
          b.start_date,
          b.end_date,
          b.status,
          b.room_number,
          b.hotelID,
          b.customer_name_snapshot,
          b.customer_id_snapshot,
          b.room_snapshot,
          b.hotel_snapshot,
          b.chain_name_snapshot,
          r.price,
          h.hotel_name,
          h.city,
          hc.chain_name
        FROM ehotels.Booking b
        LEFT JOIN ehotels.Room r
          ON b.room_number = r.room_number AND b.hotelID = r.hotelID
        LEFT JOIN ehotels.Hotel h
          ON b.hotelID = h.hotelID
        LEFT JOIN ehotels.HotelChain hc
          ON h.chainID = hc.chainID
        WHERE b.customerID = $1
        ORDER BY b.start_date DESC
        `,
        [parseInt(customerID)],
      );

      const bookings = result.rows.map((row: any) => {
        const nights = Math.max(
          0,
          Math.round(
            (new Date(row.end_date).getTime() -
              new Date(row.start_date).getTime()) /
              86400000,
          ),
        );
        return {
          bookingID: row.bookingid,
          start_date: row.start_date,
          end_date: row.end_date,
          status: row.status,
          room_number: row.room_number,
          hotel_id: row.hotelid,
          hotel_name: row.hotel_name ?? row.hotel_snapshot,
          chain_name: row.chain_name ?? row.chain_name_snapshot,
          city: row.city,
          room_snapshot: row.room_snapshot,
          hotel_snapshot: row.hotel_snapshot,
          chain_name_snapshot: row.chain_name_snapshot,
          price_per_night: row.price ? parseFloat(row.price) : null,
          nights,
          total_price: row.price ? parseFloat(row.price) * nights : null,
        };
      });

      return NextResponse.json({ bookings });
    }

    // ── Employee: all confirmed bookings not yet checked in ─────────────────
    const result = await db.query(`
      SELECT
        b.bookingID          AS "bookingID",
        b.customer_name_snapshot AS "customerName",
        b.room_number        AS "roomNumber",
        b.start_date         AS "startDate",
        b.end_date           AS "endDate",
        b.status,
        h.hotel_name         AS "hotelName",
        h.city
      FROM ehotels.Booking b
      LEFT JOIN ehotels.Hotel h ON b.hotelID = h.hotelID
      WHERE b.status = 'confirmed'
        AND NOT EXISTS (
          SELECT 1 FROM ehotels.Renting r
          WHERE r.bookingID = b.bookingID
        )
      ORDER BY b.start_date ASC
    `);

    return NextResponse.json({ bookings: result.rows });
  } catch (error) {
    console.error("GET /api/bookings error:", error);
    return NextResponse.json(
      { error: "Failed to load bookings" },
      { status: 500 },
    );
  }
}

// ── POST /api/bookings ────────────────────────────────────────────────────────
// Creates a new booking (called from the customer BookingModal)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerID,
      room_number,
      hotelID,
      checkIn,
      checkOut,
      fullName,
      idType,
      idNumber,
    } = body;

    if (!customerID || !room_number || !hotelID || !checkIn || !checkOut) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: customerID, room_number, hotelID, checkIn, checkOut",
        },
        { status: 400 },
      );
    }

    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      return NextResponse.json(
        { error: "Check-in date cannot be in the past." },
        { status: 400 },
      );
    }
    if (endDate <= startDate) {
      return NextResponse.json(
        { error: "Check-out must be after check-in." },
        { status: 400 },
      );
    }

    // Check overlapping bookings
    const overlapBooking = await db.query(
      `SELECT 1 FROM ehotels.Booking
       WHERE room_number = $1 AND hotelID = $2
         AND status != 'cancelled'
         AND start_date < $4::date AND end_date > $3::date
       LIMIT 1`,
      [room_number, hotelID, checkIn, checkOut],
    );
    if (overlapBooking.rows.length > 0) {
      return NextResponse.json(
        { error: "This room is already booked for the selected dates." },
        { status: 409 },
      );
    }

    // Check overlapping rentings
    const overlapRenting = await db.query(
      `SELECT 1 FROM ehotels.Renting
       WHERE room_number = $1 AND hotelID = $2
         AND start_date < $4::date AND end_date > $3::date
       LIMIT 1`,
      [room_number, hotelID, checkIn, checkOut],
    );
    if (overlapRenting.rows.length > 0) {
      return NextResponse.json(
        { error: "This room is already rented for the selected dates." },
        { status: 409 },
      );
    }

    // Fetch room + hotel + chain for snapshots
    const roomRes = await db.query(
      `SELECT r.room_number, r.capacity, r.view_type, r.extendable, r.price,
              h.hotel_name, h.street, h.city, h.province, h.postal_code, h.category,
              hc.chain_name
       FROM ehotels.Room r
       JOIN ehotels.Hotel h       ON r.hotelID = h.hotelID
       JOIN ehotels.HotelChain hc ON h.chainID = hc.chainID
       WHERE r.room_number = $1 AND r.hotelID = $2`,
      [room_number, hotelID],
    );
    if (roomRes.rows.length === 0) {
      return NextResponse.json({ error: "Room not found." }, { status: 404 });
    }

    const rm = roomRes.rows[0];
    const roomSnapshot = `Room ${rm.room_number}, capacity ${rm.capacity}, ${rm.view_type} view${rm.extendable ? ", extendable" : ""}`;
    const hotelSnapshot = `${rm.hotel_name}, ${rm.street}, ${rm.city}, ${rm.province}, ${rm.postal_code}, category ${rm.category}`;
    const customerIDSnapshot =
      idType && idNumber
        ? `${idType}: ${idNumber}`
        : `customerID: ${customerID}`;

    const maxIDRes = await db.query(
      `SELECT COALESCE(MAX(bookingID), 0) + 1 AS next_id FROM ehotels.Booking`,
    );
    const nextBookingID = maxIDRes.rows[0].next_id;

    await db.query(
      `INSERT INTO ehotels.Booking (
         bookingID, start_date, end_date, status,
         customerID, room_number, hotelID,
         customer_name_snapshot, customer_id_snapshot,
         room_snapshot, hotel_snapshot, chain_name_snapshot
       ) VALUES ($1,$2,$3,'confirmed',$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        nextBookingID,
        checkIn,
        checkOut,
        customerID,
        room_number,
        hotelID,
        fullName || `Customer #${customerID}`,
        customerIDSnapshot,
        roomSnapshot,
        hotelSnapshot,
        rm.chain_name,
      ],
    );

    return NextResponse.json(
      { bookingID: nextBookingID, status: "confirmed" },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("POST /api/bookings error:", error);
    if (error.code === "P0001") {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 },
    );
  }
}
