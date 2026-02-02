import React from "react";
import { GridData } from "@/lib/types";
import { SquareCell } from "./SquareCell";

type SquareGridProps = {
  gridData: GridData;
  showPositionNumbers?: boolean;
  xTeamName?: string;
  yTeamName?: string;
  xTeamLogo?: string;
  yTeamLogo?: string;
  highlightedPositions?: Set<number>;
  onSquareClick?: (position: number) => void;
};

function TeamLogo({ src, alt }: { src?: string; alt: string }) {
  if (src) {
    return <img src={src} alt={alt} className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />;
  }
  // Placeholder
  return (
    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-base-300 rounded-full flex items-center justify-center text-xs text-base-content/50">
      Logo
    </div>
  );
}

export function SquareGrid({
  gridData,
  showPositionNumbers = false,
  xTeamName,
  yTeamName,
  xTeamLogo,
  yTeamLogo,
  highlightedPositions,
  onSquareClick,
}: SquareGridProps) {
  const { squares, xNumbers, yNumbers } = gridData;
  const xLabels = xNumbers ?? Array(10).fill("?");
  const yLabels = yNumbers ?? Array(10).fill("?");

  return (
    <div className="w-full max-w-2xl mx-auto overflow-x-auto">
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
            {xLabels.map((num, i) => (
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
                  {yLabels[rowIndex]}
                </div>

                {/* Row of 10 grid cells */}
                {squares.slice(rowIndex * 10, rowIndex * 10 + 10).map((square) => (
                  <SquareCell
                    key={square.position}
                    square={square}
                    showNumbers={showPositionNumbers && !square.taken}
                    isHighlighted={highlightedPositions?.has(square.position)}
                    onSquareClick={onSquareClick}
                  />
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
