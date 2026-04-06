import { NextResponse } from "next/server";
import pool from "@/lib/db";

//get all rentings

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT *
      FROM ehotels.renting
      ORDER BY rentingID;
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("GET RENTINGS ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}