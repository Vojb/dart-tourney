export type Match = {
  id: number;
  group?: number;
  round?: number;
  team1: string;
  team2: string;
  time: string;
  board: number;
  score1: number | null;
  score2: number | null;
  completed: boolean;
  winner?: string | null;
  nextMatchId?: number | null;
  nextMatchPosition?: string;
};

export type Tournament = {
  groups: string[][];
  matches: Match[];
};
