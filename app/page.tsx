"use client";

import { useCallback, useEffect, useState } from "react";
import type { Game, StandingRow, Tournament } from "@/lib/types";

interface Payload {
  tournament: Tournament;
  standings: StandingRow[];
}

const TYPE_BADGE: Record<string, { label: string; className: string } | undefined> = {
  youth: { label: "Jugendspiel", className: "bg-emerald-100 text-emerald-800" },
  p3: { label: "Spiel um Platz 3", className: "bg-orange-100 text-orange-800" },
  p1: { label: "Finale – Spiel um Platz 1", className: "bg-amber-100 text-amber-900" },
};

function played(game: Game): boolean {
  return game.scoreA !== null && game.scoreB !== null;
}

function TeamLine({ name, score, winner, isPlayed }: { name: string; score: number | null; winner: boolean; isPlayed: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className={`truncate ${winner ? "font-semibold" : ""}`}>{name}</span>
      <span
        className={`w-8 shrink-0 text-right text-lg tabular-nums ${
          isPlayed ? (winner ? "font-bold text-pool-800" : "font-medium text-slate-600") : "text-slate-300"
        }`}
      >
        {score ?? "–"}
      </span>
    </div>
  );
}

function GameRow({ game }: { game: Game }) {
  if (game.type === "break") {
    return (
      <li className="flex items-center gap-3 px-4 py-2 text-sm text-slate-400">
        <span className="w-12 shrink-0 tabular-nums">{game.time}</span>
        <span className="flex-1 border-t border-dashed border-slate-200" />
        <span>Pause</span>
        <span className="flex-1 border-t border-dashed border-slate-200" />
      </li>
    );
  }
  const badge = TYPE_BADGE[game.type];
  const isPlayed = played(game);
  const aWins = isPlayed && (game.scoreA as number) > (game.scoreB as number);
  const bWins = isPlayed && (game.scoreB as number) > (game.scoreA as number);
  return (
    <li className="px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="w-12 shrink-0 pt-0.5">
          <div className="text-sm font-semibold tabular-nums text-pool-700">{game.time}</div>
        </div>
        <div className="min-w-0 flex-1">
          {badge && (
            <span className={`mb-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge.className}`}>
              {badge.label}
            </span>
          )}
          {game.type === "youth" && game.teamA === "Jugendspiel" ? (
            <div className="text-slate-600">Jugendspiel</div>
          ) : (
            <>
              <TeamLine name={game.teamA} score={game.scoreA} winner={aWins} isPlayed={isPlayed} />
              <TeamLine name={game.teamB} score={game.scoreB} winner={bWins} isPlayed={isPlayed} />
            </>
          )}
          {game.ref && <div className="mt-1 text-xs text-slate-400">Schiri: {game.ref}</div>}
        </div>
      </div>
    </li>
  );
}

function StandingsTable({ standings }: { standings: StandingRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="py-2 pl-4 pr-2 text-right">#</th>
            <th className="px-2 py-2">Team</th>
            <th className="px-2 py-2 text-center">Sp</th>
            <th className="hidden px-2 py-2 text-center sm:table-cell">S</th>
            <th className="hidden px-2 py-2 text-center sm:table-cell">U</th>
            <th className="hidden px-2 py-2 text-center sm:table-cell">N</th>
            <th className="hidden px-2 py-2 text-center sm:table-cell">Tore</th>
            <th className="px-2 py-2 text-center">+/−</th>
            <th className="py-2 pl-2 pr-4 text-center">Pkt</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row, i) => (
            <tr
              key={row.team}
              className={`border-b border-slate-100 last:border-0 ${
                i < 2 ? "bg-amber-50/70" : i < 4 ? "bg-orange-50/50" : ""
              }`}
            >
              <td className="py-2.5 pl-4 pr-2 text-right tabular-nums text-slate-400">{i + 1}</td>
              <td className="max-w-[45vw] truncate px-2 py-2.5 font-medium sm:max-w-none">{row.team}</td>
              <td className="px-2 py-2.5 text-center tabular-nums">{row.played}</td>
              <td className="hidden px-2 py-2.5 text-center tabular-nums sm:table-cell">{row.won}</td>
              <td className="hidden px-2 py-2.5 text-center tabular-nums sm:table-cell">{row.drawn}</td>
              <td className="hidden px-2 py-2.5 text-center tabular-nums sm:table-cell">{row.lost}</td>
              <td className="hidden px-2 py-2.5 text-center tabular-nums sm:table-cell">
                {row.goalsFor}:{row.goalsAgainst}
              </td>
              <td className={`px-2 py-2.5 text-center tabular-nums ${row.diff > 0 ? "text-emerald-700" : row.diff < 0 ? "text-rose-600" : "text-slate-500"}`}>
                {row.diff > 0 ? `+${row.diff}` : row.diff}
              </td>
              <td className="py-2.5 pl-2 pr-4 text-center text-base font-bold tabular-nums text-pool-800">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-slate-100 px-4 py-2 text-xs text-slate-400">
        Platz 1–2 → Spiel um Platz 1 · Platz 3–4 → Spiel um Platz 3 · Wertung: Punkte, Tordifferenz, Tore
      </p>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string>("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/tournament", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
      setError(null);
      setUpdatedAt(new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    } catch {
      setError("Daten konnten nicht geladen werden.");
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30_000);
    const onVisible = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [load]);

  const finale = data?.tournament.games.find((g) => g.type === "p1");
  const champion =
    finale && played(finale)
      ? (finale.scoreA as number) > (finale.scoreB as number)
        ? finale.teamA
        : (finale.scoreB as number) > (finale.scoreA as number)
          ? finale.teamB
          : null
      : null;

  return (
    <main className="mx-auto max-w-5xl px-3 pb-16 sm:px-6">
      <header className="-mx-3 bg-gradient-to-br from-pool-900 via-pool-700 to-pool-500 px-5 pb-8 pt-8 text-white sm:-mx-6 sm:rounded-b-3xl sm:px-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{data?.tournament.settings.title ?? "Tübinger Kanupoloturnier 2026"}</h1>
        <p className="mt-1 text-sm text-pool-100">4.–5. Juli 2026 · Tübingen · Neckar</p>
        <div className="mt-3 flex items-center gap-2 text-xs text-pool-200">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Live-Ergebnisse{updatedAt && ` · Stand ${updatedAt} Uhr`}
        </div>
      </header>

      {error && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      {champion && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 px-5 py-4 text-center shadow-sm">
          <div className="text-3xl">🏆</div>
          <div className="mt-1 text-sm font-medium uppercase tracking-wide text-amber-700">Turniersieger</div>
          <div className="text-xl font-bold text-amber-900">{champion}</div>
        </div>
      )}

      {!data && !error && (
        <div className="mt-10 text-center text-slate-400">Lade Turnierdaten …</div>
      )}

      {data && (
        <>
          <section className="mt-6">
            <h2 className="mb-2 px-1 text-lg font-bold text-pool-900">Tabelle</h2>
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60">
              <StandingsTable standings={data.standings} />
            </div>
          </section>

          <section className="mt-8">
            <h2 className="mb-2 px-1 text-lg font-bold text-pool-900">Spielplan</h2>
            <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
              {data.tournament.settings.days.map((day) => (
                <div key={day.day} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60">
                  <div className="border-b border-slate-100 bg-pool-800 px-4 py-2.5 text-sm font-semibold text-white">
                    {day.label}, {day.date}
                  </div>
                  <ul className="divide-y divide-slate-100">
                    {data.tournament.games
                      .filter((g) => g.day === day.day)
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .map((game) => (
                        <GameRow key={game.id} game={game} />
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      <footer className="mt-10 text-center text-xs text-slate-400">
        Aktualisiert sich automatisch alle 30 Sekunden
      </footer>
    </main>
  );
}
