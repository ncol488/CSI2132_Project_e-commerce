import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// NOTE: Payment table created in PostSQL to be able to save the data/use this route properly!!
// associates with a rentingID, amount calculated with (room price) x (number of days checked in)

// load payment info for one renting
export async function GET(request: NextRequest) {
  const client = await pool.connect();

  try {
    const rentingIDParam = request.nextUrl.searchParams.get("rentingID");
    const rentingID = Number(rentingIDParam);

    if (!rentingID) {
      return NextResponse.json(
        { error: "A valid rentingID is required." },
        { status: 400 }
      );
    }

    // get the renting and room price
    const rentingResult = await client.query(
      `
      SELECT
        r.rentingID,
        r.bookingID,
        r.customerID,
        r.hotelID,
        r.room_number,
        r.start_date,
        r.end_date,
        r.checkin_datetime,
        r.checkout_datetime,
        r.customer_name_snapshot,
        rm.price
      FROM ehotels.renting r
      JOIN ehotels.room rm
        ON rm.hotelID = r.hotelID
       AND rm.room_number = r.room_number
      WHERE r.rentingID = $1
      `,
      [rentingID]
    );

    if (rentingResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Renting not found." },
        { status: 404 }
      );
    }

    const renting = rentingResult.rows[0];

    // price is per day, so total = price * number of days
    const start = new Date(renting.start_date);
    const end = new Date(renting.end_date);
    const msPerDay = 1000 * 60 * 60 * 24;
    const numberOfDays = Math.round((end.getTime() - start.getTime()) / msPerDay);

    const pricePerDay = Number(renting.price);
    const totalAmount = Number((pricePerDay * numberOfDays).toFixed(2));

    // see if a payment already exists for this renting
    const paymentResult = await client.query(
      `
      SELECT paymentID, rentingID, amount, payment_date, payment_method
      FROM ehotels.payment
      WHERE rentingID = $1
      ORDER BY paymentID DESC
      LIMIT 1
      `,
      [rentingID]
    );

    const existingPayment =
      paymentResult.rows.length > 0 ? paymentResult.rows[0] : null;

    return NextResponse.json({
      renting,
      pricePerDay,
      numberOfDays,
      totalAmount,
      existingPayment,
    });
  } catch (error) {
    console.error("GET /api/payments error:", error);
    return NextResponse.json(
      { error: "Could not load payment details." },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

// record a payment for one renting
export async function POST(request: Request) {
  const client = await pool.connect();

  try {
    const body = await request.json();
    const rentingID = Number(body.rentingID);
    const paymentMethod = body.payment_method;

    if (!rentingID || !paymentMethod) {
      return NextResponse.json(
        { error: "rentingID and payment_method are required." },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    // get renting info again so backend calculates the amount itself
    const rentingResult = await client.query(
      `
      SELECT
        r.rentingID,
        r.hotelID,
        r.room_number,
        r.start_date,
        r.end_date,
        rm.price
      FROM ehotels.renting r
      JOIN ehotels.room rm
        ON rm.hotelID = r.hotelID
       AND rm.room_number = r.room_number
      WHERE r.rentingID = $1
      `,
      [rentingID]
    );

    if (rentingResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "Renting not found." },
        { status: 404 }
      );
    }

    const renting = rentingResult.rows[0];

    // prevent duplicate payments for the same renting
    const existingPaymentResult = await client.query(
      `
      SELECT 1
      FROM ehotels.payment
      WHERE rentingID = $1
      LIMIT 1
      `,
      [rentingID]
    );

    if (existingPaymentResult.rows.length > 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "Payment already recorded for this renting." },
        { status: 400 }
      );
    }

    const start = new Date(renting.start_date);
    const end = new Date(renting.end_date);
    const msPerDay = 1000 * 60 * 60 * 24;
    const numberOfDays = Math.round((end.getTime() - start.getTime()) / msPerDay);

    if (numberOfDays <= 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "Invalid renting dates." },
        { status: 400 }
      );
    }

    const pricePerDay = Number(renting.price);
    const totalAmount = Number((pricePerDay * numberOfDays).toFixed(2));

    //manual paymentID generation
    const paymentIdResult = await client.query(
      `
      SELECT COALESCE(MAX(paymentID), 0) + 1 AS next_id
      FROM ehotels.payment
      `
    );

    const paymentID = paymentIdResult.rows[0].next_id;

    await client.query(
      `
      INSERT INTO ehotels.payment (
        paymentID,
        rentingID,
        amount,
        payment_date,
        payment_method
      )
      VALUES ($1, $2, $3, CURRENT_DATE, $4)
      `,
      [paymentID, rentingID, totalAmount, paymentMethod]
    );

    await client.query("COMMIT");

    return NextResponse.json({
      message: "Payment recorded successfully.",
      paymentID,
      amount: totalAmount,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("POST /api/payments error:", error);
    return NextResponse.json(
      { error: "Could not record payment." },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}