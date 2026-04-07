// get list of ALL employees, add new employees

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// list ALL employees
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        e.employeeid AS "employeeID",
        e.first_name AS "firstName",
        e.last_name AS "lastName",
        e.street,
        e.city,
        e.province,
        e.postal_code AS "postalCode",
        e.ssn_sin AS "ssnSin",
        e.hotelid AS "hotelID",
        er.role_name AS "roleName"
      FROM ehotels.employee e
      LEFT JOIN ehotels.employee_role er
        ON e.employeeid = er.employeeid
      ORDER BY e.employeeid;
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("GET /api/employees error:", error);
    return NextResponse.json(
      { error: "Failed to load employees." },
      { status: 500 },
    );
  }
}

// add a new employee
export async function POST(req: NextRequest) {
  const client = await pool.connect();

  try {
    const body = await req.json();

    const {
      firstName,
      lastName,
      street,
      city,
      province,
      postalCode,
      ssnSin,
      hotelID,
      roleName,
    } = body;

    if (
      !firstName ||
      !lastName ||
      !street ||
      !city ||
      !province ||
      !postalCode ||
      !ssnSin ||
      hotelID === undefined ||
      hotelID === null ||
      !roleName
    ) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 },
      );
    }

    await client.query("BEGIN");
    await client.query(`LOCK TABLE ehotels.employee IN EXCLUSIVE MODE;`);
    const nextIdResult = await client.query(`
      SELECT COALESCE(
        (
          SELECT MIN(missing_id) 
          FROM (
            SELECT 1 AS missing_id
            WHERE NOT EXISTS (
              SELECT 1
              FROM ehotels.employee
              WHERE employeeid = 1
            )

            UNION

            SELECT e1.employeeid + 1 AS missing_id
            FROM ehotels.employee e1
            WHERE NOT EXISTS (
              SELECT 1
              FROM ehotels.employee e2
              WHERE e2.employeeid = e1.employeeid + 1
            )
          ) AS candidates
        ),
        1
      ) AS "nextEmployeeID";
    `);

    const newEmployeeID = Number(nextIdResult.rows[0].nextEmployeeID);

    // insert employee using recycled id
    await client.query(
      `
      INSERT INTO ehotels.employee
        (
          employeeid,
          first_name,
          last_name,
          street,
          city,
          province,
          postal_code,
          ssn_sin,
          hotelid
        )
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9);
      `,
      [
        newEmployeeID,
        firstName,
        lastName,
        street,
        city,
        province,
        postalCode,
        ssnSin,
        hotelID,
      ],
    );

    // insert role
    await client.query(
      `
      INSERT INTO ehotels.employee_role (employeeid, role_name)
      VALUES ($1, $2);
      `,
      [newEmployeeID, roleName],
    );

    await client.query("COMMIT");

    return NextResponse.json({
      message: "Employee created successfully.",
      employeeID: newEmployeeID,
    });
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("POST /api/employees error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to create employee." },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
