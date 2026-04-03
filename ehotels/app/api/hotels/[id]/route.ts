// to get individual hotels, for editing/deleting/loading ONE hotel

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// get one hotel
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const result = await pool.query(
      `
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
      WHERE h.hotelid = $1;
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Hotel not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("GET /api/hotels/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to load hotel." },
      { status: 500 }
    );
  }
}

// update one hotel
export async function PUT(req: NextRequest, { params }: Params) {
  const client = await pool.connect();

  try {
    const { id } = await params;
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

    await client.query("BEGIN");

    const hotelCheck = await client.query(
      `
      SELECT hotelid, chainid
      FROM ehotels.hotel
      WHERE hotelid = $1
      `,
      [id]
    );

    if (hotelCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "Hotel not found." },
        { status: 404 }
      );
    }

    const oldChainID = hotelCheck.rows[0].chainid;

    // if changing to a chain id that doesn't exist, create it
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
    } else {
      await client.query(
        `
        UPDATE ehotels.hotelchain
        SET chain_name = $1,
            central_office_address = $2
        WHERE chainid = $3
        `,
        [chainName, centralOfficeAddress, chainID]
      );
    }

    await client.query(
      `
      UPDATE ehotels.hotel
      SET hotel_name = $1,
          street = $2,
          city = $3,
          province = $4,
          postal_code = $5,
          category = $6,
          chainid = $7
      WHERE hotelid = $8
      `,
      [hotelName, street, city, province, postalCode, category, chainID, id]
    );

    // replace hotel email
    await client.query(
      `DELETE FROM ehotels.hotel_email WHERE hotelid = $1`,
      [id]
    );
    if (hotelEmail) {
      await client.query(
        `
        INSERT INTO ehotels.hotel_email (hotelid, email)
        VALUES ($1, $2)
        `,
        [id, hotelEmail]
      );
    }

    // replace hotel phone
    await client.query(
      `DELETE FROM ehotels.hotel_phone WHERE hotelid = $1`,
      [id]
    );
    if (hotelPhone) {
      await client.query(
        `
        INSERT INTO ehotels.hotel_phone (hotelid, phone_number)
        VALUES ($1, $2)
        `,
        [id, hotelPhone]
      );
    }

    // replace chain email
    await client.query(
      `DELETE FROM ehotels.chain_email WHERE chainid = $1`,
      [chainID]
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

    // replace chain phone
    await client.query(
      `DELETE FROM ehotels.chain_phone WHERE chainid = $1`,
      [chainID]
    );
    if (chainPhone) {
      await client.query(
        `
        INSERT INTO ehotels.chain_phone (chainid, phone_number)
        VALUES ($1, $2)
        `,
        [chainID, chainPhone]
      );
    }

    await client.query("COMMIT");

    return NextResponse.json({ message: "Hotel updated successfully." });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("PUT /api/hotels/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update hotel." },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

// delete one hotel
export async function DELETE(req: NextRequest, { params }: Params) {
  const client = await pool.connect();

  try {
    const { id } = await params;

    await client.query("BEGIN");

    const hotelCheck = await client.query(
      `
      SELECT hotelid
      FROM ehotels.hotel
      WHERE hotelid = $1
      `,
      [id]
    );

    if (hotelCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "Hotel not found." },
        { status: 404 }
      );
    }

    // delete hotel contact rows first
    await client.query(`DELETE FROM ehotels.hotel_email WHERE hotelid = $1`, [id]);
    await client.query(`DELETE FROM ehotels.hotel_phone WHERE hotelid = $1`, [id]);

    // then delete hotel
    await client.query(`DELETE FROM ehotels.hotel WHERE hotelid = $1`, [id]);

    await client.query("COMMIT");

    return NextResponse.json({ message: "Hotel deleted successfully." });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("DELETE /api/hotels/[id] error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to delete hotel. It may still be linked to rooms, employees, bookings, or rentings.",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}