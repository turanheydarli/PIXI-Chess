interface GameInfoProps {
  timeControl: string;
  gameType: string;
  ratingRange: string;
}

export function GameInfo({ timeControl, gameType, ratingRange }: GameInfoProps) {
  return (
    <div className="bg-[#1d1d1b] p-4 rounded-lg">
      <h3 className="text-gray-200 font-medium mb-3">Game Info</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Time Control</span>
          <span className="text-gray-200">{timeControl}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Game Type</span>
          <span className="text-gray-200">{gameType}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Rating Range</span>
          <span className="text-gray-200">{ratingRange}</span>
        </div>
      </div>
    </div>
  );
}