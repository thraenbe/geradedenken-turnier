"use client";

import { useCallback, useEffect, useState } from "react";
import type { Game, StandingRow, Tournament } from "@/lib/types";

interface Payload {
  tournament: Tournament;
  standings: StandingRow[];
}

type SaveState = "idle" | "saving" | "saved" | "error";

const TYPE_LABEL: Record<string, string | undefined> = {
  youth: "Jugendspiel",
  p3: "Spiel um Platz 3",
  p1: "Finale",
};

function PinGate({ onSuccess }: { onSuccess: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    setBusy(false);
    if (res.ok) onSuccess();
    else setError("Falsche PIN – bitte erneut versuchen.");
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-xs rounded-2xl bg-white p-6 text-center shadow-lg ring-1 ring-slate-200">
        <div className="text-3xl">🔒</div>
        <h1 className="mt-2 text-lg font-bold text-pool-900">Ergebnisse eintragen</h1>
        <p className="mt-1 text-sm text-slate-500">Bitte PIN eingeben</p>
        <input
          type="password"
          inputMode="numeric"
          autoFocus
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="mt-4 w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-2xl tracking-[0.4em] outline-none focus:border-pool-500 focus:ring-2 focus:ring-pool-200"
        />
        {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={busy || pin.length === 0}
          className="mt-4 w-full rounded-xl bg-pool-700 px-4 py-3 font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
        >
          {busy ? "Prüfe …" : "Anmelden"}
        </button>
      </form>
    </div>
  );
}

function ScoreInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <input
      aria-label={label}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
      placeholder="–"
      className="h-12 w-14 rounded-xl border border-slate-300 bg-white text-center text-xl font-semibold tabular-nums outline-none focus:border-pool-500 focus:ring-2 focus:ring-pool-200"
    />
  );
}

function GameEditor({
  game,
  teams,
  onSaved,
}: {
  game: Game;
  teams: string[];
  onSaved: (p: Payload) => void;
}) {
  const [scoreA, setScoreA] = useState(game.scoreA === null ? "" : String(game.scoreA));
  const [scoreB, setScoreB] = useState(game.scoreB === null ? "" : String(game.scoreB));
  const [teamA, setTeamA] = useState(game.teamA);
  const [teamB, setTeamB] = useState(game.teamB);
  const [time, setTime] = useState(game.time);
  const [state, setState] = useState<SaveState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const isPlacement = game.type === "p1" || game.type === "p3";
  const dirty =
    scoreA !== (game.scoreA === null ? "" : String(game.scoreA)) ||
    scoreB !== (game.scoreB === null ? "" : String(game.scoreB)) ||
    time !== game.time ||
    (isPlacement && (teamA !== game.teamA || teamB !== game.teamB));

  async function save() {
    setState("saving");
    setMessage(null);
    try {
      if (time !== game.time) {
        const res = await fetch("/api/tournament", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ action: "time", id: game.id, time }),
        });
        if (!res.ok) throw new Error((await res.json()).error);
      }
      if (isPlacement && (teamA !== game.teamA || teamB !== game.teamB)) {
        const res = await fetch("/api/tournament", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ action: "teams", id: game.id, teamA, teamB }),
        });
        if (!res.ok) throw new Error((await res.json()).error);
      }
      const res = await fetch("/api/tournament", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: "score",
          id: game.id,
          scoreA: scoreA === "" ? null : Number(scoreA),
          scoreB: scoreB === "" ? null : Number(scoreB),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const payload: Payload = await res.json();
      setState("saved");
      onSaved(payload);
      setTimeout(() => setState("idle"), 2000);
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error && err.message ? err.message : "Speichern fehlgeschlagen");
    }
  }

  const label = TYPE_LABEL[game.type];

  return (
    <li className="px-4 py-3">
      <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
        <input
          aria-label="Uhrzeit"
          type="time"
          value={time}
          onChange={(e) => e.target.value && setTime(e.target.value)}
          className="h-8 rounded-lg border border-slate-200 bg-white px-1.5 text-sm font-semibold text-pool-700 outline-none focus:border-pool-500"
        />
        {label && <span className="rounded-full bg-pool-100 px-2 py-0.5 font-semibold text-pool-800">{label}</span>}
        {game.ref && <span className="truncate">Schiri: {game.ref}</span>}
      </div>
      <div className="mt-2 space-y-2">
        {[
          { team: teamA, setTeam: setTeamA, score: scoreA, setScore: setScoreA, key: "A" },
          { team: teamB, setTeam: setTeamB, score: scoreB, setScore: setScoreB, key: "B" },
        ].map(({ team, setTeam, score, setScore, key }) => (
          <div key={key} className="flex items-center gap-2">
            {isPlacement ? (
              <select
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className="h-12 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-2 text-sm outline-none focus:border-pool-500"
              >
                <option value={team}>{team}</option>
                {teams
                  .filter((t) => t !== team)
                  .map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
              </select>
            ) : (
              <span className="min-w-0 flex-1 truncate font-medium">{team}</span>
            )}
            <ScoreInput value={score} onChange={setScore} label={`Tore ${team}`} />
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-end gap-3">
        {state === "saved" && <span className="text-sm font-medium text-emerald-600">Gespeichert ✓</span>}
        {state === "error" && <span className="text-sm text-rose-600">{message}</span>}
        <button
          onClick={save}
          disabled={!dirty || state === "saving"}
          className="rounded-xl bg-pool-700 px-4 py-2 text-sm font-semibold text-white transition active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400"
        >
          {state === "saving" ? "Speichert …" : "Speichern"}
        </button>
      </div>
    </li>
  );
}

function SettingsEditor({ tournament, onSaved }: { tournament: Tournament; onSaved: (p: Payload) => void }) {
  const [win, setWin] = useState(String(tournament.settings.pointsWin));
  const [draw, setDraw] = useState(String(tournament.settings.pointsDraw));
  const [state, setState] = useState<SaveState>("idle");

  async function save() {
    setState("saving");
    const res = await fetch("/api/tournament", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "settings", pointsWin: Number(win), pointsDraw: Number(draw) }),
    });
    if (res.ok) {
      onSaved(await res.json());
      setState("saved");
      setTimeout(() => setState("idle"), 2000);
    } else {
      setState("error");
    }
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/60">
      <h3 className="font-semibold text-pool-900">Wertung</h3>
      <div className="mt-3 flex flex-wrap items-end gap-4">
        <label className="text-sm text-slate-600">
          Punkte pro Sieg
          <input
            type="text"
            inputMode="numeric"
            value={win}
            onChange={(e) => setWin(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))}
            className="mt-1 block h-11 w-20 rounded-xl border border-slate-300 text-center text-lg font-semibold outline-none focus:border-pool-500"
          />
        </label>
        <label className="text-sm text-slate-600">
          Punkte pro Unentschieden
          <input
            type="text"
            inputMode="numeric"
            value={draw}
            onChange={(e) => setDraw(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))}
            className="mt-1 block h-11 w-20 rounded-xl border border-slate-300 text-center text-lg font-semibold outline-none focus:border-pool-500"
          />
        </label>
        <button
          onClick={save}
          disabled={state === "saving"}
          className="h-11 rounded-xl bg-pool-700 px-4 text-sm font-semibold text-white disabled:opacity-50"
        >
          {state === "saving" ? "Speichert …" : state === "saved" ? "Gespeichert ✓" : "Speichern"}
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-400">Turnierwertung: 3 Punkte Sieg, 1 Punkt Unentschieden.</p>
    </div>
  );
}

export default function EditPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [data, setData] = useState<Payload | null>(null);
  const [dashboardUrl, setDashboardUrl] = useState("/");

  const load = useCallback(async () => {
    const res = await fetch("/api/tournament", { cache: "no-store" });
    if (res.ok) setData(await res.json());
  }, []);

  useEffect(() => {
    fetch("/api/login")
      .then((r) => r.json())
      .then((j) => setAuthed(Boolean(j.authed)))
      .catch(() => setAuthed(false));
    const host = window.location.host;
    if (host.startsWith("edit.")) {
      setDashboardUrl(`${window.location.protocol}//${host.slice(5)}`);
    }
  }, []);

  useEffect(() => {
    if (authed) load();
  }, [authed, load]);

  if (authed === null) {
    return <div className="mt-20 text-center text-slate-400">Lade …</div>;
  }
  if (!authed) {
    return <PinGate onSuccess={() => setAuthed(true)} />;
  }

  return (
    <main className="mx-auto max-w-3xl px-3 pb-16 sm:px-6">
      <header className="-mx-3 bg-gradient-to-br from-pool-900 via-pool-700 to-pool-500 px-5 pb-6 pt-6 text-white sm:-mx-6 sm:rounded-b-3xl sm:px-8">
        <h1 className="text-xl font-bold sm:text-2xl">Ergebnisse eintragen</h1>
        <p className="mt-1 text-sm text-pool-100">{data?.tournament.settings.title ?? ""}</p>
        <div className="mt-3 flex gap-2">
          <a href={dashboardUrl} className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur hover:bg-white/25">
            → Zum Dashboard
          </a>
          <button onClick={load} className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur hover:bg-white/25">
            ↻ Neu laden
          </button>
        </div>
      </header>

      {!data ? (
        <div className="mt-10 text-center text-slate-400">Lade Turnierdaten …</div>
      ) : (
        <>
          {data.tournament.settings.days.map((day) => (
            <section key={day.day} className="mt-6">
              <h2 className="mb-2 px-1 text-lg font-bold text-pool-900">
                {day.label}, {day.date}
              </h2>
              <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60">
                <ul className="divide-y divide-slate-100">
                  {data.tournament.games
                    .filter((g) => g.day === day.day && g.type !== "break")
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((game) => (
                      <GameEditor key={`${game.id}-${game.scoreA}-${game.scoreB}-${game.teamA}-${game.teamB}-${game.time}`} game={game} teams={data.tournament.teams} onSaved={setData} />
                    ))}
                </ul>
              </div>
            </section>
          ))}
          <section className="mt-6">
            <SettingsEditor tournament={data.tournament} onSaved={setData} />
          </section>
        </>
      )}
    </main>
  );
}
