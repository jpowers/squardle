import { Game, Play, Square, Score } from "@prisma/client";

export type PlayWithSquares = Play & {
  squares: Square[];
};

export type GameWithPlays = Game & {
  plays: PlayWithSquares[];
  scores: Score[];
};

export type SquareData = {
  position: number;
  taken: boolean;
  playerName?: string;
  isWinner?: boolean;
  winningQuarter?: number;
};

export type GridData = {
  squares: SquareData[];
  xNumbers: number[] | null;
  yNumbers: number[] | null;
  closed: boolean;
};
