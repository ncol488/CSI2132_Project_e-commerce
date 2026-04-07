import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json();
    const cookieStore = await cookies();

    // --- CUSTOMER LOGIN ---
    if (role === "customer") {
      const res = await db.query(
        "SELECT * FROM ehotels.customer WHERE email = $1",
        [email],
      );

      if (res.rows.length > 0) {
        const user = res.rows[0];

        // Set Cookies for Proxy (Next.js 16 convention)
        cookieStore.set("session", String(user.customerid), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 60 * 60 * 24, // 1 day
        });
        cookieStore.set("role", "customer", {
          path: "/",
          maxAge: 60 * 60 * 24,
        });

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

    // --- EMPLOYEE LOGIN ---
    if (role === "employee") {
      const res = await db.query(
        "SELECT * FROM ehotels.employee WHERE email = $1",
        [email],
      );

      if (res.rows.length > 0) {
        const user = res.rows[0];

        // Set Cookies for Proxy
        cookieStore.set("session", String(user.employeeid), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 60 * 60 * 24,
        });
        cookieStore.set("role", "employee", {
          path: "/",
          maxAge: 60 * 60 * 24,
        });

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
