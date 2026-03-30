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
  try {
    const body = await req.json();

    const {
      firstName,
      lastName,
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

    const result = await pool.query(
      `
      INSERT INTO ehotels.customer
        (first_name, last_name, street, city, province, postal_code, id_type, id_value)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING customerid AS "customerID";
      `,
      [firstName, lastName, street, city, province, postalCode, idType, idValue]
    );

    return NextResponse.json({
      message: "Customer created successfully.",
      customerID: result.rows[0].customerID,
    });
  } catch (error) {
    console.error("POST /api/customers error:", error);
    return NextResponse.json(
      { error: "Failed to create customer." },
      { status: 500 }
    );
  }
}