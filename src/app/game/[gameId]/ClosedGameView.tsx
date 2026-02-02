"use client";

import { useState } from "react";
import { Game, Score } from "@prisma/client";
import { SquareGrid } from "@/components/grid";
import { QuarterResults } from "@/components/game";
import { GridData, PlayWithSquares } from "@/lib/types";
import { formatCurrency } from "@/lib/game-utils";

type ClosedGameViewProps = {
  game: Game;
  gridData: GridData;
  plays: PlayWithSquares[];
  scores: Score[];
  pricePerSquare: number;
  xTeamName: string;
  yTeamName: string;
  xTeamLogo?: string;
  yTeamLogo?: string;
};

export function ClosedGameView({
  game,
  gridData,
  plays,
  scores,
  pricePerSquare,
  xTeamName,
  yTeamName,
  xTeamLogo,
  yTeamLogo,
}: ClosedGameViewProps) {
  const [highlightedPositions, setHighlightedPositions] = useState<Set<number>>(new Set());
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  // Create maps for position -> playerId and playerId -> positions
  const positionToPlayerId = new Map<number, string>();
  const playerIdToPositions = new Map<string, number[]>();

  for (const play of plays) {
    const positions = play.squares.map((s) => s.position);
    playerIdToPositions.set(play.id, positions);
    for (const pos of positions) {
      positionToPlayerId.set(pos, play.id);
    }
  }

  const handlePlayerClick = (playId: string) => {
    if (selectedPlayerId === playId) {
      // Deselect
      setSelectedPlayerId(null);
      setHighlightedPositions(new Set());
    } else {
      // Select
      setSelectedPlayerId(playId);
      const positions = playerIdToPositions.get(playId) ?? [];
      setHighlightedPositions(new Set(positions));
    }
  };

  const handleSquareClick = (position: number) => {
    const playerId = positionToPlayerId.get(position);
    if (playerId) {
      handlePlayerClick(playerId);
    }
  };

  return (
    <>
      {/* Grid and Quarter Results - side by side on large screens */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Grid */}
        <div className="flex-1 bg-base-200 rounded-xl p-2 sm:p-6">
          <SquareGrid
            gridData={gridData}
            showPositionNumbers
            xTeamName={xTeamName}
            yTeamName={yTeamName}
            xTeamLogo={xTeamLogo}
            yTeamLogo={yTeamLogo}
            highlightedPositions={highlightedPositions}
            onSquareClick={handleSquareClick}
          />
          {/* Legend */}
          <div className="mt-6 flex gap-4 flex-wrap justify-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gray-100 border border-gray-300 rounded-md"></div>
              <span className="text-base-content/70">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-blue-600 rounded-md"></div>
              <span className="text-base-content/70">Taken</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-emerald-500 rounded-md"></div>
              <span className="text-base-content/70">Winner</span>
            </div>
            {highlightedPositions.size > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-yellow-400 rounded-md"></div>
                <span className="text-base-content/70">Selected</span>
              </div>
            )}
          </div>
        </div>

        {/* Quarter Results */}
        <div className="lg:w-80 bg-base-200 rounded-xl p-4 sm:p-6">
          <h2 className="text-xl font-bold mb-4">Quarter Results</h2>
          <QuarterResults game={game} scores={scores} plays={plays} />
        </div>
      </div>

      {/* Players List */}
      <div className="bg-base-200 rounded-xl p-4 sm:p-6">
        <h2 className="text-xl font-bold mb-4">
          Players ({plays.length})
        </h2>
        {plays.length === 0 ? (
          <p className="text-base-content/60 text-center py-4">No players yet. Be the first to pick squares!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Squares</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {plays.map((play) => (
                  <tr
                    key={play.id}
                    className={`cursor-pointer hover:bg-base-300 transition-colors ${
                      selectedPlayerId === play.id ? "bg-yellow-100 hover:bg-yellow-200" : ""
                    }`}
                    onClick={() => handlePlayerClick(play.id)}
                  >
                    <td className="font-medium">
                      {play.firstName} {play.lastName}
                    </td>
                    <td className="text-base-content/70">
                      {play.squares.map((s) => s.position).join(", ")}
                    </td>
                    <td className="text-right font-medium">
                      {formatCurrency(play.squares.length * pricePerSquare)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
