import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { password } = await request.json();
  const appPassword = process.env.APP_PASSWORD;

  if (!appPassword) {
    return NextResponse.json({ error: "APP_PASSWORD is not configured." }, { status: 500 });
  }

  if (password !== appPassword) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
