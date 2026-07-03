import { NextRequest, NextResponse } from "next/server";

// edit.geradedenken.com zeigt direkt die Eingabemaske.
export function middleware(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  if (host.startsWith("edit.") && req.nextUrl.pathname === "/") {
    return NextResponse.rewrite(new URL("/edit", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/"] };
