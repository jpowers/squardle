import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GridHeader } from "@/components/grid";
import {
  formatCurrency,
  parsePayouts,
  parseNumbers,
  calculateWinningPosition,
} from "@/lib/game-utils";
import { GameWithPlays } from "@/lib/types";
import { ScoreEntryForm } from "./ScoreEntryForm";

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

export default async function AdminScoresPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const admin = await isAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  const { gameId } = await params;
  const game = await getGame(gameId);

  if (!game) {
    notFound();
  }

  if (!game.closed) {
    redirect(`/admin/game/${gameId}`);
  }

  const xNumbers = parseNumbers(game.xNumbers);
  const yNumbers = parseNumbers(game.yNumbers);
  const payouts = parsePayouts(game.quarterPayouts);
  const totalSquares = game.plays.reduce(
    (acc, play) => acc + play.squares.length,
    0
  );
  const totalPot = totalSquares * game.pricePerSquare;

  const squareToPlayer = new Map<number, string>();
  for (const play of game.plays) {
    const playerName = `${play.firstName} ${play.lastName}`;
    for (const square of play.squares) {
      squareToPlayer.set(square.position, playerName);
    }
  }

  const quarters = [1, 2, 3, 4];

  return (
    <div>
      <Link href={`/admin/game/${gameId}`} className="btn btn-ghost btn-sm mb-4">
        &larr; Back to Game
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">{game.name} - Scores</h1>
        <GridHeader xTeamName={game.xTeamName} yTeamName={game.yTeamName} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Enter Scores</h2>
          <div className="space-y-4">
            {quarters.map((quarter) => {
              const existingScore = game.scores.find(
                (s) => s.quarter === quarter
              );
              const payout = (payouts[quarter - 1] / 100) * totalPot;

              return (
                <div key={quarter} className="card bg-base-100 shadow">
                  <div className="card-body">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="card-title">Quarter {quarter}</h3>
                      <span className="badge badge-primary">
                        {formatCurrency(payout)} payout
                      </span>
                    </div>
                    <ScoreEntryForm
                      gameId={gameId}
                      quarter={quarter}
                      xTeamName={game.xTeamName}
                      yTeamName={game.yTeamName}
                      existingScore={existingScore}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Results Summary</h2>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Quarter</th>
                  <th>Score</th>
                  <th>Winning #</th>
                  <th>Winner</th>
                  <th>Payout</th>
                </tr>
              </thead>
              <tbody>
                {quarters.map((quarter) => {
                  const score = game.scores.find((s) => s.quarter === quarter);
                  const payout = (payouts[quarter - 1] / 100) * totalPot;

                  if (!score || !xNumbers || !yNumbers) {
                    return (
                      <tr key={quarter}>
                        <td className="font-bold">Q{quarter}</td>
                        <td colSpan={3} className="text-base-content/50">
                          Not entered
                        </td>
                        <td>{formatCurrency(payout)}</td>
                      </tr>
                    );
                  }

                  const winningPosition = calculateWinningPosition(
                    score.xScore,
                    score.yScore,
                    xNumbers,
                    yNumbers
                  );
                  const winner = squareToPlayer.get(winningPosition) ?? "No owner";
                  const xDigit = score.xScore % 10;
                  const yDigit = score.yScore % 10;

                  return (
                    <tr key={quarter} className="bg-success/10">
                      <td className="font-bold">Q{quarter}</td>
                      <td>
                        {score.xScore} - {score.yScore}
                      </td>
                      <td>
                        <span className="badge badge-secondary">{xDigit}</span>
                        {" / "}
                        <span className="badge badge-accent">{yDigit}</span>
                      </td>
                      <td className="font-semibold">{winner}</td>
                      <td className="font-bold text-success">
                        {formatCurrency(payout)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6">
            <Link href={`/game/${gameId}`} className="btn btn-primary w-full">
              View Public Results Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
