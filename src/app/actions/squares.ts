"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { shuffleNumbers } from "@/lib/game-utils";
import { pusher, getGameChannel } from "@/lib/pusher-server";

const selectSquaresSchema = z.object({
  gameId: z.string().min(1),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  positions: z.string().transform((val) => {
    const parsed = JSON.parse(val) as number[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error("No squares selected");
    }
    if (parsed.length > 10) {
      throw new Error("Maximum 10 squares allowed");
    }
    return parsed;
  }),
});

export async function selectSquares(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const rawData = {
    gameId: formData.get("gameId"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    positions: formData.get("positions"),
  };

  const parsed = selectSquaresSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { gameId, firstName, lastName, email, phone, positions } = parsed.data;

  const game = await prisma.game.findUnique({
    where: { id: gameId },
  });

  if (!game) {
    return { error: "Game not found" };
  }

  if (game.closed) {
    return { error: "This game is closed" };
  }

  let gameClosed = false;

  try {
    // Use a transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Check current square count
      const currentSquareCount = await tx.square.count({
        where: { gameId },
      });

      if (currentSquareCount + positions.length > 100) {
        throw new Error("Not enough squares available");
      }

      // Create play with squares (unique constraint prevents duplicates)
      await tx.play.create({
        data: {
          gameId,
          firstName,
          lastName,
          email: email || null,
          phone: phone || null,
          squares: {
            create: positions.map((position) => ({
              position,
              gameId, // Required for unique constraint
            })),
          },
        },
      });

      // Check if game should auto-close
      const newSquareCount = currentSquareCount + positions.length;
      if (newSquareCount >= 100) {
        const xNumbers = shuffleNumbers();
        const yNumbers = shuffleNumbers();
        await tx.game.update({
          where: { id: gameId },
          data: {
            closed: true,
            xNumbers: xNumbers.join(","),
            yNumbers: yNumbers.join(","),
          },
        });
        gameClosed = true;
      }
    });

    // Broadcast to other users that squares were taken
    const playerName = `${firstName} ${lastName.charAt(0)}.`;
    await pusher.trigger(getGameChannel(gameId), "squares-taken", {
      positions,
      playerName,
    });

    // If game closed, broadcast that too
    if (gameClosed) {
      await pusher.trigger(getGameChannel(gameId), "game-closed", {});
    }
  } catch (error) {
    // Handle unique constraint violation (someone else took the square)
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return { error: "One or more squares were just taken. Please try again." };
    }
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to save squares" };
  }

  redirect(`/game/${gameId}`);
}
