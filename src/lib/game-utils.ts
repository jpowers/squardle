import { GameWithPlays, GridData, SquareData } from "./types";

export function positionToCoords(position: number): { row: number; col: number } {
  return {
    row: Math.floor((position - 1) / 10),
    col: (position - 1) % 10,
  };
}

export function coordsToPosition(row: number, col: number): number {
  return row * 10 + col + 1;
}

export function parseNumbers(numbersString: string | null): number[] | null {
  if (!numbersString) return null;
  return numbersString.split(",").map((n) => parseInt(n, 10));
}

export function shuffleNumbers(): number[] {
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  return numbers;
}

export function calculateWinningPosition(
  xScore: number,
  yScore: number,
  xNumbers: number[],
  yNumbers: number[]
): number {
  const xLastDigit = xScore % 10;
  const yLastDigit = yScore % 10;
  const col = xNumbers.indexOf(xLastDigit);
  const row = yNumbers.indexOf(yLastDigit);
  return coordsToPosition(row, col);
}

export function buildGridData(game: GameWithPlays): GridData {
  const squareMap = new Map<number, { playerName: string; playId: string }>();

  for (const play of game.plays) {
    const playerName = `${play.firstName} ${play.lastName.charAt(0)}.`;
    for (const square of play.squares) {
      squareMap.set(square.position, { playerName, playId: play.id });
    }
  }

  const xNumbers = parseNumbers(game.xNumbers);
  const yNumbers = parseNumbers(game.yNumbers);

  const winningPositions = new Map<number, number>();
  if (game.closed && xNumbers && yNumbers) {
    for (const score of game.scores) {
      const winningPosition = calculateWinningPosition(
        score.xScore,
        score.yScore,
        xNumbers,
        yNumbers
      );
      winningPositions.set(winningPosition, score.quarter);
    }
  }

  const squares: SquareData[] = [];
  for (let position = 1; position <= 100; position++) {
    const squareInfo = squareMap.get(position);
    const winningQuarter = winningPositions.get(position);
    squares.push({
      position,
      taken: !!squareInfo,
      playerName: squareInfo?.playerName,
      isWinner: !!winningQuarter,
      winningQuarter,
    });
  }

  return {
    squares,
    xNumbers,
    yNumbers,
    closed: game.closed,
  };
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function parsePayouts(payoutsString: string): number[] {
  return payoutsString.split(",").map((p) => parseInt(p, 10));
}
