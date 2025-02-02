import { Trophy } from 'lucide-react';

interface LeaderboardPlayer {
  username: string;
  rating: number;
  wins: number;
}

interface LeaderboardProps {
  players: LeaderboardPlayer[];
}

export function Leaderboard({ players }: LeaderboardProps) {
  return (
    <div className="bg-[#1d1d1b] p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <Trophy size={18} className="text-yellow-500" />
        <h3 className="text-gray-200 font-medium">Top Players</h3>
      </div>
      <div className="space-y-2 overflow-hidden">
        {players.slice(0, 5).map((player, index) => (
          <div key={index} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <span className="text-gray-400 w-4">{index + 1}</span>
              <span className="text-gray-200">{player.username}</span>
            </div>
            <span className="text-gray-400">{player.rating}</span>
          </div>
        ))}
      </div>
    </div>
  );
}