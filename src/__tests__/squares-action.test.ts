import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { Prisma } from "@prisma/client";

// Mock the modules before importing the action
jest.mock("@/lib/prisma", () => ({
  prisma: {
    game: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    square: {
      count: jest.fn(),
    },
    play: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock("@/lib/pusher-server", () => ({
  pusher: {
    trigger: jest.fn(),
  },
  getGameChannel: jest.fn((gameId: string) => `game-${gameId}`),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

// Import after mocks are set up
import { selectSquares } from "../app/actions/squares";
import { prisma } from "@/lib/prisma";

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe("selectSquares - Concurrent Submission Handling", () => {
  const mockGame = {
    id: "game-123",
    name: "Test Game",
    xTeamName: "Team A",
    yTeamName: "Team B",
    pricePerSquare: 1000,
    closed: false,
    xNumbers: null,
    yNumbers: null,
    quarterPayouts: "25,25,25,25",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createFormData = (positions: number[]) => {
    const formData = new FormData();
    formData.set("gameId", "game-123");
    formData.set("firstName", "John");
    formData.set("lastName", "Doe");
    formData.set("email", "john@example.com");
    formData.set("phone", "");
    formData.set("positions", JSON.stringify(positions));
    return formData;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (mockPrisma.game.findUnique as jest.Mock).mockResolvedValue(mockGame);
  });

  it("returns error when square is already taken (unique constraint violation)", async () => {
    // Simulate Prisma unique constraint violation (P2002)
    // This happens when two users try to claim the same square
    const uniqueConstraintError = new Prisma.PrismaClientKnownRequestError(
      "Unique constraint failed on the fields: (`gameId`,`position`)",
      {
        code: "P2002",
        clientVersion: "5.0.0",
        meta: { target: ["gameId", "position"] },
      }
    );

    (mockPrisma.$transaction as jest.Mock).mockRejectedValue(uniqueConstraintError);

    const formData = createFormData([42]); // User tries to select square 42
    const result = await selectSquares(null, formData);

    expect(result).toEqual({
      error: "One or more squares were just taken. Please try again.",
    });
  });

  it("handles race condition when two users submit same squares simultaneously", async () => {
    // Simulate the scenario where User A's transaction succeeds,
    // but User B's transaction fails due to the unique constraint

    let callCount = 0;
    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
      callCount++;
      if (callCount === 1) {
        // First call (User A) succeeds
        return fn({
          square: { count: jest.fn().mockResolvedValue(50) },
          play: { create: jest.fn().mockResolvedValue({ id: "play-1" }) },
          game: { update: jest.fn() },
        });
      } else {
        // Second call (User B) fails - square already taken
        throw new Prisma.PrismaClientKnownRequestError(
          "Unique constraint failed",
          { code: "P2002", clientVersion: "5.0.0" }
        );
      }
    });

    const formData1 = createFormData([42, 43]); // User A
    const formData2 = createFormData([42, 44]); // User B (overlapping square 42)

    // Simulate concurrent submissions
    const [result1, result2] = await Promise.all([
      selectSquares(null, formData1),
      selectSquares(null, formData2),
    ]);

    // One should succeed (redirect), one should fail with error
    // Note: The successful one throws redirect, so we check the error case
    expect(result2).toEqual({
      error: "One or more squares were just taken. Please try again.",
    });
  });

  it("returns error when not enough squares available due to concurrent fill", async () => {
    // Simulate scenario where another user filled squares between
    // the initial check and the transaction
    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
      // Inside transaction, discover that squares were just filled
      const mockTx = {
        square: { count: jest.fn().mockResolvedValue(98) }, // 98 squares already taken
        play: { create: jest.fn() },
        game: { update: jest.fn() },
      };
      return fn(mockTx);
    });

    const formData = createFormData([1, 2, 3]); // User tries to take 3 squares but only 2 available
    const result = await selectSquares(null, formData);

    expect(result).toEqual({
      error: "Not enough squares available",
    });
  });

  it("successfully claims squares when no conflict exists", async () => {
    (mockPrisma.$transaction as jest.Mock).mockImplementation(async (fn) => {
      const mockTx = {
        square: { count: jest.fn().mockResolvedValue(50) },
        play: {
          create: jest.fn().mockResolvedValue({
            id: "play-1",
            gameId: "game-123",
            firstName: "John",
            lastName: "Doe",
          }),
        },
        game: { update: jest.fn() },
      };
      return fn(mockTx);
    });

    const formData = createFormData([42, 43, 44]);

    // selectSquares redirects on success, which throws in Next.js
    // We need to catch that or check that no error is returned before redirect
    try {
      await selectSquares(null, formData);
    } catch {
      // Redirect throws in Next.js - this is expected for success
    }

    // Verify transaction was called
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });

  it("handles multiple squares with partial conflict", async () => {
    // User selects [10, 20, 30] but square 20 was just taken
    const uniqueConstraintError = new Prisma.PrismaClientKnownRequestError(
      "Unique constraint failed",
      { code: "P2002", clientVersion: "5.0.0" }
    );

    (mockPrisma.$transaction as jest.Mock).mockRejectedValue(uniqueConstraintError);

    const formData = createFormData([10, 20, 30]);
    const result = await selectSquares(null, formData);

    expect(result).toEqual({
      error: "One or more squares were just taken. Please try again.",
    });
  });
});

describe("selectSquares - Validation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns error for missing first name", async () => {
    const formData = new FormData();
    formData.set("gameId", "game-123");
    formData.set("firstName", "");
    formData.set("lastName", "Doe");
    formData.set("positions", JSON.stringify([1]));

    const result = await selectSquares(null, formData);

    expect(result?.error).toBe("First name is required");
  });

  it("returns error for missing last name", async () => {
    const formData = new FormData();
    formData.set("gameId", "game-123");
    formData.set("firstName", "John");
    formData.set("lastName", "");
    formData.set("positions", JSON.stringify([1]));

    const result = await selectSquares(null, formData);

    expect(result?.error).toBe("Last name is required");
  });

  it("rejects when selecting more than 10 squares", async () => {
    const formData = new FormData();
    formData.set("gameId", "game-123");
    formData.set("firstName", "John");
    formData.set("lastName", "Doe");
    formData.set("positions", JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]));

    // Zod v4 throws from transforms, so we check for the thrown error
    await expect(selectSquares(null, formData)).rejects.toThrow(
      "Maximum 10 squares allowed"
    );
  });

  it("rejects when no squares selected", async () => {
    const formData = new FormData();
    formData.set("gameId", "game-123");
    formData.set("firstName", "John");
    formData.set("lastName", "Doe");
    formData.set("positions", JSON.stringify([]));

    // Zod v4 throws from transforms, so we check for the thrown error
    await expect(selectSquares(null, formData)).rejects.toThrow(
      "No squares selected"
    );
  });
});

describe("selectSquares - Game State", () => {
  const createValidFormData = (gameId: string) => {
    const formData = new FormData();
    formData.set("gameId", gameId);
    formData.set("firstName", "John");
    formData.set("lastName", "Doe");
    formData.set("email", "");
    formData.set("phone", "");
    formData.set("positions", JSON.stringify([1]));
    return formData;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns error when game is closed", async () => {
    (mockPrisma.game.findUnique as jest.Mock).mockResolvedValue({
      id: "game-123",
      closed: true,
    });

    const formData = createValidFormData("game-123");
    const result = await selectSquares(null, formData);

    expect(result).toEqual({ error: "This game is closed" });
  });

  it("returns error when game not found", async () => {
    (mockPrisma.game.findUnique as jest.Mock).mockResolvedValue(null);

    const formData = createValidFormData("nonexistent");
    const result = await selectSquares(null, formData);

    expect(result).toEqual({ error: "Game not found" });
  });
});
