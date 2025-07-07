import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Certificate from "@/models/Certificate";

function parseDDMMYYYY(dateStr: string): Date | null {
  if (!dateStr) return null;
  const [day, month, year] = dateStr.split("/");
  if (!day || !month || !year) return null;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

export async function POST(req: NextRequest) {
  await dbConnect();
  const data = await req.json();
  console.log("DATAAAAA", data);
  // Accepts single or array
  const certs = (Array.isArray(data) ? data : [data]).map((cert) => ({
    ...cert,
    conferenceDate: parseDDMMYYYY(cert.conferenceDate),
  }));
  console.log("CERTS", certs);
  try {
    const created = await Certificate.insertMany(certs, { ordered: false });
    console.log("CREATED", created);
    return NextResponse.json(created);
  } catch (error) {
    console.error("Insert error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}

export async function GET() {
  await dbConnect();
  const certs = await Certificate.find({});
  return NextResponse.json(certs);
}
