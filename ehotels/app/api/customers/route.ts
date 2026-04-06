//get all customers, so that all can be listed/new customer can be added

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// get all customers
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        customerid AS "customerID",
        first_name AS "firstName",
        last_name AS "lastName",
        email,
        street,
        city,
        province,
        postal_code AS "postalCode",
        id_type AS "idType",
        id_value AS "idValue"
      FROM ehotels.customer
      ORDER BY customerid;
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("GET /api/customers error:", error);
    return NextResponse.json(
      { error: "Failed to load customers." },
      { status: 500 }
    );
  }
}

// create a new customer
export async function POST(req: NextRequest) {
  const client = await pool.connect();
  try {
    const body = await req.json();

    const {
      firstName,
      lastName,
      email,
      street,
      city,
      province,
      postalCode,
      idType,
      idValue,
    } = body;

    if (
      !firstName ||
      !lastName ||
      !email||
      !street ||
      !city ||
      !province ||
      !postalCode ||
      !idType ||
      !idValue
    ) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    // lock customer table so two inserts do not pick the same recycled id
    await client.query(`LOCK TABLE ehotels.customer IN EXCLUSIVE MODE;`);

    // find the smallest missing customerid, so that when one is deleted the customerid resumes from last greatest customerid value
    const nextIdResult = await client.query(`
      SELECT COALESCE(
        (
          SELECT MIN(missing_id)
          FROM (
            SELECT 1 AS missing_id
            WHERE NOT EXISTS (
              SELECT 1
              FROM ehotels.customer
              WHERE customerid = 1
            )

            UNION

            SELECT c1.customerid + 1 AS missing_id
            FROM ehotels.customer c1
            WHERE NOT EXISTS (
              SELECT 1
              FROM ehotels.customer c2
              WHERE c2.customerid = c1.customerid + 1
            )
          ) AS candidates
        ),
        1
      ) AS "nextCustomerID";
    `);

    const newCustomerID = Number(nextIdResult.rows[0].nextCustomerID);

    const result = await client.query(
      `
      INSERT INTO ehotels.customer
        (
          customerid,
          first_name,
          last_name,
          email,
          street,
          city,
          province,
          postal_code,
          id_type,
          id_value,
          registration_date
        )
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_DATE)
      RETURNING customerid AS "customerID";
      `,
      [
        newCustomerID,
        firstName,
        lastName,
        email,
        street,
        city,
        province,
        postalCode,
        idType,
        idValue,
      ]
    );

    await client.query("COMMIT");

    return NextResponse.json({
      message: "Customer created successfully.",
      customerID: result.rows[0].customerID,
    });
  } catch (error: any) {
  console.error("POST /api/customers error:", error);
  return NextResponse.json(
    { error: error.message || "Failed to create customer." },
    { status: 500 }
  );
}
}