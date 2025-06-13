import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import User from "@/lib/db/models/user";
import Excel from "exceljs";

interface ExcelUser {
  name: string;
  certificateNumber: string;
  email: string;
  date: Date;
}

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    // Read the Excel file
    const buffer = await file.arrayBuffer();
    const workbook = new Excel.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      return NextResponse.json(
        { success: false, message: "No worksheet found" },
        { status: 400 }
      );
    }

    const users: ExcelUser[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row

      const user = {
        name: String(row.getCell(1).value),
        certificateNumber: String(row.getCell(2).value),
        email: String(row.getCell(3).value),
        date: new Date(row.getCell(4).value as string),
      };

      if (user.name && user.certificateNumber && user.email && user.date) {
        users.push(user);
      }
    });

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid users found in the Excel file" },
        { status: 400 }
      );
    }

    // Save users to database
    const savedUsers = await User.insertMany(users, { ordered: false });

    return NextResponse.json({
      success: true,
      message: "Certificates uploaded successfully",
      totalUsers: savedUsers.length,
    });
  } catch (error) {
    console.error("Error processing Excel file:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to process file",
      },
      { status: 500 }
    );
  }
}
