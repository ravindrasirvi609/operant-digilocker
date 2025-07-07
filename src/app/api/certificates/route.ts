import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Certificate from "@/models/Certificate";

export async function POST(req: NextRequest) {
  await dbConnect();
  const data = await req.json();
  // Accepts single or array
  const certs = Array.isArray(data) ? data : [data];
  try {
    const created = await Certificate.insertMany(certs, { ordered: false });
    return NextResponse.json(created);
  } catch (error) {
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
