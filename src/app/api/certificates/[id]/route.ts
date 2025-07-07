import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Certificate from "@/models/Certificate";

function getIdFromRequest(req: NextRequest) {
  const url = req.nextUrl;
  const segments = url.pathname.split("/");
  return segments[segments.length - 1];
}

export async function GET(req: NextRequest) {
  await dbConnect();
  const id = getIdFromRequest(req);
  const cert = await Certificate.findOne({ registrationId: id });
  if (!cert) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(cert);
}

export async function PUT(req: NextRequest) {
  await dbConnect();
  const id = getIdFromRequest(req);
  const data = await req.json();
  const cert = await Certificate.findOneAndUpdate(
    { registrationId: id },
    data,
    { new: true }
  );
  if (!cert) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(cert);
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  const id = getIdFromRequest(req);
  const cert = await Certificate.findOneAndDelete({ registrationId: id });
  if (!cert) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
