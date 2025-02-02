interface GameHeaderProps {
  username: string;
  onExit: () => void;
}

export function GameHeader({ username, onExit }: GameHeaderProps) {
  return (
    <>
      <h1 className="text-xl font-bold text-blue-400">CHESS.IO</h1>
      <div className="flex items-center gap-4">
        <span className="text-gray-300 hidden sm:inline-block">
          Playing as <span className="text-blue-300 font-medium">{username}</span>
        </span>
        <button 
          onClick={onExit}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
        >
          Exit Game
        </button>
      </div>
    </>
  );
}