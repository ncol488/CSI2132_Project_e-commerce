// get all hotels, so all can be listed / new hotel can be added

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// get all hotels
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        h.hotelid AS "hotelID",
        h.hotel_name AS "hotelName",
        h.street,
        h.city,
        h.province,
        h.postal_code AS "postalCode",
        h.category,
        h.chainid AS "chainID",
        hc.chain_name AS "chainName",
        hc.central_office_address AS "centralOfficeAddress",

        (
          SELECT email
          FROM ehotels.hotel_email
          WHERE hotelid = h.hotelid
          LIMIT 1
        ) AS "hotelEmail",

        (
          SELECT phone_number
          FROM ehotels.hotel_phone
          WHERE hotelid = h.hotelid
          LIMIT 1
        ) AS "hotelPhone",

        (
          SELECT email
          FROM ehotels.chain_email
          WHERE chainid = hc.chainid
          LIMIT 1
        ) AS "chainEmail",

        (
          SELECT phone_number
          FROM ehotels.chain_phone
          WHERE chainid = hc.chainid
          LIMIT 1
        ) AS "chainPhone"

      FROM ehotels.hotel h
      JOIN ehotels.hotelchain hc
        ON h.chainid = hc.chainid
      ORDER BY h.hotelid;
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("GET /api/hotels error:", error);
    return NextResponse.json(
      { error: "Failed to load hotels." },
      { status: 500 }
    );
  }
}

// create a new hotel
export async function POST(req: NextRequest) {
  const client = await pool.connect();

  try {
    const body = await req.json();

    const {
      hotelName,
      street,
      city,
      province,
      postalCode,
      category,
      chainID,
      chainName,
      centralOfficeAddress,
      hotelEmail,
      hotelPhone,
      chainEmail,
      chainPhone,
    } = body;

    if (
      !hotelName ||
      !street ||
      !city ||
      !province ||
      !postalCode ||
      !category ||
      !chainID ||
      !chainName ||
      !centralOfficeAddress
    ) {
      return NextResponse.json(
        { error: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    // if chain doesn't exist yet, create it
    const chainCheck = await client.query(
      `
      SELECT chainid
      FROM ehotels.hotelchain
      WHERE chainid = $1
      `,
      [chainID]
    );

    if (chainCheck.rows.length === 0) {
      await client.query(
        `
        INSERT INTO ehotels.hotelchain (
          chainid,
          chain_name,
          central_office_address
        )
        VALUES ($1, $2, $3)
        `,
        [chainID, chainName, centralOfficeAddress]
      );

      if (chainEmail) {
        await client.query(
          `
          INSERT INTO ehotels.chain_email (chainid, email)
          VALUES ($1, $2)
          `,
          [chainID, chainEmail]
        );
      }

      if (chainPhone) {
        await client.query(
          `
          INSERT INTO ehotels.chain_phone (chainid, phone_number)
          VALUES ($1, $2)
          `,
          [chainID, chainPhone]
        );
      }
    }

    // next hotel id
    const nextHotelResult = await client.query(`
      SELECT COALESCE(MAX(hotelid), 0) + 1 AS next_id
      FROM ehotels.hotel
    `);

    const nextHotelID = nextHotelResult.rows[0].next_id;

    await client.query(
      `
      INSERT INTO ehotels.hotel (
        hotelid,
        hotel_name,
        street,
        city,
        province,
        postal_code,
        category,
        chainid
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [
        nextHotelID,
        hotelName,
        street,
        city,
        province,
        postalCode,
        category,
        chainID,
      ]
    );

    if (hotelEmail) {
      await client.query(
        `
        INSERT INTO ehotels.hotel_email (hotelid, email)
        VALUES ($1, $2)
        `,
        [nextHotelID, hotelEmail]
      );
    }

    if (hotelPhone) {
      await client.query(
        `
        INSERT INTO ehotels.hotel_phone (hotelid, phone_number)
        VALUES ($1, $2)
        `,
        [nextHotelID, hotelPhone]
      );
    }

    await client.query("COMMIT");

    return NextResponse.json(
      { message: "Hotel added successfully." },
      { status: 201 }
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("POST /api/hotels error:", error);
    return NextResponse.json(
      { error: "Failed to add hotel." },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}