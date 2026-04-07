import { NextResponse } from "next/server";
import pool from "@/lib/db";

// for creating new customer and making a renting,
// or making an existing customer make a renting

export async function POST(request: Request) {
  const client = await pool.connect();

  try {
    const body = await request.json();

    const {
      customerMode,
      first_name,
      last_name,
      street,
      city,
      province,
      postal_code,
      id_type,
      id_value,
      hotelID,
      room_number,
      start_date,
      end_date,
    } = body;

    // convert numeric fields from form input
    const parsedHotelID = Number(hotelID);
    const parsedRoomNumber = Number(room_number);

    // basic validation of all needed renting fields
    if (
      !customerMode ||
      !parsedHotelID ||
      !parsedRoomNumber ||
      !start_date ||
      !end_date
    ) {
      return NextResponse.json(
        { error: "Missing required renting fields." },
        { status: 400 },
      );
    }

    // make sure date range makes sense
    if (start_date >= end_date) {
      return NextResponse.json(
        { error: "End date must be after start date." },
        { status: 400 },
      );
    }

    let finalCustomerID: number;
    let customerNameSnapshot: string;
    let customerIdSnapshot: string;

    await client.query("BEGIN");

    // if existing customer: search by first and last name
    if (customerMode === "existing") {
      if (!first_name || !last_name) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          {
            error:
              "First name and last name are required for existing customer search.",
          },
          { status: 400 },
        );
      }

      const existingCustomerResult = await client.query(
        `
        SELECT customerID, first_name, last_name, id_type, id_value
        FROM ehotels.customer
        WHERE LOWER(first_name) = LOWER($1)
          AND LOWER(last_name) = LOWER($2)
        `,
        [first_name, last_name],
      );
      if (existingCustomerResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { error: "No customer found with that first and last name." },
          { status: 404 },
        );
      }
      if (existingCustomerResult.rows.length > 1) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          {
            error:
              "Multiple customers found with that name. Please be more specific.",
          },
          { status: 400 },
        );
      }

      const existingCustomer = existingCustomerResult.rows[0];

      finalCustomerID = existingCustomer.customerid;
      customerNameSnapshot = `${existingCustomer.first_name} ${existingCustomer.last_name}`;
      customerIdSnapshot = `${existingCustomer.id_type}: ${existingCustomer.id_value}`;
    }

    // if adding new customer
    else if (customerMode === "new") {
      // need all customer fields
      if (
        !first_name ||
        !last_name ||
        !street ||
        !city ||
        !province ||
        !postal_code ||
        !id_type ||
        !id_value
      ) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { error: "Missing required new customer fields." },
          { status: 400 },
        );
      }

      const newCustomerIdResult = await client.query(
        `
        SELECT COALESCE(MAX(customerID), 0) + 1 AS next_id
        FROM ehotels.customer
        `,
      );

      finalCustomerID = newCustomerIdResult.rows[0].next_id;

      await client.query(
        `
        INSERT INTO ehotels.customer (
          customerID,
          first_name,
          last_name,
          street,
          city,
          province,
          postal_code,
          id_type,
          id_value,
          registration_date
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_DATE)
        `,
        [
          finalCustomerID,
          first_name,
          last_name,
          street,
          city,
          province,
          postal_code,
          id_type,
          id_value,
        ],
      );

      customerNameSnapshot = `${first_name} ${last_name}`;
      customerIdSnapshot = `${id_type}: ${id_value}`;
    } else {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "Invalid customer mode." },
        { status: 400 },
      );
    }

    // make sure hotel exists!!
    const hotelResult = await client.query(
      `
      SELECT 1
      FROM ehotels.hotel
      WHERE hotelID = $1
      `,
      [parsedHotelID],
    );

    if (hotelResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "That hotel does not exist." },
        { status: 400 },
      );
    }

    // make sure room exists in that hotel
    const roomResult = await client.query(
      `
      SELECT 1
      FROM ehotels.room
      WHERE hotelID = $1 AND room_number = $2
      `,
      [parsedHotelID, parsedRoomNumber],
    );

    if (roomResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "That room does not exist in the selected hotel." },
        { status: 400 },
      );
    }

    // make sure room is not already booked for overlapping dates
    const bookingConflict = await client.query(
      `
      SELECT 1
      FROM ehotels.booking
      WHERE hotelID = $1
        AND room_number = $2
        AND status = 'confirmed'
        AND start_date < $4
        AND end_date > $3
      `,
      [parsedHotelID, parsedRoomNumber, start_date, end_date],
    );

    if (bookingConflict.rows.length > 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "This room is already booked for the selected dates." },
        { status: 400 },
      );
    }

    // make sure room is not already rented for overlapping dates
    const rentingConflict = await client.query(
      `
      SELECT 1
      FROM ehotels.renting
      WHERE hotelID = $1
        AND room_number = $2
        AND start_date < $4
        AND end_date > $3
      `,
      [parsedHotelID, parsedRoomNumber, start_date, end_date],
    );

    if (rentingConflict.rows.length > 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "This room is already being rented for the selected dates." },
        { status: 400 },
      );
    }

    // create new rentingID
    const newRentingIdResult = await client.query(
      `
      SELECT COALESCE(MAX(rentingID), 0) + 1 AS next_id
      FROM ehotels.renting
      `,
    );

    const newRentingID = newRentingIdResult.rows[0].next_id;

    // hardcoded snapshots for now
    const roomSnapshot = `Room ${parsedRoomNumber}`;
    const hotelSnapshot = `Hotel ${parsedHotelID}`;
    const chainNameSnapshot = `Hardcoded Chain`;

    // hardcoded employeeID for now (doesnt really matter who does the walkin)
    const employeeID = 1;

    // no bookingID for walk-in and no checkout time yet
    await client.query(
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
        $1, $2, $3, NOW(), NULL,
        $4, $5, $6, $7, NULL,
        $8, $9, $10, $11, $12
      )
      `,
      [
        newRentingID,
        start_date,
        end_date,
        finalCustomerID,
        parsedRoomNumber,
        parsedHotelID,
        employeeID,
        customerNameSnapshot,
        customerIdSnapshot,
        roomSnapshot,
        hotelSnapshot,
        chainNameSnapshot,
      ],
    );

    await client.query("COMMIT");

    return NextResponse.json({
      message: "Walk-in renting created successfully.",
      rentingID: newRentingID,
      customerID: finalCustomerID,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("POST WALK-IN RENTING ERROR:", error);
    return NextResponse.json(
      { error: "Server error while creating walk-in renting." },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
