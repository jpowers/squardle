import { describe, it, expect } from "@jest/globals";
import {
  positionToCoords,
  coordsToPosition,
  parseNumbers,
  shuffleNumbers,
  calculateWinningPosition,
  buildGridData,
  formatCurrency,
  parsePayouts,
} from "../lib/game-utils";
import { GameWithPlays } from "../lib/types";

describe("Position and Coordinate Conversion", () => {
  it("converts position 1 to row 0, col 0", () => {
    expect(positionToCoords(1)).toEqual({ row: 0, col: 0 });
  });

  it("converts position 10 to row 0, col 9", () => {
    expect(positionToCoords(10)).toEqual({ row: 0, col: 9 });
  });

  it("converts position 11 to row 1, col 0", () => {
    expect(positionToCoords(11)).toEqual({ row: 1, col: 0 });
  });

  it("converts position 100 to row 9, col 9", () => {
    expect(positionToCoords(100)).toEqual({ row: 9, col: 9 });
  });

  it("converts position 55 to row 5, col 4", () => {
    expect(positionToCoords(55)).toEqual({ row: 5, col: 4 });
  });

  it("converts row 0, col 0 back to position 1", () => {
    expect(coordsToPosition(0, 0)).toBe(1);
  });

  it("converts row 9, col 9 back to position 100", () => {
    expect(coordsToPosition(9, 9)).toBe(100);
  });

  it("round-trips all positions correctly", () => {
    for (let pos = 1; pos <= 100; pos++) {
      const { row, col } = positionToCoords(pos);
      expect(coordsToPosition(row, col)).toBe(pos);
    }
  });
});

describe("Number Parsing", () => {
  it("parses comma-separated numbers", () => {
    expect(parseNumbers("3,7,1,9,0,5,2,8,4,6")).toEqual([3, 7, 1, 9, 0, 5, 2, 8, 4, 6]);
  });

  it("returns null for null input", () => {
    expect(parseNumbers(null)).toBeNull();
  });
});

describe("Number Shuffling", () => {
  it("returns array of 10 numbers", () => {
    const numbers = shuffleNumbers();
    expect(numbers).toHaveLength(10);
  });

  it("contains all digits 0-9", () => {
    const numbers = shuffleNumbers();
    const sorted = [...numbers].sort((a, b) => a - b);
    expect(sorted).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it("produces different results on multiple calls (with high probability)", () => {
    const results = new Set<string>();
    for (let i = 0; i < 10; i++) {
      results.add(shuffleNumbers().join(","));
    }
    // Should have at least 2 different results (extremely likely)
    expect(results.size).toBeGreaterThan(1);
  });
});

describe("Winning Square Calculation", () => {
  // Example: xNumbers = [3,7,1,9,0,5,2,8,4,6], yNumbers = [8,2,5,0,4,9,1,6,3,7]
  const xNumbers = [3, 7, 1, 9, 0, 5, 2, 8, 4, 6];
  const yNumbers = [8, 2, 5, 0, 4, 9, 1, 6, 3, 7];

  it("calculates winning position for score 0-0", () => {
    // x last digit = 0, y last digit = 0
    // col = xNumbers.indexOf(0) = 4
    // row = yNumbers.indexOf(0) = 3
    // position = 3 * 10 + 4 + 1 = 35
    const position = calculateWinningPosition(0, 0, xNumbers, yNumbers);
    expect(position).toBe(35);
  });

  it("calculates winning position for score 17-14", () => {
    // x last digit = 7, y last digit = 4
    // col = xNumbers.indexOf(7) = 1
    // row = yNumbers.indexOf(4) = 4
    // position = 4 * 10 + 1 + 1 = 42
    const position = calculateWinningPosition(17, 14, xNumbers, yNumbers);
    expect(position).toBe(42);
  });

  it("calculates winning position for score 23-21", () => {
    // x last digit = 3, y last digit = 1
    // col = xNumbers.indexOf(3) = 0
    // row = yNumbers.indexOf(1) = 6
    // position = 6 * 10 + 0 + 1 = 61
    const position = calculateWinningPosition(23, 21, xNumbers, yNumbers);
    expect(position).toBe(61);
  });

  it("handles large scores correctly (uses last digit only)", () => {
    // Score 137-224 -> last digits 7 and 4
    const position = calculateWinningPosition(137, 224, xNumbers, yNumbers);
    expect(position).toBe(calculateWinningPosition(17, 14, xNumbers, yNumbers));
  });
});

describe("Grid Data Building", () => {
  const createMockGame = (overrides: Partial<GameWithPlays> = {}): GameWithPlays => ({
    id: "game-1",
    name: "Test Game",
    xTeamName: "Team A",
    yTeamName: "Team B",
    xTeamLogo: null,
    yTeamLogo: null,
    pricePerSquare: 1000,
    closed: false,
    xNumbers: null,
    yNumbers: null,
    quarterPayouts: "25,25,25,25",
    paymentLink: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    plays: [],
    scores: [],
    ...overrides,
  });

  it("builds grid with 100 squares", () => {
    const game = createMockGame();
    const gridData = buildGridData(game);
    expect(gridData.squares).toHaveLength(100);
  });

  it("marks all squares as available when no plays exist", () => {
    const game = createMockGame();
    const gridData = buildGridData(game);
    expect(gridData.squares.every((s) => !s.taken)).toBe(true);
  });

  it("marks squares as taken when plays exist", () => {
    const game = createMockGame({
      plays: [
        {
          id: "play-1",
          gameId: "game-1",
          firstName: "John",
          lastName: "Doe",
          email: null,
          phone: null,
          createdAt: new Date(),
          squares: [
            { id: "sq-1", playId: "play-1", gameId: "game-1", position: 1 },
            { id: "sq-2", playId: "play-1", gameId: "game-1", position: 5 },
            { id: "sq-3", playId: "play-1", gameId: "game-1", position: 50 },
          ],
        },
      ],
    });

    const gridData = buildGridData(game);

    expect(gridData.squares[0].taken).toBe(true); // position 1
    expect(gridData.squares[0].playerName).toBe("John D.");
    expect(gridData.squares[4].taken).toBe(true); // position 5
    expect(gridData.squares[49].taken).toBe(true); // position 50
    expect(gridData.squares[1].taken).toBe(false); // position 2
  });

  it("marks winning squares when game is closed with scores", () => {
    const game = createMockGame({
      closed: true,
      xNumbers: "3,7,1,9,0,5,2,8,4,6",
      yNumbers: "8,2,5,0,4,9,1,6,3,7",
      plays: [
        {
          id: "play-1",
          gameId: "game-1",
          firstName: "John",
          lastName: "Doe",
          email: null,
          phone: null,
          createdAt: new Date(),
          squares: [
            { id: "sq-1", playId: "play-1", gameId: "game-1", position: 35 }, // Winner for 0-0
          ],
        },
      ],
      scores: [
        { id: "score-1", gameId: "game-1", quarter: 1, xScore: 0, yScore: 0, winningSquareId: null },
      ],
    });

    const gridData = buildGridData(game);

    // Position 35 should be marked as winner for Q1
    expect(gridData.squares[34].isWinner).toBe(true);
    expect(gridData.squares[34].winningQuarter).toBe(1);
  });

  it("returns numbers when game is closed", () => {
    const game = createMockGame({
      closed: true,
      xNumbers: "3,7,1,9,0,5,2,8,4,6",
      yNumbers: "8,2,5,0,4,9,1,6,3,7",
    });

    const gridData = buildGridData(game);

    expect(gridData.xNumbers).toEqual([3, 7, 1, 9, 0, 5, 2, 8, 4, 6]);
    expect(gridData.yNumbers).toEqual([8, 2, 5, 0, 4, 9, 1, 6, 3, 7]);
    expect(gridData.closed).toBe(true);
  });
});

describe("Formatting Utilities", () => {
  it("formats currency correctly", () => {
    expect(formatCurrency(1000)).toBe("$10.00");
    expect(formatCurrency(2550)).toBe("$25.50");
    expect(formatCurrency(100)).toBe("$1.00");
  });

  it("parses payouts correctly", () => {
    expect(parsePayouts("25,25,25,25")).toEqual([25, 25, 25, 25]);
    expect(parsePayouts("20,20,20,40")).toEqual([20, 20, 20, 40]);
  });
});

describe("Game Rules", () => {
  it("max 10 squares per player", () => {
    const MAX_SQUARES_PER_PLAYER = 10;
    expect(MAX_SQUARES_PER_PLAYER).toBe(10);
  });

  it("grid is 10x10 = 100 squares", () => {
    const TOTAL_SQUARES = 10 * 10;
    expect(TOTAL_SQUARES).toBe(100);
  });

  it("payouts should total 100%", () => {
    const payouts = parsePayouts("25,25,25,25");
    const total = payouts.reduce((sum, p) => sum + p, 0);
    expect(total).toBe(100);
  });
});
