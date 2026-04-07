import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// ── GET /api/bookings ─────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const customerID = searchParams.get("customerID");

  try {
    if (customerID) {
      // Customer View: Show their specific history
      const result = await db.query(
        `SELECT b.*, r.price, h.hotel_name, h.city, hc.chain_name
         FROM ehotels.Booking b
         LEFT JOIN ehotels.Room r ON b.room_number = r.room_number AND b.hotelID = r.hotelID
         LEFT JOIN ehotels.Hotel h ON b.hotelID = h.hotelID
         LEFT JOIN ehotels.HotelChain hc ON h.chainID = hc.chainID
         WHERE b.customerID = $1
         ORDER BY b.start_date DESC`,
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
          ...row,
          price_per_night: row.price ? parseFloat(row.price) : null,
          nights,
          total_price: row.price ? parseFloat(row.price) * nights : null,
        };
      });
      return NextResponse.json({ bookings });
    }

    // Employee View: All confirmed bookings not yet checked in
    // Note: column names are kept lowercase to match standard Postgres output
    const result = await db.query(`
      SELECT 
        b.bookingid, 
        b.customer_name_snapshot, 
        b.room_number, 
        b.start_date, 
        b.end_date, 
        b.status,
        h.hotel_name,
        h.city
      FROM ehotels.Booking b
      LEFT JOIN ehotels.Hotel h ON b.hotelID = h.hotelID
      WHERE b.status = 'confirmed'
        AND NOT EXISTS (SELECT 1 FROM ehotels.Renting r WHERE r.bookingid = b.bookingid)
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

    // 1. Validation
    if (!customerID || !room_number || !hotelID || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // 2. Overlap Check (Simplified for brevity)
    const overlap = await db.query(
      `SELECT 1 FROM ehotels.Booking WHERE room_number = $1 AND hotelID = $2 
       AND status != 'cancelled' AND start_date < $4::date AND end_date > $3::date LIMIT 1`,
      [room_number, hotelID, checkIn, checkOut],
    );
    if (overlap.rows.length > 0)
      return NextResponse.json(
        { error: "Room already occupied" },
        { status: 409 },
      );

    // 3. Fetch Data for Snapshots
    const roomRes = await db.query(
      `SELECT r.*, h.hotel_name, h.street, h.city, hc.chain_name 
       FROM ehotels.Room r JOIN ehotels.Hotel h ON r.hotelID = h.hotelID 
       JOIN ehotels.HotelChain hc ON h.chainID = hc.chainID
       WHERE r.room_number = $1 AND r.hotelID = $2`,
      [room_number, hotelID],
    );
    const rm = roomRes.rows[0];

    // 4. Create Snapshots (CSI 2132 Requirement)
    const roomSnapshot = `Room ${rm.room_number}, ${rm.view_type} view`;
    const hotelSnapshot = `${rm.hotel_name}, ${rm.city}`;
    const customerIDSnapshot = idType
      ? `${idType}: ${idNumber}`
      : `CID: ${customerID}`;

    const maxID = await db.query(
      `SELECT COALESCE(MAX(bookingid), 0) + 1 AS next_id FROM ehotels.Booking`,
    );

    await db.query(
      `INSERT INTO ehotels.Booking (bookingid, start_date, end_date, status, customerid, room_number, hotelid, 
       customer_name_snapshot, customer_id_snapshot, room_snapshot, hotel_snapshot, chain_name_snapshot) 
       VALUES ($1,$2,$3,'confirmed',$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        maxID.rows[0].next_id,
        checkIn,
        checkOut,
        customerID,
        room_number,
        hotelID,
        fullName || `Guest ${customerID}`,
        customerIDSnapshot,
        roomSnapshot,
        hotelSnapshot,
        rm.chain_name,
      ],
    );

    return NextResponse.json(
      { bookingid: maxID.rows[0].next_id, status: "confirmed" },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 },
    );
  }
}
