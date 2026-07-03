import { head, put } from "@vercel/blob";
import { promises as fs } from "node:fs";
import path from "node:path";
import { seedTournament } from "./seed";
import type { Tournament } from "./types";

const BLOB_PATH = "data/tournament.json";
const LOCAL_PATH = path.join(process.cwd(), ".data", "tournament.json");

const useBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

interface ReadResult {
  tournament: Tournament;
  etag: string | null;
}

function isNotFound(err: unknown): boolean {
  return err instanceof Error && err.name.includes("NotFound");
}

function isPreconditionFailed(err: unknown): boolean {
  return err instanceof Error && (err.name.includes("Precondition") || err.message.includes("precondition"));
}

async function readLocal(): Promise<ReadResult> {
  try {
    const raw = await fs.readFile(LOCAL_PATH, "utf8");
    return { tournament: JSON.parse(raw), etag: null };
  } catch {
    const tournament = seedTournament();
    await writeLocal(tournament);
    return { tournament, etag: null };
  }
}

async function writeLocal(tournament: Tournament): Promise<void> {
  await fs.mkdir(path.dirname(LOCAL_PATH), { recursive: true });
  await fs.writeFile(LOCAL_PATH, JSON.stringify(tournament, null, 2), "utf8");
}

async function writeBlob(tournament: Tournament, etag: string | null): Promise<void> {
  await put(BLOB_PATH, JSON.stringify(tournament), {
    access: "public",
    allowOverwrite: true,
    contentType: "application/json",
    ...(etag ? { ifMatch: etag } : {}),
  });
}

async function readBlob(): Promise<ReadResult> {
  let meta;
  try {
    meta = await head(BLOB_PATH);
  } catch (err) {
    if (!isNotFound(err)) throw err;
    const tournament = seedTournament();
    try {
      await writeBlob(tournament, null);
    } catch {
      // Ein paralleler Aufruf war schneller – dessen Stand gilt.
      meta = await head(BLOB_PATH);
    }
    if (!meta) return { tournament, etag: null };
  }
  // ETag als Query-Parameter umgeht den CDN-Cache für überschriebene Blobs.
  const etag = (meta as { etag?: string }).etag ?? String(meta.uploadedAt?.getTime() ?? "");
  const res = await fetch(`${meta.url}?v=${encodeURIComponent(etag)}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Blob-Lesefehler: ${res.status}`);
  return { tournament: (await res.json()) as Tournament, etag };
}

export async function readTournament(): Promise<Tournament> {
  const { tournament } = useBlob() ? await readBlob() : await readLocal();
  return tournament;
}

/**
 * Read-modify-write mit optimistischer Sperre (ifMatch): bei parallelen
 * Schreibzugriffen wird neu gelesen und der Mutator erneut angewandt.
 */
export async function updateTournament(mutate: (t: Tournament) => void): Promise<Tournament> {
  if (!useBlob()) {
    const { tournament } = await readLocal();
    mutate(tournament);
    tournament.updatedAt = new Date().toISOString();
    await writeLocal(tournament);
    return tournament;
  }
  let lastError: unknown;
  for (let attempt = 0; attempt < 4; attempt++) {
    const { tournament, etag } = await readBlob();
    mutate(tournament);
    tournament.updatedAt = new Date().toISOString();
    try {
      await writeBlob(tournament, etag);
      return tournament;
    } catch (err) {
      if (!isPreconditionFailed(err)) throw err;
      lastError = err;
      await new Promise((r) => setTimeout(r, 150 * (attempt + 1)));
    }
  }
  throw lastError ?? new Error("Speichern fehlgeschlagen");
}
