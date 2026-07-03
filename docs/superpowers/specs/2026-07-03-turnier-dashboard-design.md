# Turnier-Dashboard geradedenken.com — Design

Datum: 2026-07-03 · Anlass: Tübinger Kanupoloturnier, 4.–5. Juli 2026

## Ziel

Live-Dashboard für Spieler und Zuschauer (Spielplan + Tabelle) unter
`geradedenken.com`, plus geschützte Ergebniseingabe unter
`edit.geradedenken.com`. Mobile-first, da Nutzung primär am Beckenrand
per Smartphone.

## Datenquelle

`Turnierplan_Tübingen_2026_V1.5.pdf`: 7 Teams, einfache Runde (21 Spiele),
zwei Jugendspiele (außer Wertung), Spiel um Platz 3 und Platz 1 am Sonntag.
Wertung nach Kanupolo-Standard: Sieg 2 Punkte, Unentschieden 1 Punkt
(im Edit-Bereich änderbar). Tabellen-Reihenfolge: Punkte → Tordifferenz →
erzielte Tore → Name.

## Architektur

Eine Next.js-15-App (App Router, TypeScript, Tailwind 4) auf Vercel:

- `/` — öffentliches Dashboard: Tabelle + Spielplan, Polling alle 30 s.
- `/edit` — Ergebniseingabe, PIN-geschützt (Cookie nach Login).
- `middleware.ts` — Host `edit.*` schreibt `/` auf `/edit` um.
- `GET/POST /api/tournament` — Daten lesen / Ergebnis, Teams (Platzierungs­spiele), Wertung schreiben.
- `GET/POST /api/login` — PIN-Prüfung, setzt HttpOnly-Cookie (SHA-256-Token).

## Persistenz

Ein JSON-Dokument (`data/tournament.json`) in **Vercel Blob** (public store):

- Lesen: `head()` liefert frische Metadaten; Fetch mit `?v=<etag>` umgeht
  den CDN-Cache überschriebener Blobs.
- Schreiben: `put(..., { allowOverwrite, ifMatch: etag })` — optimistische
  Sperre; bei Konflikt Retry mit erneutem Lesen (max. 4 Versuche). Damit
  können mehrere Personen gleichzeitig Ergebnisse eintragen, ohne sich
  gegenseitig zu überschreiben.
- Ohne `BLOB_READ_WRITE_TOKEN` (lokale Entwicklung): Datei `.data/tournament.json`.
- Erststart: Seed aus `lib/seed.ts` (kompletter Spielplan aus dem PDF).
- API-GET cached in-memory 5 s pro Instanz, um Blob-Operationen unter
  Polling-Last zu begrenzen.

## Betrachtete Alternativen

- **Edge Config**: knappe 8-KB-Grenze im Hobby-Plan, Schreiben nur über
  Vercel-API-Token (breiter Scope) — verworfen.
- **GitHub-Repo als Datenbank**: Commits je Ergebnis, Cache-/Token-Probleme,
  löst ungewollte Builds aus — verworfen.
- **Postgres/Redis (Marketplace)**: interaktives Provisioning, überdimensioniert
  für ein Wochenende — verworfen.

## Umgebungsvariablen

- `BLOB_READ_WRITE_TOKEN` — vom Blob-Store (Vercel setzt ihn beim Verbinden).
- `EDIT_PIN` — PIN für die Ergebniseingabe.

## Domains

- `geradedenken.com` → Dashboard, `edit.geradedenken.com` → Eingabe.
- DNS zeigt aktuell auf GoDaddy-Parking; Umstellung auf Vercel nötig
  (A-Record Apex, CNAME für `edit`).

## Fehlerbehandlung

- Schreibkonflikte: ifMatch-Retry, sonst Fehlermeldung im UI.
- Ungültige Eingaben: serverseitige Validierung (Ganzzahlen 0–999, bekannte
  Spiel-IDs, Teamauswahl nur bei Platzierungsspielen).
- Dashboard zeigt Fehlerbanner, pollt aber weiter.

## Tests

Manuelle End-to-End-Prüfung lokal (Dateispeicher) und nach Deploy (Blob):
Ergebnis eintragen → Tabelle korrekt, PIN-Gate, Mobile-Ansicht.
