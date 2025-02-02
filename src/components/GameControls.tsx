import { Volume2, VolumeX, Flag, Handshake, RotateCcw, MessageSquare } from 'lucide-react';

interface GameControlsProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResign?: () => void;
  onOfferDraw?: () => void;
  onTakeback?: () => void;
}

export function GameControls({ 
  soundEnabled, 
  onToggleSound,
  onResign,
  onOfferDraw,
  onTakeback 
}: GameControlsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 p-4 bg-gray-800/50 rounded-lg">
        <button
          onClick={onToggleSound}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          title="Toggle Sound"
        >
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
        <button 
          onClick={onTakeback}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          title="Request Takeback"
        >
          <RotateCcw size={20} />
        </button>
        <button 
          onClick={onOfferDraw}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          title="Offer Draw"
        >
          <Handshake size={20} />
        </button>
        <button 
          onClick={onResign}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-red-500 hover:text-red-400"
          title="Resign"
        >
          <Flag size={20} />
        </button>
      </div>
      <div className="p-4 bg-gray-800/50 rounded-lg">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} />
          <span className="text-sm">Chat disabled during game</span>
        </div>
      </div>
    </div>
  );
}