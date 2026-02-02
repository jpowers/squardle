import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buildGridData, formatCurrency } from "@/lib/game-utils";
import { GameWithPlays } from "@/lib/types";
import { PlayPageClient } from "./PlayPageClient";

async function getGame(gameId: string): Promise<GameWithPlays | null> {
  return prisma.game.findUnique({
    where: { id: gameId },
    include: {
      plays: {
        include: {
          squares: true,
        },
      },
      scores: true,
    },
  });
}

export default async function PlayPage({
  params,
  searchParams,
}: {
  params: Promise<{ gameId: string }>;
  searchParams: Promise<{ squares?: string }>;
}) {
  const { gameId } = await params;
  const { squares: squaresParam } = await searchParams;

  // Parse pre-selected squares from URL
  const preSelectedSquares = squaresParam
    ? squaresParam.split(",").map(Number).filter((n) => !isNaN(n) && n >= 1 && n <= 100)
    : [];
  const game = await getGame(gameId);

  if (!game) {
    notFound();
  }

  if (game.closed) {
    redirect(`/game/${gameId}`);
  }

  const gridData = buildGridData(game);
  const availableSquares = gridData.squares.filter((s) => !s.taken).length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <Link href={`/game/${gameId}`} className="btn btn-ghost btn-sm mb-4">
          &larr; Back to Game
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">{game.name}</h1>
        <p className="text-base-content/60 mb-4">
          {formatCurrency(game.pricePerSquare)} per square
        </p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-lg font-medium text-success">
            {availableSquares} squares available
          </span>
        </div>
      </div>

      {/* Grid and Form */}
      <div className="bg-base-200 rounded-xl p-4 sm:p-6">
        <PlayPageClient
          gameId={game.id}
          squares={gridData.squares}
          pricePerSquare={game.pricePerSquare}
          paymentLink={game.paymentLink}
          xTeamName={game.xTeamName}
          yTeamName={game.yTeamName}
          initialSelectedSquares={preSelectedSquares}
        />
      </div>
    </div>
  );
}
