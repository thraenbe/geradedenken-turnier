import type { Tournament } from "./types";

export const TEAMS = [
  "Dubbling Ducks Darmstadt",
  "Tübingen 1",
  "Tübingen 2",
  "Thurgauer Damen",
  "SG Stuttgart-Nürnberg",
  "Seelöwen Konstanz",
  "Freiburger Faltbootverein",
];

export function seedTournament(): Tournament {
  return {
    settings: {
      title: "Tübinger Kanupoloturnier 2026",
      pointsWin: 2,
      pointsDraw: 1,
      days: [
        { day: 1, label: "Samstag", date: "04.07.2026" },
        { day: 2, label: "Sonntag", date: "05.07.2026" },
      ],
    },
    teams: TEAMS,
    games: [
      // ── Samstag, 04.07.2026 ──
      { id: "d1-01", day: 1, time: "08:30", ref: "Seelöwen Konstanz", teamA: "Dubbling Ducks Darmstadt", teamB: "Tübingen 1", scoreA: null, scoreB: null, type: "rr" },
      { id: "d1-02", day: 1, time: "09:00", ref: "Tübingen Hannes", teamA: "Thurgauer Damen", teamB: "SG Stuttgart-Nürnberg", scoreA: null, scoreB: null, type: "rr" },
      { id: "d1-03", day: 1, time: "10:00", ref: "Dubbling Ducks Darmstadt", teamA: "Tübingen 2", teamB: "Seelöwen Konstanz", scoreA: null, scoreB: null, type: "rr" },
      { id: "d1-04", day: 1, time: "10:30", ref: "Freiburger Faltbootverein", teamA: "Thurgauer Damen", teamB: "Tübingen 1", scoreA: null, scoreB: null, type: "rr" },
      { id: "d1-05", day: 1, time: "11:00", ref: "Dubbling Ducks Darmstadt", teamA: "Tübingen 2", teamB: "SG Stuttgart-Nürnberg", scoreA: null, scoreB: null, type: "rr" },
      { id: "d1-06", day: 1, time: "12:00", ref: "Tübingen 1", teamA: "Seelöwen Konstanz", teamB: "Freiburger Faltbootverein", scoreA: null, scoreB: null, type: "rr" },
      { id: "d1-07", day: 1, time: "12:30", ref: "Thurgauer Damen", teamA: "Dubbling Ducks Darmstadt", teamB: "Tübingen 2", scoreA: null, scoreB: null, type: "rr" },
      { id: "d1-08", day: 1, time: "13:00", ref: "Freiburger Faltbootverein", teamA: "SG Stuttgart-Nürnberg", teamB: "Tübingen 1", scoreA: null, scoreB: null, type: "rr" },
      { id: "d1-09", day: 1, time: "14:00", ref: "1 Schiri", teamA: "Jugendspiel", teamB: "Jugendspiel", scoreA: null, scoreB: null, type: "youth" },
      { id: "d1-10", day: 1, time: "14:30", ref: "SG Stuttgart-Nürnberg", teamA: "Dubbling Ducks Darmstadt", teamB: "Freiburger Faltbootverein", scoreA: null, scoreB: null, type: "rr" },
      { id: "d1-11", day: 1, time: "15:30", ref: "SG Stuttgart-Nürnberg", teamA: "Thurgauer Damen", teamB: "Seelöwen Konstanz", scoreA: null, scoreB: null, type: "rr" },
      { id: "d1-12", day: 1, time: "16:00", ref: "Tübingen 1", teamA: "Freiburger Faltbootverein", teamB: "Tübingen 2", scoreA: null, scoreB: null, type: "rr" },
      { id: "d1-13", day: 1, time: "17:00", ref: "Seelöwen Konstanz", teamA: "Dubbling Ducks Darmstadt", teamB: "Thurgauer Damen", scoreA: null, scoreB: null, type: "rr" },
      { id: "d1-14", day: 1, time: "17:30", ref: "Tübingen 2", teamA: "Freiburger Faltbootverein", teamB: "Tübingen 1", scoreA: null, scoreB: null, type: "rr" },
      { id: "d1-15", day: 1, time: "18:00", ref: "1 Schiri", teamA: "Jugendspiel", teamB: "Jugendspiel", scoreA: null, scoreB: null, type: "youth" },
      { id: "d1-16", day: 1, time: "18:30", ref: "Tübingen 2", teamA: "SG Stuttgart-Nürnberg", teamB: "Seelöwen Konstanz", scoreA: null, scoreB: null, type: "rr" },
      // ── Sonntag, 05.07.2026 ──
      { id: "d2-01", day: 2, time: "08:30", ref: "SG Stuttgart-Nürnberg", teamA: "Tübingen 2", teamB: "Thurgauer Damen", scoreA: null, scoreB: null, type: "rr" },
      { id: "d2-02", day: 2, time: "09:00", ref: "Tübingen 1", teamA: "Seelöwen Konstanz", teamB: "Dubbling Ducks Darmstadt", scoreA: null, scoreB: null, type: "rr" },
      { id: "d2-03", day: 2, time: "09:30", ref: "Thurgauer Damen", teamA: "Freiburger Faltbootverein", teamB: "SG Stuttgart-Nürnberg", scoreA: null, scoreB: null, type: "rr" },
      { id: "d2-04", day: 2, time: "10:00", ref: "Dubbling Ducks Darmstadt", teamA: "Tübingen 2", teamB: "Tübingen 1", scoreA: null, scoreB: null, type: "rr" },
      { id: "d2-05", day: 2, time: "11:00", ref: "Seelöwen Konstanz", teamA: "Freiburger Faltbootverein", teamB: "Thurgauer Damen", scoreA: null, scoreB: null, type: "rr" },
      { id: "d2-06", day: 2, time: "11:30", ref: "Tübingen 2", teamA: "SG Stuttgart-Nürnberg", teamB: "Dubbling Ducks Darmstadt", scoreA: null, scoreB: null, type: "rr" },
      { id: "d2-07", day: 2, time: "12:00", ref: "Freiburger Faltbootverein", teamA: "Seelöwen Konstanz", teamB: "Tübingen 1", scoreA: null, scoreB: null, type: "rr" },
      { id: "d2-08", day: 2, time: "12:30", ref: "", teamA: "Pause", teamB: "Pause", scoreA: null, scoreB: null, type: "break" },
      { id: "d2-09", day: 2, time: "13:00", ref: "", teamA: "3. Gruppenphase", teamB: "4. Gruppenphase", scoreA: null, scoreB: null, type: "p3" },
      { id: "d2-10", day: 2, time: "13:30", ref: "", teamA: "1. Gruppenphase", teamB: "2. Gruppenphase", scoreA: null, scoreB: null, type: "p1" },
    ],
    updatedAt: new Date().toISOString(),
  };
}
