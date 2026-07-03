import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, tokenIsValid } from "@/lib/auth";
import { computeStandings } from "@/lib/standings";
import { readTournament, updateTournament } from "@/lib/store";
import type { Tournament } from "@/lib/types";

export const dynamic = "force-dynamic";

// Kurzer In-Memory-Cache pro Instanz, um Blob-Operationen unter Poll-Last zu begrenzen.
let cache: { payload: Payload; ts: number } | null = null;
const CACHE_MS = 5000;

type Payload = { tournament: Tournament; standings: ReturnType<typeof computeStandings> };

function payloadFor(tournament: Tournament): Payload {
  return { tournament, standings: computeStandings(tournament) };
}

export async function GET() {
  if (cache && Date.now() - cache.ts < CACHE_MS) {
    return NextResponse.json(cache.payload, { headers: { "cache-control": "no-store" } });
  }
  const tournament = await readTournament();
  const payload = payloadFor(tournament);
  cache = { payload, ts: Date.now() };
  return NextResponse.json(payload, { headers: { "cache-control": "no-store" } });
}

function parseScore(value: unknown): number | null {
  if (value === null || value === "" || value === undefined) return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0 || n > 999) throw new Error("Ungültiges Ergebnis");
  return n;
}

export async function POST(req: NextRequest) {
  if (!tokenIsValid(req.cookies.get(AUTH_COOKIE)?.value)) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
  }

  try {
    const tournament = await updateTournament((t) => {
      switch (body.action) {
        case "score": {
          const game = t.games.find((g) => g.id === body.id);
          if (!game || game.type === "break") throw new Error("Spiel nicht gefunden");
          game.scoreA = parseScore(body.scoreA);
          game.scoreB = parseScore(body.scoreB);
          break;
        }
        case "teams": {
          const game = t.games.find((g) => g.id === body.id);
          if (!game || (game.type !== "p1" && game.type !== "p3")) throw new Error("Spiel nicht gefunden");
          if (typeof body.teamA !== "string" || typeof body.teamB !== "string") throw new Error("Ungültige Teams");
          if (body.teamA.length > 60 || body.teamB.length > 60) throw new Error("Ungültige Teams");
          game.teamA = body.teamA;
          game.teamB = body.teamB;
          break;
        }
        case "settings": {
          const win = Number(body.pointsWin);
          const draw = Number(body.pointsDraw);
          if (!Number.isInteger(win) || !Number.isInteger(draw) || win < 0 || win > 10 || draw < 0 || draw > 10) {
            throw new Error("Ungültige Punktwerte");
          }
          t.settings.pointsWin = win;
          t.settings.pointsDraw = draw;
          break;
        }
        default:
          throw new Error("Unbekannte Aktion");
      }
    });
    const payload = payloadFor(tournament);
    cache = { payload, ts: Date.now() };
    return NextResponse.json(payload);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Speichern fehlgeschlagen";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
