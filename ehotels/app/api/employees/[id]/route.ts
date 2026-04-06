// to get SINGLE employees, similar to customers [id] route

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// get one employee, join to combine with the role entity so we can change that too
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const result = await pool.query(
      `
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
      WHERE e.employeeid = $1;
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Employee not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("GET /api/employees/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to load employee." },
      { status: 500 }
    );
  }
}

// update one employee
export async function PUT(req: NextRequest, { params }: Params) {
  const client = await pool.connect();

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
        { status: 400 }
      );
    }

    await client.query("BEGIN");

    // lock ONLY employee row
    const employeeResult = await client.query(
      `
      SELECT employeeid, hotelid
      FROM ehotels.employee
      WHERE employeeid = $1
      FOR UPDATE;
      `,
      [id]
    );

    if (employeeResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "Employee not found." },
        { status: 404 }
      );
    }

    // get role separately
    const roleResult = await client.query(
      `
      SELECT role_name
      FROM ehotels.employee_role
      WHERE employeeid = $1;
      `,
      [id]
    );

    const currentEmployee = employeeResult.rows[0];
    const oldHotelID = Number(currentEmployee.hotelid);
    const newHotelID = Number(hotelID);
    const oldRoleName = roleResult.rows[0]?.role_name ?? null;

    // Rule: if this employee is currently the only manager of the old hotel, they cannot be changed to a non-manager role or moved to another hotel
    const removingManagerFromOldHotel =
      oldRoleName === "Manager" &&
      (roleName !== "Manager" || oldHotelID !== newHotelID);

    if (removingManagerFromOldHotel) {
      const remainingManagersResult = await client.query(
        `
        SELECT COUNT(*)::int AS count
        FROM ehotels.employee_role er
        JOIN ehotels.employee e
          ON er.employeeid = e.employeeid
        WHERE e.hotelid = $1
          AND er.role_name = 'Manager'
          AND e.employeeid <> $2;
        `,
        [oldHotelID, id]
      );

      const remainingManagers = remainingManagersResult.rows[0].count;

      if (remainingManagers === 0) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          {
            error:
              "This change is not allowed because that hotel must have at least one manager.",
          },
          { status: 400 }
        );
      }
    }

    // Update employee info
    const employeeUpdateResult = await client.query(
      `
      UPDATE ehotels.employee
      SET
        first_name = $1,
        last_name = $2,
        street = $3,
        city = $4,
        province = $5,
        postal_code = $6,
        ssn_sin = $7,
        hotelid = $8
      WHERE employeeid = $9
      RETURNING employeeid AS "employeeID";
      `,
      [
        firstName,
        lastName,
        street,
        city,
        province,
        postalCode,
        ssnSin,
        newHotelID,
        id,
      ]
    );

    if (employeeUpdateResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "Employee not found." },
        { status: 404 }
      );
    }

    // Update role in employee_role
    // This assumes one role row per employee, can be changed later if needed
    const roleExistsResult = await client.query(
      `
      SELECT employeeid
      FROM ehotels.employee_role
      WHERE employeeid = $1;
      `,
      [id]
    );

    if (roleExistsResult.rows.length === 0) {
      await client.query(
        `
        INSERT INTO ehotels.employee_role (employeeid, role_name)
        VALUES ($1, $2);
        `,
        [id, roleName]
      );
    } else {
      await client.query(
        `
        UPDATE ehotels.employee_role
        SET role_name = $1
        WHERE employeeid = $2;
        `,
        [roleName, id]
      );
    }

    await client.query("COMMIT");

    return NextResponse.json({
      message: "Employee updated successfully.",
      employeeID: employeeUpdateResult.rows[0].employeeID,
    });
  } catch (error:any) {
    await client.query("ROLLBACK");
    console.error("PUT /api/employees/[id] error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to update employee." },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

// delete one employee
export async function DELETE(req: NextRequest, { params }: Params) {
  const client = await pool.connect();

  try {
    const { id } = await params;

    await client.query("BEGIN");

    // lock ONLY employee row
    const employeeResult = await client.query(
      `
      SELECT employeeid, hotelid
      FROM ehotels.employee
      WHERE employeeid = $1
      FOR UPDATE;
      `,
      [id]
    );

    if (employeeResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "Employee not found." },
        { status: 404 }
      );
    }

    // get role separately
    const roleResult = await client.query(
      `
      SELECT role_name
      FROM ehotels.employee_role
      WHERE employeeid = $1;
      `,
      [id]
    );

    const employee = employeeResult.rows[0];
    const hotelID = Number(employee.hotelid);
    const roleName = roleResult.rows[0]?.role_name ?? null;

    // If deleting a manager, make sure another manager remains at that hotel!! ikf not, cannot delete
    if (roleName === "Manager") {
      const remainingManagersResult = await client.query(
        `
        SELECT COUNT(*)::int AS count
        FROM ehotels.employee_role er
        JOIN ehotels.employee e
          ON er.employeeid = e.employeeid
        WHERE e.hotelid = $1
          AND er.role_name = 'Manager'
          AND e.employeeid <> $2;
        `,
        [hotelID, id]
      );

      const remainingManagers = remainingManagersResult.rows[0].count;

      if (remainingManagers === 0) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          {
            error:
              "This employee cannot be deleted because that hotel must have at least one manager.",
          },
          { status: 400 }
        );
      }
    }

    // delete role row first, then employee row
    await client.query(
      `
      DELETE FROM ehotels.employee_role
      WHERE employeeid = $1;
      `,
      [id]
    );

    const deleteResult = await client.query(
      `
      DELETE FROM ehotels.employee
      WHERE employeeid = $1
      RETURNING employeeid AS "employeeID";
      `,
      [id]
    );

    await client.query("COMMIT");

    return NextResponse.json({
      message: "Employee deleted successfully.",
      employeeID: deleteResult.rows[0].employeeID,
    });
  } catch (error:any) {
    await client.query("ROLLBACK");
    console.error("DELETE /api/employees/[id] error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to delete employee." },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}