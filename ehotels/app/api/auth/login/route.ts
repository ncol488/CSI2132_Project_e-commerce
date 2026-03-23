import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { email, password, role } = await request.json();
  if (
    role === "customer" &&
    email === "customer@test.com" &&
    password === "test"
  ) {
    return NextResponse.json({ success: true, role: "customer" });
  }

  if (
    role === "employee" &&
    email === "employee@test.com" &&
    password === "test"
  ) {
    return NextResponse.json({ success: true, role: "employee" });
  }

  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}
