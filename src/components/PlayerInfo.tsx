import { Clock, User } from 'lucide-react';

interface PlayerInfoProps {
  player: any;
  isCurrentTurn: boolean;
}

export function PlayerInfo({ player, isCurrentTurn }: PlayerInfoProps) {
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`p-4 rounded-lg transition-colors ${
      isCurrentTurn ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-gray-800/50'
    }`}>
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <User size={24} className="text-white/80" />
          </div>
          {player.capturedPieces.length > 0 && (
            <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white rounded-full px-2 py-0.5 text-xs font-medium">
              +{player.capturedPieces.length}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-white/90">{player.username}</div>
          <div className="flex items-center gap-2 text-white/60">
            <Clock size={14} className="text-white/70" />
            <span className={isCurrentTurn ? 'text-blue-400 font-medium' : ''}>
              {formatTime(player.timeLeft)}
            </span>
          </div>
        </div>
      </div>
      {player.capturedPieces.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5 text-white/80">
          {player.capturedPieces.map((piece: string, index: number) => (
            <div key={index} className="text-sm">
              {piece}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}