import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SquareGrid, GridHeader } from "@/components/grid";
import { buildGridData, formatCurrency, parsePayouts } from "@/lib/game-utils";
import { GameWithPlays } from "@/lib/types";
import { closeGame, deleteGame } from "@/app/actions/games";

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

export default async function AdminGamePage({
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

  const gridData = buildGridData(game);
  const totalSquares = game.plays.reduce(
    (acc, play) => acc + play.squares.length,
    0
  );
  const payouts = parsePayouts(game.quarterPayouts);
  const totalPot = totalSquares * game.pricePerSquare;

  const closeGameWithId = closeGame.bind(null, gameId);
  const deleteGameWithId = deleteGame.bind(null, gameId);

  return (
    <div>
      <Link href="/admin" className="btn btn-ghost btn-sm mb-4">
        &larr; Back to Dashboard
      </Link>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">{game.name}</h1>
          <GridHeader xTeamName={game.xTeamName} yTeamName={game.yTeamName} />
        </div>
        <div className="flex gap-2">
          <Link href={`/game/${game.id}`} className="btn btn-ghost btn-sm">
            View Public Page
          </Link>
          {game.closed && (
            <Link
              href={`/admin/game/${game.id}/scores`}
              className="btn btn-secondary btn-sm"
            >
              Enter Scores
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="card-title text-sm">Status</h3>
            {game.closed ? (
              <span className="badge badge-warning badge-lg">Closed</span>
            ) : (
              <span className="badge badge-success badge-lg">Open</span>
            )}
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="card-title text-sm">Squares Sold</h3>
            <p className="text-2xl font-bold">{totalSquares} / 100</p>
          </div>
        </div>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <h3 className="card-title text-sm">Total Pot</h3>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(totalPot)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Game Board</h2>
          <div className="overflow-x-auto">
            <SquareGrid
              gridData={gridData}
              showPositionNumbers
              xTeamName={game.xTeamName}
              yTeamName={game.yTeamName}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Game Details</h2>
            <div className="card bg-base-100 shadow">
              <div className="card-body">
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-base-content/70">Price per square:</dt>
                    <dd className="font-semibold">
                      {formatCurrency(game.pricePerSquare)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-base-content/70">Q1 Payout:</dt>
                    <dd className="font-semibold">
                      {payouts[0]}% ({formatCurrency((payouts[0] / 100) * totalPot)})
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-base-content/70">Q2 Payout:</dt>
                    <dd className="font-semibold">
                      {payouts[1]}% ({formatCurrency((payouts[1] / 100) * totalPot)})
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-base-content/70">Q3 Payout:</dt>
                    <dd className="font-semibold">
                      {payouts[2]}% ({formatCurrency((payouts[2] / 100) * totalPot)})
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-base-content/70">Q4 Payout:</dt>
                    <dd className="font-semibold">
                      {payouts[3]}% ({formatCurrency((payouts[3] / 100) * totalPot)})
                    </dd>
                  </div>
                  {game.closed && game.xNumbers && game.yNumbers && (
                    <>
                      <div className="divider"></div>
                      <div className="flex justify-between">
                        <dt className="text-base-content/70">X Numbers:</dt>
                        <dd className="font-mono">{game.xNumbers}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-base-content/70">Y Numbers:</dt>
                        <dd className="font-mono">{game.yNumbers}</dd>
                      </div>
                    </>
                  )}
                </dl>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="card bg-base-100 shadow">
              <div className="card-body space-y-4">
                {!game.closed && (
                  <form action={closeGameWithId}>
                    <button type="submit" className="btn btn-warning w-full">
                      Close Game & Shuffle Numbers
                    </button>
                  </form>
                )}
                <form action={deleteGameWithId}>
                  <button type="submit" className="btn btn-error btn-outline w-full">
                    Delete Game
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">
          Players ({game.plays.length})
        </h2>
        {game.plays.length === 0 ? (
          <p className="text-base-content/70">No players yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Squares</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {game.plays.map((play) => (
                  <tr key={play.id}>
                    <td>
                      {play.firstName} {play.lastName}
                    </td>
                    <td>{play.email || "-"}</td>
                    <td>{play.phone || "-"}</td>
                    <td>{play.squares.map((s) => s.position).join(", ")}</td>
                    <td>
                      {formatCurrency(play.squares.length * game.pricePerSquare)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
