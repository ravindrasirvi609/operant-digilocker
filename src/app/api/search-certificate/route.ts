import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import User from "@/lib/db/models/user";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const certificateNumber = searchParams.get("certificateNumber");

    if (!certificateNumber) {
      return NextResponse.json(
        { success: false, message: "Certificate number is required" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find certificate by certificate number
    const certificate = await User.findOne({ certificateNumber }).lean();

    if (!certificate) {
      return NextResponse.json(
        { success: false, message: "Certificate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      certificate,
    });
  } catch (error) {
    console.error("Error searching certificate:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to search certificate",
      },
      { status: 500 }
    );
  }
}
