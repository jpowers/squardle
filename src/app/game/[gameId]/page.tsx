import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buildGridData, formatCurrency, parsePayouts } from "@/lib/game-utils";
import { GameWithPlays } from "@/lib/types";
import { GamePageClient } from "./GamePageClient";
import { ClosedGameView } from "./ClosedGameView";
import { PaymentButton } from "@/components/game/PaymentButton";

async function getGame(gameId: string): Promise<GameWithPlays | null> {
  return prisma.game.findUnique({
    where: { id: gameId },
    include: {
      plays: {
        include: {
          squares: true,
        },
      },
      scores: {
        orderBy: {
          quarter: "asc",
        },
      },
    },
  });
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  const game = await getGame(gameId);

  if (!game) {
    notFound();
  }

  const gridData = buildGridData(game);
  const totalSquares = game.plays.reduce(
    (acc, play) => acc + play.squares.length,
    0
  );
  const availableSquares = 100 - totalSquares;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          <span className="text-[#69BE28]">{game.yTeamName}</span>
          <span className="text-base-content/50 mx-2">@</span>
          <span className="text-slate-800">{game.xTeamName}</span>
        </h1>
        <p className="text-base-content/60 mb-2">
          {game.name} &bull; {formatCurrency(game.pricePerSquare)} per square
        </p>
        <p className="text-sm text-base-content/50">
          {(() => {
            const payouts = parsePayouts(game.quarterPayouts);
            const totalPool = game.pricePerSquare * 100;
            return `Q1: ${formatCurrency(totalPool * payouts[0] / 100)}, Q2: ${formatCurrency(totalPool * payouts[1] / 100)}, Q3: ${formatCurrency(totalPool * payouts[2] / 100)}, Q4: ${formatCurrency(totalPool * payouts[3] / 100)}`;
          })()}
        </p>

        <div className="flex flex-col items-center justify-center gap-3 mb-4">
          {game.closed ? (
            <span className="badge badge-warning badge-lg">Game Closed - Numbers Assigned</span>
          ) : (
            <>
              <p className="text-base-content/70">
                Click on empty squares to select them for purchase
              </p>
              {game.paymentLink && (
                <PaymentButton paymentLink={game.paymentLink} />
              )}
            </>
          )}
        </div>
      </div>

      {game.closed ? (
        <ClosedGameView
          game={game}
          gridData={gridData}
          plays={game.plays}
          scores={game.scores}
          pricePerSquare={game.pricePerSquare}
          xTeamName={game.xTeamName}
          yTeamName={game.yTeamName}
          xTeamLogo={game.xTeamLogo ?? undefined}
          yTeamLogo={game.yTeamLogo ?? undefined}
        />
      ) : (
        <GamePageClient
          gameId={game.id}
          squares={gridData.squares}
          plays={game.plays}
          xTeamName={game.xTeamName}
          yTeamName={game.yTeamName}
          xTeamLogo={game.xTeamLogo ?? undefined}
          yTeamLogo={game.yTeamLogo ?? undefined}
          pricePerSquare={game.pricePerSquare}
          paymentLink={game.paymentLink}
        />
      )}
    </div>
  );
}
