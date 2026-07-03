export type GameType = "rr" | "youth" | "p3" | "p1" | "break";

export interface Game {
  id: string;
  /** 1 = Samstag, 2 = Sonntag */
  day: 1 | 2;
  /** Anstoßzeit, z. B. "08:30" */
  time: string;
  /** Schiedsrichter stellendes Team bzw. Person */
  ref: string;
  teamA: string;
  teamB: string;
  scoreA: number | null;
  scoreB: number | null;
  type: GameType;
}

export interface Settings {
  title: string;
  pointsWin: number;
  pointsDraw: number;
  days: { day: 1 | 2; label: string; date: string }[];
}

export interface Tournament {
  settings: Settings;
  teams: string[];
  games: Game[];
  updatedAt: string;
}

export interface StandingRow {
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  diff: number;
  points: number;
}
