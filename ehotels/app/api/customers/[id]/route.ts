//to get individual customers, for editing/deleting/loading ONE customer
//note: made unable to delete if there is an associated renting or booking, so that you can't have one without a customer associated

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const result = await pool.query(
      `
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
      WHERE customerid = $1;
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Customer not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("GET /api/customers/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to load customer." },
      { status: 500 }
    );
  }
}

// update customer
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
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
      UPDATE ehotels.customer
      SET
        first_name = $1,
        last_name = $2,
        street = $3,
        city = $4,
        province = $5,
        postal_code = $6,
        id_type = $7,
        id_value = $8
      WHERE customerid = $9
      RETURNING customerid AS "customerID";
      `,
      [
        firstName,
        lastName,
        street,
        city,
        province,
        postalCode,
        idType,
        idValue,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Customer not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Customer updated successfully.",
      customerID: result.rows[0].customerID,
    });
  } catch (error) {
    console.error("PUT /api/customers/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update customer." },
      { status: 500 }
    );
  }
}

// delete customer
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const result = await pool.query(
      `
      DELETE FROM ehotels.customer
      WHERE customerid = $1
      RETURNING customerid AS "customerID";
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Customer not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Customer deleted successfully.",
      customerID: result.rows[0].customerID,
    });
  } catch (error: any) {
    console.error("DELETE /api/customers/[id] error:", error);

    // helpful message if bookings/rentings reference that customer, so that rentings can be associated to a customer at all times
    if (error.code === "23503") {
      return NextResponse.json(
        {
          error:
            "This customer cannot be deleted because they are linked to existing bookings or rentings.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete customer." },
      { status: 500 }
    );
  }
}