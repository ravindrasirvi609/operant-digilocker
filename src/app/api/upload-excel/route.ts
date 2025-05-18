import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import User from "@/lib/db/models/user";
import Excel from "exceljs";
import { generateCertificate } from "@/lib/pdf/certificateGenerator";

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Get form data from the request
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    // Convert the file to buffer
    const arrayBuffer = await file.arrayBuffer();

    // Read Excel file
    const workbook = new Excel.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return NextResponse.json(
        { success: false, message: "Excel file has no worksheets" },
        { status: 400 }
      );
    }

    // Process each row in the worksheet
    const users: Array<any> = [];
    let recordsProcessed = 0;

    worksheet.eachRow({ includeEmpty: false }, async (row, rowNumber) => {
      // Skip header row
      if (rowNumber === 1) return;

      const name = row.getCell(1).value?.toString() || "";
      const conferenceId = row.getCell(2).value?.toString() || "";
      const email = row.getCell(3).value?.toString() || "";
      const digiLockerId = row.getCell(4).value?.toString() || "";
      const dateValue = row.getCell(5).value;

      // Validate required fields
      if (!name || !conferenceId || !email || !digiLockerId || !dateValue) {
        return; // Skip invalid rows
      }

      // Parse the date
      let date: Date;
      if (dateValue instanceof Date) {
        date = dateValue;
      } else {
        // Try to parse the date as string
        try {
          date = new Date(dateValue.toString());
        } catch (e) {
          return; // Skip if date is invalid
        }
      }

      // Create user data object
      const userData = {
        name,
        conferenceId,
        email,
        digiLockerId,
        date,
      };

      users.push(userData);
      recordsProcessed++;
    });

    // Bulk insert users and generate certificates
    if (users.length > 0) {
      for (const userData of users) {
        // Check if user already exists
        const existingUser = await User.findOne({
          conferenceId: userData.conferenceId,
          email: userData.email,
        });

        if (existingUser) {
          // Update existing user
          Object.assign(existingUser, userData);
          await existingUser.save();

          // Generate certificate if not already generated
          if (!existingUser.certificateUri || !existingUser.certificateS3Url) {
            const certificateData = await generateCertificate(existingUser);
            existingUser.certificateUri = certificateData.uri;
            existingUser.certificateS3Url = certificateData.s3Url;
            await existingUser.save();
          }
        } else {
          // Create new user
          const newUser = new User(userData);
          await newUser.save();

          // Generate certificate
          const certificateData = await generateCertificate(newUser);
          newUser.certificateUri = certificateData.uri;
          newUser.certificateS3Url = certificateData.s3Url;
          await newUser.save();
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "File processed successfully",
      recordsProcessed,
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
