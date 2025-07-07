import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  // Hardcoded admin credentials for demo
  if (username === "admin" && password === "password123") {
    // In production, use a real JWT
    return NextResponse.json({ token: "dummy-jwt-token" });
  }
  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}
