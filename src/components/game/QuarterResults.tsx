import { Score, Game } from "@prisma/client";
import { formatCurrency, parsePayouts, calculateWinningPosition, parseNumbers } from "@/lib/game-utils";
import { PlayWithSquares } from "@/lib/types";

type QuarterResultsProps = {
  game: Game;
  scores: Score[];
  plays: PlayWithSquares[];
};

export function QuarterResults({ game, scores, plays }: QuarterResultsProps) {
  const payouts = parsePayouts(game.quarterPayouts);
  const xNumbers = parseNumbers(game.xNumbers);
  const yNumbers = parseNumbers(game.yNumbers);

  if (!game.closed || !xNumbers || !yNumbers) {
    return (
      <div className="alert alert-info">
        <span>Numbers will be revealed when all squares are filled.</span>
      </div>
    );
  }

  const squareToPlayer = new Map<number, string>();
  for (const play of plays) {
    const playerName = `${play.firstName} ${play.lastName}`;
    for (const square of play.squares) {
      squareToPlayer.set(square.position, playerName);
    }
  }

  const quarters = [1, 2, 3, 4];

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra">
        <thead>
          <tr>
            <th>Quarter</th>
            <th className="text-slate-800">{game.xTeamName}</th>
            <th className="text-[#69BE28]">{game.yTeamName}</th>
            <th>Winning #</th>
            <th>Winner</th>
            <th>Payout</th>
          </tr>
        </thead>
        <tbody>
          {quarters.map((quarter) => {
            const score = scores.find((s) => s.quarter === quarter);
            const payout = (payouts[quarter - 1] / 100) * game.pricePerSquare * 100;

            if (!score) {
              return (
                <tr key={quarter}>
                  <td className="font-bold">Q{quarter}</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
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
            const winner = squareToPlayer.get(winningPosition) ?? "Unknown";
            const xDigit = score.xScore % 10;
            const yDigit = score.yScore % 10;

            return (
              <tr key={quarter} className="bg-blue-50">
                <td className="font-bold">Q{quarter}</td>
                <td className="text-slate-800 font-medium">{score.xScore}</td>
                <td className="text-[#69BE28] font-medium">{score.yScore}</td>
                <td>
                  <span className="badge bg-slate-800 text-white border-none">{xDigit}</span>
                  {" / "}
                  <span className="badge bg-[#69BE28] text-white border-none">{yDigit}</span>
                </td>
                <td className="font-semibold">{winner}</td>
                <td className="font-bold text-success">{formatCurrency(payout)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
