"use client";

import { useState, useRef } from "react";
import { SelectableGrid } from "@/components/grid";
import { PlayerForm } from "@/components/game/PlayerForm";
import { SquareData, PlayWithSquares } from "@/lib/types";
import { formatCurrency } from "@/lib/game-utils";

type GamePageClientProps = {
  gameId: string;
  squares: SquareData[];
  plays: PlayWithSquares[];
  xTeamName: string;
  yTeamName: string;
  xTeamLogo?: string;
  yTeamLogo?: string;
  pricePerSquare: number;
  paymentLink?: string | null;
};

export function GamePageClient({
  gameId,
  squares,
  plays,
  xTeamName,
  yTeamName,
  xTeamLogo,
  yTeamLogo,
  pricePerSquare,
  paymentLink,
}: GamePageClientProps) {
  const [selectedPositions, setSelectedPositions] = useState<number[]>([]);
  const [highlightedPositions, setHighlightedPositions] = useState<Set<number>>(new Set());
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const modalRef = useRef<HTMLDialogElement>(null);
  const totalCost = selectedPositions.length * pricePerSquare;

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

  const openModal = () => {
    modalRef.current?.showModal();
  };

  const handlePlayerClick = (playId: string) => {
    if (selectedPlayerId === playId) {
      setSelectedPlayerId(null);
      setHighlightedPositions(new Set());
    } else {
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
      {/* Grid */}
      <div className="bg-base-200 rounded-xl p-2 sm:p-6 mb-8">
        <SelectableGrid
          gameId={gameId}
          squares={squares}
          maxSelections={10}
          onSelectionChange={setSelectedPositions}
          xTeamName={xTeamName}
          yTeamName={yTeamName}
          xTeamLogo={xTeamLogo}
          yTeamLogo={yTeamLogo}
          highlightedPositions={highlightedPositions}
          onTakenSquareClick={handleSquareClick}
        />
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

      {/* Floating Claim Bar */}
      {selectedPositions.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-base-100 border-t border-base-300 shadow-lg z-50">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div>
              <div className="font-bold">
                {selectedPositions.length} box{selectedPositions.length > 1 ? "es" : ""} selected
              </div>
              <div className="text-sm text-base-content/70">
                Total cost: {formatCurrency(totalCost)}
              </div>
            </div>
            <button onClick={openModal} className="btn btn-primary">
              Claim Squares
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <dialog ref={modalRef} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg mb-4">Your Information</h3>
          <PlayerForm
            gameId={gameId}
            selectedPositions={selectedPositions}
            pricePerSquare={pricePerSquare}
            paymentLink={paymentLink}
          />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
