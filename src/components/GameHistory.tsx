import React from 'react';

interface GameHistoryProps {
  moveHistory: string[];
  currentTurn: 'white' | 'black';
}

export function GameHistory({ moveHistory, currentTurn }: GameHistoryProps) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Move History</h3>
        <span className="text-sm text-gray-400">
          {currentTurn === 'white' ? "White to move" : "Black to move"}
        </span>
      </div>
      <div className="h-[200px] overflow-y-auto">
        {moveHistory.map((move, index) => (
          <div 
            key={index}
            className="flex gap-4 py-1 text-sm"
          >
            <span className="text-gray-500">{Math.floor(index / 2) + 1}.</span>
            <span>{move}</span>
          </div>
        ))}
      </div>
    </div>
  );
}