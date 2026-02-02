import Link from "next/link";
import { Game } from "@prisma/client";
import { formatCurrency } from "@/lib/game-utils";

type GameCardProps = {
  game: Game & { _count: { plays: number } };
  squareCount: number;
};

export function GameCard({ game, squareCount }: GameCardProps) {
  const availableSquares = 100 - squareCount;

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
