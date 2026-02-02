"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { shuffleNumbers } from "@/lib/game-utils";

const createGameSchema = z.object({
  name: z.string().min(1, "Name is required"),
  xTeamName: z.string().min(1, "Column team name is required"),
  yTeamName: z.string().min(1, "Row team name is required"),
  pricePerSquare: z
    .string()
    .transform((val) => Math.round(parseFloat(val) * 100))
    .refine((val) => val > 0, "Price must be greater than 0"),
  paymentLink: z.string().url().optional().or(z.literal("")),
  q1Payout: z.string().transform((val) => parseInt(val, 10)),
  q2Payout: z.string().transform((val) => parseInt(val, 10)),
  q3Payout: z.string().transform((val) => parseInt(val, 10)),
  q4Payout: z.string().transform((val) => parseInt(val, 10)),
});

export async function createGame(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string } | null> {
  const admin = await isAdmin();
  if (!admin) {
    return { error: "Unauthorized" };
  }

  const rawData = {
    name: formData.get("name"),
    xTeamName: formData.get("xTeamName"),
    yTeamName: formData.get("yTeamName"),
    pricePerSquare: formData.get("pricePerSquare"),
    paymentLink: formData.get("paymentLink"),
    q1Payout: formData.get("q1Payout"),
    q2Payout: formData.get("q2Payout"),
    q3Payout: formData.get("q3Payout"),
    q4Payout: formData.get("q4Payout"),
  };

  const parsed = createGameSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { name, xTeamName, yTeamName, pricePerSquare, paymentLink, q1Payout, q2Payout, q3Payout, q4Payout } =
    parsed.data;

  const totalPayout = q1Payout + q2Payout + q3Payout + q4Payout;
  if (totalPayout !== 100) {
    return { error: `Payouts must total 100% (currently ${totalPayout}%)` };
  }

  const existing = await prisma.game.findUnique({ where: { name } });
  if (existing) {
    return { error: "A game with this name already exists" };
  }

  const game = await prisma.game.create({
    data: {
      name,
      xTeamName,
      yTeamName,
      pricePerSquare,
      paymentLink: paymentLink || null,
      quarterPayouts: `${q1Payout},${q2Payout},${q3Payout},${q4Payout}`,
    },
  });

  redirect(`/admin/game/${game.id}`);
}

export async function closeGame(gameId: string): Promise<void> {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error("Unauthorized");
  }

  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) {
    throw new Error("Game not found");
  }

  if (game.closed) {
    throw new Error("Game is already closed");
  }

  const xNumbers = shuffleNumbers();
  const yNumbers = shuffleNumbers();

  await prisma.game.update({
    where: { id: gameId },
    data: {
      closed: true,
      xNumbers: xNumbers.join(","),
      yNumbers: yNumbers.join(","),
    },
  });

  redirect(`/admin/game/${gameId}`);
}

export async function deleteGame(gameId: string): Promise<void> {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error("Unauthorized");
  }

  await prisma.game.delete({ where: { id: gameId } });
  redirect("/admin");
}
