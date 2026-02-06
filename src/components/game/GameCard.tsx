import Link from "next/link";
import { Game } from "@prisma/client";
import { formatCurrency, parsePayouts } from "@/lib/game-utils";

type GameCardProps = {
  game: Game & { _count: { plays: number } };
  squareCount: number;
};

export function GameCard({ game, squareCount }: GameCardProps) {
  const availableSquares = 100 - squareCount;
  const payouts = parsePayouts(game.quarterPayouts);
  const totalPool = game.pricePerSquare * 100; // 100 squares

  return (
    <Link href={`/game/${game.id}`} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer">
      <div className="card-body">
        <h2 className="card-title">{game.name}</h2>
        <div className="flex gap-2 flex-wrap items-center">
          <span className="font-semibold text-[#69BE28]">{game.yTeamName}</span>
          <span className="text-base-content/50">@</span>
          <span className="font-semibold text-slate-800">{game.xTeamName}</span>
        </div>
        <p className="text-sm text-base-content/70">
          {formatCurrency(game.pricePerSquare)} per square
        </p>
        <div className="flex flex-wrap gap-1 mt-1">
          <span className="badge badge-sm font-medium">Q1: {formatCurrency(totalPool * payouts[0] / 100)}</span>
          <span className="badge badge-sm font-medium">Q2: {formatCurrency(totalPool * payouts[1] / 100)}</span>
          <span className="badge badge-sm font-medium">Q3: {formatCurrency(totalPool * payouts[2] / 100)}</span>
          <span className="badge badge-sm font-medium">Q4: {formatCurrency(totalPool * payouts[3] / 100)}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm">
            {game.closed ? (
              <span className="badge badge-warning">Closed</span>
            ) : (
              <span className="text-sm font-medium text-success">
                {availableSquares} available
              </span>
            )}
          </span>
          <span className="text-sm text-base-content/70">
            {game._count.plays} players
          </span>
        </div>
      </div>
    </Link>
  );
}
