import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, expectedToken, pinMatches, tokenIsValid } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return NextResponse.json({ authed: tokenIsValid(req.cookies.get(AUTH_COOKIE)?.value) });
}

export async function POST(req: NextRequest) {
  let pin = "";
  try {
    const body = await req.json();
    pin = String(body.pin ?? "");
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
  }
  if (!pinMatches(pin)) {
    return NextResponse.json({ error: "Falsche PIN" }, { status: 401 });
  }
  const res = NextResponse.json({ authed: true });
  res.cookies.set(AUTH_COOKIE, expectedToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 5,
    path: "/",
  });
  return res;
}
