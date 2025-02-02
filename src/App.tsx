import React, { useEffect, useState, useCallback } from 'react';
import { ChessGame } from './game/ChessGame';
import { ChessGameState } from './types/game';
import * as api from './services/api';
import { ChessBoard } from './components/ChessBoard';
import { PlayerInfo } from './components/PlayerInfo';
import { GameControls } from './components/GameControls';
import { MatchmakingScreen } from './components/MatchmakingScreen';
import { GameLayout } from './components/layout/GameLayout';
import { GameHeader } from './components/layout/GameHeader';
import { GameInfo } from './components/game/GameInfo';
import { Leaderboard } from './components/game/Leaderboard';
import { GameTimer } from './components/game/GameTimer';
import { MobileMenu } from './components/layout/MobileMenu';

function App() {
  const [currentPlayer, setCurrentPlayer] = useState<string>('');
  const [game, setGame] = useState<ChessGame | null>(null);
  const [gameState, setGameState] = useState<ChessGameState | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);

  const [username, setUsername] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMatchmaking, setIsMatchmaking] = useState(false);
  const [matchId, setMatchId] = useState<string | null>(null);
  const handleSquareClick = useCallback(async (square: string, moves?: string[]) => {
    console.log('handleSquareClick started:', { square, moves, selectedSquare, legalMoves });

    if (!game || !currentPlayer || !gameState) {
      console.log('Missing required state:', { game: !!game, currentPlayer, gameState: !!gameState });
      return;
    }

    const playerColor = gameState.gameState.players.white.playerId === currentPlayer ? 'white' :
      gameState.gameState.players.black.playerId === currentPlayer ? 'black' : null;
    
    console.log('Player color check:', { playerColor, currentTurn: gameState.gameState.currentTurn });
  
    if (!playerColor || gameState.gameState.currentTurn !== playerColor) {
      console.log('Turn validation failed:', { playerColor, currentTurn: gameState.gameState.currentTurn });
      return;
    }

    if (selectedSquare) {
      console.log('Processing with selected piece:', { selectedSquare, targetSquare: square, currentLegalMoves: legalMoves });

      if (square === selectedSquare) {
        console.log('Deselecting current piece');
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      if (legalMoves.includes(square)) {
        console.log('Making move:', { from: selectedSquare, to: square });
        try {
          const success = await game.makeMove({
            actionType: 'move',
            actionData: {
              actionType: 'move',
              from: selectedSquare,
              to: square,
              playerId: currentPlayer
            }
          });

          if (success) {
            setSelectedSquare(null);
            setLegalMoves([]);
          } else {
            setError('Failed to make move');
          }
        } catch (error) {
          console.error('Move execution error:', error);
          setError('Failed to make move');
        }
        return;
      }

      if (moves && moves.length > 0) {
        console.log('Selecting new piece:', { square, newMoves: moves });
        setSelectedSquare(square);
        setLegalMoves(moves);
        return;
      }

      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    if (moves && moves.length > 0) {
      console.log('Initial piece selection:', { square, moves });
      setSelectedSquare(square);
      setLegalMoves(moves);
      return;
    }

    setSelectedSquare(null);
    setLegalMoves([]);
}, [game, gameState, selectedSquare, legalMoves, currentPlayer, setError]);

  const handleLogin = async () => {
    try {
      setError(null);
      const authData = await api.authenticate(username);
      api.setAuthToken(authData.token);

      const playerData = await api.getCurrentPlayer();
      setCurrentPlayer(playerData.id); 

      setIsAuthenticated(true);

      const ticket = await api.createTicket();
      setIsMatchmaking(true);
      startMatchmaking(ticket.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start game');
    }
  };

  const startMatchmaking = (ticketId: string) => {
    if (game) {
      game.destroy();
      setGame(null);
    }

    const matchmakingInterval = setInterval(async () => {
      try {
        const matchId = await api.processMatchmaking(ticketId);

        if (matchId) {
          clearInterval(matchmakingInterval);
          setIsMatchmaking(false);
          setMatchId(matchId);

          await api.setPresence(matchId);

          // Wait for initial state before creating game
          const initialState = await api.getMatchState(matchId);
          if (initialState?.gameState.players.white.playerId &&
            initialState?.gameState.players.black.playerId) {
            const newGame = new ChessGame(matchId);
            newGame.updateState(initialState, currentPlayer);
            setGame(newGame);
            setGameState(initialState);
            startGameLoop(matchId, newGame);
          }
        }
      } catch (err) {
        clearInterval(matchmakingInterval);
        setIsMatchmaking(false);
        setError(err instanceof Error ? err.message : 'Failed to process matchmaking');
      }
    }, 2000);
  };

  const startGameLoop = (currentMatchId: string, gameInstance: ChessGame) => {
    let isCancelled = false;
    let delay = 500; // initial delay in ms
    const maxDelay = 5000; // maximum delay
  
    const poll = async () => {
      if (isCancelled) return;
  
      try {
        const state = await api.getMatchState(currentMatchId);
        if (state && state.gameState.players.white.playerId && state.gameState.players.black.playerId) {
          gameInstance.updateState(state, currentPlayer);
          const updatedState = gameInstance.getState();
          setGameState(updatedState);
          delay = 500; 
          console.log('Waiting for player IDs to be populated:', {
            white: state?.gameState.players.white.playerId,
            black: state?.gameState.players.black.playerId
          });
        }
      } catch (err) {
        console.error("Game loop error:", err);
        setError(err instanceof Error ? err.message : 'Failed to get match state');
        // Increase delay in case of an error
        delay = Math.min(delay * 2, maxDelay);
      }
  
      setTimeout(poll, delay);
    };
  
    poll();
  
    return () => { isCancelled = true; };
  };
  
  const renderGameContent = () => {
    const leftSidebar = (
      <div className="space-y-4 h-full flex flex-col">
        <GameInfo
          timeControl="10 min"
          gameType="Rapid"
          ratingRange="1500±200"
        />
        {gameState?.gameState.players?.black && (
          <PlayerInfo
            player={gameState.gameState.players.black}
            isCurrentTurn={gameState.gameState.currentTurn === 'black'}
          />
        )}
        <Leaderboard 
          players={[
            { username: "GrandMaster1", rating: 2400, wins: 150 },
            { username: "ChessWizard", rating: 2350, wins: 120 },
            { username: "QueenMaster", rating: 2300, wins: 110 },
            { username: "KnightRider", rating: 2250, wins: 90 },
            { username: "BishopKing", rating: 2200, wins: 85 }
          ]}
        />
      </div>
    );

    const rightSidebar = (
      <div className="space-y-4 h-full flex flex-col">
        {gameState?.gameState.players?.white && (
          <PlayerInfo
            player={gameState.gameState.players.white}
            isCurrentTurn={gameState.gameState.currentTurn === 'white'}
          />
        )}
        <div className="bg-[#1d1d1b] p-4 rounded-lg flex-1 flex flex-col">
          <h3 className="text-gray-200 font-medium mb-3">Move History</h3>
          <div className="flex-1 overflow-hidden hover:overflow-y-auto transition-all">
            {gameState?.gameState.moveHistory.map((move, index) => (
              <div key={index} className="flex gap-3 py-1">
                <span className="text-gray-500">{Math.floor(index/2) + 1}.</span>
                <span className="text-gray-200">{move}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    return (
      <>
        <GameLayout
          header={<GameHeader username={username} onExit={() => setIsAuthenticated(false)} />}
          leftSidebar={leftSidebar}
          mainContent={
            <div className="w-full max-w-[min(80vh,700px)] mx-auto">
              {isMatchmaking ? (
                <div className="text-center">
                  <div className="inline-block mb-4 p-4 rounded-full bg-blue-500/20">
                    <svg className="animate-spin h-8 w-8 text-blue-400" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                  <div className="text-xl font-medium text-gray-200">
                    Looking for opponent...
                  </div>
                </div>
              ) : gameState && (
                <div className="w-full max-w-[min(80vh,700px)] mx-auto space-y-4">
                  {/* Game Status Bar */}
                  <div className="bg-[#1d1d1b] p-2 rounded-lg flex items-center justify-between text-sm">
                    <span className="text-gray-400">Rapid • 10 min</span>
                    <span className="text-gray-200">
                      {gameState.gameState.players.black.username} vs {gameState.gameState.players.white.username}
                    </span>
                  </div>

                  {/* Mobile Black Timer */}
                  <div className="lg:hidden">
                    <GameTimer 
                      timeLeft={gameState.gameState.players.black.timeLeft}
                      isActive={gameState.gameState.currentTurn === 'black'}
                    />
                  </div>

                  <div className="relative aspect-square">
                    <ChessBoard
                      gameState={gameState}
                      onSquareClick={handleSquareClick}
                      selectedSquare={selectedSquare}
                      legalMoves={legalMoves}
                      game={game}
                      currentPlayer={currentPlayer}
                    />
                  </div>

                  {/* Mobile White Timer */}
                  <div className="lg:hidden">
                    <GameTimer 
                      timeLeft={gameState.gameState.players.white.timeLeft}
                      isActive={gameState.gameState.currentTurn === 'white'}
                    />
                  </div>

                  <GameControls
                    soundEnabled={soundEnabled}
                    onToggleSound={() => setSoundEnabled(!soundEnabled)}
                  />
                </div>
              )}
            </div>
          }
          rightSidebar={rightSidebar}
        />
        <MobileMenu leftSidebar={leftSidebar} rightSidebar={rightSidebar} />
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#2f2f2f]">
      {!isAuthenticated ? (
        <MatchmakingScreen
          username={username}
          onUsernameChange={(value) => setUsername(value)}
          onStart={handleLogin}
          error={error}
        />
      ) : renderGameContent()}
    </div>
  );
}

export default App;