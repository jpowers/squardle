"use client";

import { useState } from "react";
import { SquareData } from "@/lib/types";

type SquareCellProps = {
  square: SquareData;
  showNumbers?: boolean;
  isHighlighted?: boolean;
  onSquareClick?: (position: number) => void;
};

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function SquareCell({ square, showNumbers, isHighlighted, onSquareClick }: SquareCellProps) {
  const [isOpen, setIsOpen] = useState(false);

  const baseClasses =
    "aspect-square flex items-center justify-center rounded-md overflow-visible";

  const handleClick = () => {
    setIsOpen(!isOpen);
    if (square.taken && onSquareClick) {
      onSquareClick(square.position);
    }
  };

  if (square.isWinner) {
    return (
      <div
        className={`${baseClasses} ${isHighlighted ? "bg-yellow-400" : "bg-emerald-500"} tooltip tooltip-top cursor-pointer ${isOpen ? "tooltip-open" : ""} text-white text-[10px] sm:text-xs font-bold`}
        data-tip={`Q${square.winningQuarter} Winner: ${square.playerName}`}
        onClick={handleClick}
        onBlur={() => setIsOpen(false)}
        tabIndex={0}
      >
        Q{square.winningQuarter}
      </div>
    );
  }

  if (square.taken) {
    return (
      <div
        className={`${baseClasses} ${isHighlighted ? "bg-yellow-400" : "bg-blue-500"} tooltip tooltip-top cursor-pointer ${isOpen ? "tooltip-open" : ""} text-white text-[10px] sm:text-xs font-bold`}
        data-tip={square.playerName}
        onClick={handleClick}
        onBlur={() => setIsOpen(false)}
        tabIndex={0}
      >
        {getInitials(square.playerName)}
      </div>
    );
  }

  return (
    <div className={`${baseClasses} bg-gray-100 border border-gray-300`}>
      {showNumbers && (
        <span className="text-gray-500 text-[10px] sm:text-xs">{square.position}</span>
      )}
    </div>
  );
}
