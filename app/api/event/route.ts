import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "ok", where: "/api/event", method: "GET" });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({ status: "ok", where: "/api/event", method: "POST", body });
  } catch {
    return NextResponse.json({ status: "err", message: "Invalid JSON" }, { status: 400 });
  }
}
