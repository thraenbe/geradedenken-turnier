import type { Game, Settings, StandingRow, Tournament } from "./types";

function emptyRow(team: string): StandingRow {
  return { team, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, diff: 0, points: 0 };
}

function applyGame(rows: Map<string, StandingRow>, game: Game, settings: Settings) {
  if (game.scoreA === null || game.scoreB === null) return;
  const a = rows.get(game.teamA);
  const b = rows.get(game.teamB);
  if (!a || !b) return;
  a.played++; b.played++;
  a.goalsFor += game.scoreA; a.goalsAgainst += game.scoreB;
  b.goalsFor += game.scoreB; b.goalsAgainst += game.scoreA;
  if (game.scoreA > game.scoreB) {
    a.won++; b.lost++;
    a.points += settings.pointsWin;
  } else if (game.scoreA < game.scoreB) {
    b.won++; a.lost++;
    b.points += settings.pointsWin;
  } else {
    a.drawn++; b.drawn++;
    a.points += settings.pointsDraw;
    b.points += settings.pointsDraw;
  }
  a.diff = a.goalsFor - a.goalsAgainst;
  b.diff = b.goalsFor - b.goalsAgainst;
}

/** Tabelle aus den Rundenspielen: Punkte → Tordifferenz → erzielte Tore → Name. */
export function computeStandings(tournament: Tournament): StandingRow[] {
  const rows = new Map<string, StandingRow>(tournament.teams.map((t) => [t, emptyRow(t)]));
  for (const game of tournament.games) {
    if (game.type !== "rr") continue;
    applyGame(rows, game, tournament.settings);
  }
  return [...rows.values()].sort(
    (a, b) =>
      b.points - a.points ||
      b.diff - a.diff ||
      b.goalsFor - a.goalsFor ||
      a.team.localeCompare(b.team, "de")
  );
}
