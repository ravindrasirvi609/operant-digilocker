import Excel from "exceljs";
import { DigiLockerAPI } from "../digilocker/api";

export interface UserData {
  name: string;
  conferenceId: string;
  email: string;
  digiLockerId: string;
  date: Date;
}

export class ExcelProcessor {
  static async processExcelFile(file: File): Promise<UserData[]> {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = new Excel.Workbook();
    await workbook.xlsx.load(arrayBuffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new Error("Excel file has no worksheets");
    }

    const users: UserData[] = [];

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
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
        try {
          date = new Date(dateValue.toString());
        } catch (e) {
          return; // Skip if date is invalid
        }
      }

      users.push({
        name,
        conferenceId,
        email,
        digiLockerId,
        date,
      });
    });

    return users;
  }

  static async issueCertificates(
    users: UserData[]
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const user of users) {
      try {
        await DigiLockerAPI.issueCertificate({
          name: user.name,
          digiLockerId: user.digiLockerId,
          conferenceId: user.conferenceId,
          date: user.date,
        });
        success++;
      } catch (error) {
        console.error(`Failed to issue certificate for ${user.name}:`, error);
        failed++;
      }
    }

    return { success, failed };
  }
}
