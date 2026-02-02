"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

const scoreSchema = z.object({
  gameId: z.string().min(1),
  quarter: z.coerce.number().min(1).max(4),
  xScore: z.coerce.number().min(0),
  yScore: z.coerce.number().min(0),
});

export async function saveScore(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean } | null> {
  const admin = await isAdmin();
  if (!admin) {
    return { error: "Unauthorized" };
  }

  const rawData = {
    gameId: formData.get("gameId"),
    quarter: formData.get("quarter"),
    xScore: formData.get("xScore"),
    yScore: formData.get("yScore"),
  };

  const parsed = scoreSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { gameId, quarter, xScore, yScore } = parsed.data;

  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) {
    return { error: "Game not found" };
  }

  if (!game.closed) {
    return { error: "Game must be closed before entering scores" };
  }

  await prisma.score.upsert({
    where: {
      gameId_quarter: {
        gameId,
        quarter,
      },
    },
    update: {
      xScore,
      yScore,
    },
    create: {
      gameId,
      quarter,
      xScore,
      yScore,
    },
  });

  return { success: true };
}

export async function deleteScore(
  gameId: string,
  quarter: number
): Promise<{ error?: string } | null> {
  const admin = await isAdmin();
  if (!admin) {
    return { error: "Unauthorized" };
  }

  await prisma.score.delete({
    where: {
      gameId_quarter: {
        gameId,
        quarter,
      },
    },
  });

  redirect(`/admin/game/${gameId}/scores`);
}
