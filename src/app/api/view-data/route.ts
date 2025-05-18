import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import User from "@/lib/db/models/user";

export async function GET() {
  try {
    // Connect to database
    await connectToDatabase();

    // Fetch all users
    const users = await User.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch users",
      },
      { status: 500 }
    );
  }
}
