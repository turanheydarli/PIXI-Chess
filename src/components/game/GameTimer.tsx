import { Clock } from 'lucide-react';

interface GameTimerProps {
  timeLeft: number;
  isActive: boolean;
}

export function GameTimer({ timeLeft, isActive }: GameTimerProps) {
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${
      isActive ? 'bg-blue-500/20 text-blue-300' : 'bg-[#1d1d1b] text-white/80'
    }`}>
      <Clock size={20} className="text-inherit" />
      <span className="text-lg font-medium">{formatTime(timeLeft)}</span>
    </div>
  );
}