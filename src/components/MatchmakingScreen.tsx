import { Trophy, Clock, ChevronRight } from 'lucide-react';

interface MatchmakingScreenProps {
  username: string;
  onUsernameChange: (value: string) => void;
  onStart: () => void;
  error: string | null;
}

export function MatchmakingScreen({ username, onUsernameChange, onStart, error }: MatchmakingScreenProps) {
  return (
    <div className="min-h-screen bg-[#2f2f2f] flex flex-col md:flex-row">
      {/* Left side - Game modes */}
      <div className="md:w-80 bg-[#262421] md:border-r border-b md:border-b-0 border-gray-800">
        <div className="p-4 md:p-6">
          <h2 className="text-xl font-bold text-white/90 mb-4">Play Chess</h2>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
            <button className="w-full p-3 md:p-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-left group transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">10 min</div>
                  <div className="text-sm text-white/60">Rapid</div>
                </div>
                <ChevronRight className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
            <button className="w-full p-3 md:p-4 bg-gray-800/50 hover:bg-gray-800/70 rounded-lg text-left group transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">5 min</div>
                  <div className="text-sm text-white/60">Blitz</div>
                </div>
                <ChevronRight className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
            <button className="w-full p-3 md:p-4 bg-gray-800/50 hover:bg-gray-800/70 rounded-lg text-left group transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">1 min</div>
                  <div className="text-sm text-white/60">Bullet</div>
                </div>
                <ChevronRight className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Right side - Login */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">CHESS.IO</h1>
            <p className="text-white/60">Play chess online with random opponents</p>
          </div>

          {error && (
            <div className="mb-4 md:mb-6 p-3 md:p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-300 text-sm md:text-base">
              {error}
            </div>
          )}

          <div className="bg-[#1a1a1a] rounded-lg p-4 md:p-6 shadow-xl border border-gray-800">
            <input
              type="text"
              value={username}
              onChange={(e) => onUsernameChange(e.target.value)}
              placeholder="Enter username"
              className="w-full p-3 mb-3 md:mb-4 bg-gray-800/50 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-white"
            />
            <button
              onClick={onStart}
              className="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-white"
            >
              <Trophy size={18} />
              Play Now
            </button>
          </div>

          <div className="mt-4 md:mt-6 grid grid-cols-2 gap-3 md:gap-4">
            <div className="p-3 md:p-4 bg-[#1a1a1a] rounded-lg border border-gray-800">
              <div className="text-xl md:text-2xl font-bold text-white/90">1,532</div>
              <div className="text-xs md:text-sm text-white/60">Games Today</div>
            </div>
            <div className="p-3 md:p-4 bg-[#1a1a1a] rounded-lg border border-gray-800">
              <div className="text-xl md:text-2xl font-bold text-white/90">426</div>
              <div className="text-xs md:text-sm text-white/60">Players Online</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}