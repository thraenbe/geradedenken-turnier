# Tübinger Kanupoloturnier 2026 — Turnier-Dashboard

Live-Dashboard mit Spielplan und Tabelle für **geradedenken.com**,
Ergebniseingabe unter **edit.geradedenken.com**.

## Funktionen

- 📱 Mobile-first Dashboard: Tabelle (Punkte, Tordifferenz, Tore) und
  Spielplan beider Turniertage, aktualisiert sich alle 30 Sekunden
- ✏️ Ergebniseingabe mit PIN-Schutz (`edit.geradedenken.com` oder `/edit`)
- 🏆 Platzierungsspiele (Platz 1 und Platz 3) mit Teamauswahl,
  Siegerbanner nach dem Finale
- ⚙️ Wertung einstellbar (Standard Kanupolo: Sieg 2 Punkte, Remis 1)

## Entwicklung

```bash
npm install
npm run dev
```

Ohne Blob-Token speichert die App lokal in `.data/tournament.json`.
PIN in Entwicklung: `1234` (bzw. `EDIT_PIN`).

## Deployment (Vercel)

1. Projekt mit diesem Repo verbinden
2. Vercel-Blob-Store anlegen und mit dem Projekt verbinden
   (setzt `BLOB_READ_WRITE_TOKEN`)
3. Env-Variable `EDIT_PIN` setzen
4. Domains `geradedenken.com` und `edit.geradedenken.com` hinzufügen

Details: [docs/superpowers/specs/2026-07-03-turnier-dashboard-design.md](docs/superpowers/specs/2026-07-03-turnier-dashboard-design.md)
