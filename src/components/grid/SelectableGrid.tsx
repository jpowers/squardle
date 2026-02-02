"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SquareData } from "@/lib/types";
import {
  getPusherClient,
  getGameChannel,
  type SquaresTakenEvent,
} from "@/lib/pusher-client";

type SelectableGridProps = {
  gameId: string;
  squares: SquareData[];
  maxSelections?: number;
  onSelectionChange: (selectedPositions: number[]) => void;
  xTeamName?: string;
  yTeamName?: string;
  xTeamLogo?: string;
  yTeamLogo?: string;
  initialSelected?: number[];
  highlightedPositions?: Set<number>;
  onTakenSquareClick?: (position: number) => void;
};

function TeamLogo({ src, alt }: { src?: string; alt: string }) {
  if (src) {
    return <img src={src} alt={alt} className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />;
  }
  return (
    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-base-300 rounded-full flex items-center justify-center text-xs text-base-content/50">
      Logo
    </div>
  );
}

export function SelectableGrid({
  gameId,
  squares: initialSquares,
  maxSelections = 10,
  onSelectionChange,
  xTeamName,
  yTeamName,
  xTeamLogo,
  yTeamLogo,
  initialSelected = [],
  highlightedPositions,
  onTakenSquareClick,
}: SelectableGridProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<number>>(new Set(initialSelected));
  const [squares, setSquares] = useState<SquareData[]>(initialSquares);
  const [openTooltip, setOpenTooltip] = useState<number | null>(null);

  // Subscribe to real-time updates
  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(getGameChannel(gameId));

    channel.bind("squares-taken", (data: SquaresTakenEvent) => {
      setSquares((prev) =>
        prev.map((square) =>
          data.positions.includes(square.position)
            ? { ...square, taken: true, playerName: data.playerName }
            : square
        )
      );

      // Remove from selection if someone else took it
      setSelected((prev) => {
        const newSelected = new Set(prev);
        for (const pos of data.positions) {
          newSelected.delete(pos);
        }
        return newSelected;
      });
    });

    channel.bind("game-closed", () => {
      router.push(`/game/${gameId}`);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(getGameChannel(gameId));
    };
  }, [gameId, router]);

  // Notify parent when selection changes
  useEffect(() => {
    onSelectionChange(Array.from(selected));
  }, [selected, onSelectionChange]);

  const toggleSquare = (position: number) => {
    const square = squares.find((s) => s.position === position);
    if (!square || square.taken) return;

    const newSelected = new Set(selected);
    if (newSelected.has(position)) {
      newSelected.delete(position);
    } else {
      if (newSelected.size >= maxSelections) {
        return;
      }
      newSelected.add(position);
    }
    setSelected(newSelected);
  };

  const axisLabels = Array(10).fill("?");

  return (
    <div className="w-full max-w-2xl mx-auto overflow-x-auto">
      <div className="mb-4 flex gap-4 items-center justify-between">
        <span className="text-base sm:text-lg">
          Selected: <span className="font-bold text-primary">{selected.size}</span> / {maxSelections}
        </span>
        {selected.size > 0 && (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setSelected(new Set());
            }}
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex">
        {/* Y-axis team name and logo (rotated) - hidden on mobile */}
        {yTeamName && (
          <div className="hidden sm:flex items-center justify-center sm:w-16 flex-shrink-0">
            <div
              className="flex items-center gap-2"
              style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
            >
              <TeamLogo src={yTeamLogo} alt={yTeamName} />
              <span className="text-lg sm:text-xl font-bold text-[#69BE28] whitespace-nowrap">
                {yTeamName}
              </span>
            </div>
          </div>
        )}

        <div className="flex-1 min-w-[360px]">
          {/* X-axis team header - hidden on mobile */}
          {xTeamName && (
            <div className="hidden sm:flex items-center justify-center gap-2 mb-2 ml-[9.09%]">
              <TeamLogo src={xTeamLogo} alt={xTeamName} />
              <span className="text-lg sm:text-xl font-bold text-slate-800">{xTeamName}</span>
            </div>
          )}

          {/* 11x11 grid: 1 column for Y-axis + 10 columns for main grid */}
          <div className="grid grid-cols-11 grid-rows-11 gap-1">
            {/* Empty corner cell */}
            <div className="aspect-square"></div>

            {/* X-axis number cells (top row) */}
            {axisLabels.map((num, i) => (
              <div
                key={`x-${i}`}
                className="aspect-square flex items-center justify-center text-xs sm:text-sm font-bold bg-slate-800 text-white rounded-md"
              >
                {num}
              </div>
            ))}

            {/* Main grid rows with Y-axis labels */}
            {Array.from({ length: 10 }, (_, rowIndex) => (
              <React.Fragment key={`row-${rowIndex}`}>
                {/* Y-axis number cell */}
                <div className="aspect-square flex items-center justify-center text-xs sm:text-sm font-bold bg-[#69BE28] text-white rounded-md">
                  {axisLabels[rowIndex]}
                </div>

                {/* Row of 10 grid cells */}
                {squares.slice(rowIndex * 10, rowIndex * 10 + 10).map((square) => {
                  const isSelected = selected.has(square.position);
                  const isAvailable = !square.taken;

                  const getInitials = (name?: string): string => {
                    if (!name) return "?";
                    const parts = name.trim().split(/\s+/);
                    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
                    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
                  };

                  const isHighlighted = highlightedPositions?.has(square.position);

                  if (square.taken) {
                    return (
                      <div
                        key={square.position}
                        className={`aspect-square flex items-center justify-center rounded-md ${isHighlighted ? "bg-yellow-400" : "bg-blue-500"} tooltip tooltip-top cursor-pointer ${openTooltip === square.position ? "tooltip-open" : ""} text-white text-[10px] sm:text-xs font-bold`}
                        data-tip={square.playerName}
                        onClick={() => {
                          setOpenTooltip(openTooltip === square.position ? null : square.position);
                          onTakenSquareClick?.(square.position);
                        }}
                      >
                        {getInitials(square.playerName)}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={square.position}
                      className={`aspect-square flex items-center justify-center rounded-md cursor-pointer transition-all active:scale-95 select-none ${
                        isSelected
                          ? "bg-blue-300 text-blue-800 font-bold"
                          : "bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-500"
                      } text-[10px] sm:text-xs`}
                      onClick={() => toggleSquare(square.position)}
                    >
                      {square.position}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 flex gap-4 flex-wrap text-sm justify-center">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-100 border border-gray-300 rounded-md"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-blue-200 rounded-md"></div>
          <span>Your selection</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-blue-600 rounded-md"></div>
          <span>Taken</span>
        </div>
      </div>
    </div>
  );
}
