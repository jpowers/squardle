"use client";

import { useState } from "react";
import { SelectableGrid } from "@/components/grid/SelectableGrid";
import { PlayerForm } from "@/components/game/PlayerForm";
import { SquareData } from "@/lib/types";

type PlayPageClientProps = {
  gameId: string;
  squares: SquareData[];
  pricePerSquare: number;
  paymentLink?: string | null;
  xTeamName: string;
  yTeamName: string;
  initialSelectedSquares?: number[];
};

export function PlayPageClient({
  gameId,
  squares,
  pricePerSquare,
  paymentLink,
  xTeamName,
  yTeamName,
  initialSelectedSquares = [],
}: PlayPageClientProps) {
  // Filter out any pre-selected squares that are already taken
  const takenPositions = new Set(squares.filter(s => s.taken).map(s => s.position));
  const validInitialSelection = initialSelectedSquares.filter(pos => !takenPositions.has(pos));

  const [selectedPositions, setSelectedPositions] = useState<number[]>(validInitialSelection);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center">
          Tap squares to select (max 10)
        </h2>
        <SelectableGrid
          gameId={gameId}
          squares={squares}
          maxSelections={10}
          onSelectionChange={setSelectedPositions}
          xTeamName={xTeamName}
          yTeamName={yTeamName}
          initialSelected={validInitialSelection}
        />
      </div>

      <div className="max-w-md mx-auto">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Your Information</h2>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body p-4 sm:p-6">
            <PlayerForm
              gameId={gameId}
              selectedPositions={selectedPositions}
              pricePerSquare={pricePerSquare}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
