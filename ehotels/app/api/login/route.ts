import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json();

    if (role === "customer") {
      const res = await db.query(
        "SELECT * FROM ehotels.Customer WHERE email = $1",
        [email],
      );

      if (res.rows.length > 0) {
        const user = res.rows[0];
        return NextResponse.json({
          success: true,
          role: "customer",
          user: {
            id: user.customerid,
            firstName: user.first_name,
            lastName: user.last_name,
            idValue: user.id_value,
          },
        });
      }
    }

    if (role === "employee") {
      const res = await db.query(
        "SELECT * FROM ehotels.Employee WHERE email = $1",
        [email],
      );

      if (res.rows.length > 0) {
        const user = res.rows[0];
        return NextResponse.json({
          success: true,
          role: "employee",
          user: {
            id: user.employeeid,
            firstName: user.first_name,
            lastName: user.last_name,
            hotelId: user.hotelid,
          },
        });
      }
    }

    // If neither block returned, credentials were wrong
    return NextResponse.json(
      { error: "Invalid ID or Role. Please check your credentials." },
      { status: 401 },
    );
  } catch (error) {
    console.error("Database Login Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error. Is the database running?" },
      { status: 500 },
    );
  }
}
