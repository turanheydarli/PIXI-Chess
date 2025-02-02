import { ChessGameState, ChessAction } from '../types/game';
import * as api from '../services/api';

export class ChessGame {
  private matchId: string;
  private state: ChessGameState;
  private isDestroyed: boolean = false;
  private cleanupCallbacks: (() => void)[] = [];
  private currentPlayerId: string = '';

  constructor(matchId: string) {
    this.matchId = matchId;
    this.state = this.getInitialState();
    this.initializeControls();
  }

  private initializeControls() {
    // Add keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      if (this.isDestroyed) return;
      
      switch (e.key) {
        case 'z':
          // Handle take back request
          break;
        case 'Escape':
          // Handle menu or pause
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    this.cleanupCallbacks.push(() => window.removeEventListener('keydown', handleKeyDown));
  }

  private getInitialState(): ChessGameState {
    return {
      size: 2,
      label: 'standard',
      phase: 'Playing',
      status: 'Ready',
      metadata: {
        version: '1.0',
        gameMode: 'standard'
      },
      tickRate: 10,
      gameState: {
        board: [
          ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
          ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
          Array(8).fill(''),
          Array(8).fill(''),
          Array(8).fill(''),
          Array(8).fill(''),
          ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
          ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
        ],
        players: {
          white: {
            playerId: '',
            timeLeft: 600000,
            username: '',
            properties: {
              Id: '',
              User: null,
              GameId: '',
              Status: 'Online',
              UserId: '',
              Username: '',
              CreatedAt: new Date().toISOString(),
              UpdatedAt: new Date().toISOString(),
              Attributes: null,
              DisplayName: '',
              AuthProvider: 3
            },
            capturedPieces: []
          },
          black: {
            playerId: '',
            timeLeft: 600000,
            username: '',
            properties: {
              Id: '',
              User: null,
              GameId: '',
              Status: 'Online',
              UserId: '',
              Username: '',
              CreatedAt: new Date().toISOString(),
              UpdatedAt: new Date().toISOString(),
              Attributes: null,
              DisplayName: '',
              AuthProvider: 3
            },
            capturedPieces: []
          }
        },
        lastMove: null,
        gameStatus: 'active',
        currentTurn: 'white',
        moveHistory: []
      },
      presences: [],
      startedAt: new Date().toISOString()
    };
  }

  getLegalMoves(square: string, playerId: string): string[] {
    // Validate player ID first
    if (!playerId) {
      console.error('No player ID provided to getLegalMoves');
      return [];
    }

    // Validate that the player ID matches either white or black player
    const whiteId = this.state.gameState.players.white.playerId;
    const blackId = this.state.gameState.players.black.playerId;
    
    let playerColor: 'white' | 'black';
    if (whiteId === playerId) {
      playerColor = 'white';
    } else if (blackId === playerId) {
      playerColor = 'black';
    } else {
      console.error('Invalid player ID:', playerId, 'White:', whiteId, 'Black:', blackId);
      return [];
    }

    // Store the current player ID
    this.currentPlayerId = playerId;

    // Add board state logging
    console.log('Current board state:', {
        board: this.state.gameState.board,
        square,
        piece: this.getPieceAtSquare(square)
    });

    // Add detailed turn logging
    console.log('Turn details:', {
        currentTurn: this.state.gameState.currentTurn,
        currentTurnPlayerId: this.state.gameState.players[this.state.gameState.currentTurn].playerId,
        attemptingPlayerId: playerId,
        whiteId: this.state.gameState.players.white.playerId,
        blackId: this.state.gameState.players.black.playerId,
        square
    });

    // Fix player color determination

    if (this.state.gameState.players.white.playerId === playerId) {
      playerColor = 'white';
    } else if (this.state.gameState.players.black.playerId === playerId) {
      playerColor = 'black';
    } else {
      console.error('Player ID not found in either white or black');
      return [];
    }

    // Log turn validation
    console.log('Turn validation:', {
      playerColor,
      currentTurn: this.state.gameState.currentTurn,
      isPlayersTurn: this.state.gameState.currentTurn === playerColor
    });

    if (this.state.gameState.currentTurn !== playerColor) return [];

    const [file, rank] = square.split('');
    const x = file.charCodeAt(0) - 'a'.charCodeAt(0);
    const y = 8 - parseInt(rank);
    
    const piece = this.state.gameState.board[y][x];
    if (!piece) return [];
    
    const isWhitePiece = piece === piece.toUpperCase();
    if ((isWhitePiece && playerColor !== 'white') ||
        (!isWhitePiece && playerColor !== 'black')) {
      return [];
    }

    const moves: string[] = [];
    const pieceType = piece.toLowerCase();

    switch (pieceType) {
      case 'p': // Pawn
        const direction = isWhitePiece ? -1 : 1;
        const startRank = isWhitePiece ? 6 : 1;

        // Forward move
        if (y + direction >= 0 && y + direction < 8 && !this.state.gameState.board[y + direction][x]) {
          moves.push(`${String.fromCharCode('a'.charCodeAt(0) + x)}${8 - (y + direction)}`);
          
          // Double move from starting position
          if (y === startRank && !this.state.gameState.board[y + 2 * direction][x]) {
            moves.push(`${String.fromCharCode('a'.charCodeAt(0) + x)}${8 - (y + 2 * direction)}`);
          }
        }

        // Captures
        for (const dx of [-1, 1]) {
          const newX = x + dx;
          const newY = y + direction;
          if (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
            const targetPiece = this.state.gameState.board[newY][newX];
            if (targetPiece && isWhitePiece !== (targetPiece === targetPiece.toUpperCase())) {
              moves.push(`${String.fromCharCode('a'.charCodeAt(0) + newX)}${8 - newY}`);
            }
          }
        }
        break;

      case 'r': // Rook
        for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
          let newX = x + dx;
          let newY = y + dy;
          while (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
            const targetPiece = this.state.gameState.board[newY][newX];
            if (!targetPiece) {
              moves.push(`${String.fromCharCode('a'.charCodeAt(0) + newX)}${8 - newY}`);
            } else {
              if (isWhitePiece !== (targetPiece === targetPiece.toUpperCase())) {
                moves.push(`${String.fromCharCode('a'.charCodeAt(0) + newX)}${8 - newY}`);
              }
              break;
            }
            newX += dx;
            newY += dy;
          }
        }
        break;

      case 'n': // Knight
        const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
        for (const [dx, dy] of knightMoves) {
          const newX = x + dx;
          const newY = y + dy;
          if (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
            const targetPiece = this.state.gameState.board[newY][newX];
            if (!targetPiece || isWhitePiece !== (targetPiece === targetPiece.toUpperCase())) {
              moves.push(`${String.fromCharCode('a'.charCodeAt(0) + newX)}${8 - newY}`);
            }
          }
        }
        break;

      case 'b': // Bishop
        for (const [dx, dy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
          let newX = x + dx;
          let newY = y + dy;
          while (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
            const targetPiece = this.state.gameState.board[newY][newX];
            if (!targetPiece) {
              moves.push(`${String.fromCharCode('a'.charCodeAt(0) + newX)}${8 - newY}`);
            } else {
              if (isWhitePiece !== (targetPiece === targetPiece.toUpperCase())) {
                moves.push(`${String.fromCharCode('a'.charCodeAt(0) + newX)}${8 - newY}`);
              }
              break;
            }
            newX += dx;
            newY += dy;
          }
        }
        break;

      case 'q': // Queen (combination of rook and bishop moves)
        for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
          let newX = x + dx;
          let newY = y + dy;
          while (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
            const targetPiece = this.state.gameState.board[newY][newX];
            if (!targetPiece) {
              moves.push(`${String.fromCharCode('a'.charCodeAt(0) + newX)}${8 - newY}`);
            } else {
              if (isWhitePiece !== (targetPiece === targetPiece.toUpperCase())) {
                moves.push(`${String.fromCharCode('a'.charCodeAt(0) + newX)}${8 - newY}`);
              }
              break;
            }
            newX += dx;
            newY += dy;
          }
        }
        break;

      case 'k': // King
        for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
          const newX = x + dx;
          const newY = y + dy;
          if (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
            const targetPiece = this.state.gameState.board[newY][newX];
            if (!targetPiece || isWhitePiece !== (targetPiece === targetPiece.toUpperCase())) {
              moves.push(`${String.fromCharCode('a'.charCodeAt(0) + newX)}${8 - newY}`);
            }
          }
        }
        break;
    }

    // Log calculated moves before returning
    console.log('Calculated moves:', {
        piece: pieceType,
        moves,
        isWhitePiece,
        playerColor
    });

    return moves;
  }

  isValidMove(from: string, to: string): boolean {
    return this.getLegalMoves(from, this.currentPlayerId).includes(to);
  }

  async makeMove(action: ChessAction): Promise<boolean> {
    // Validate player ID first
    if (!action.actionData.playerId) {
      console.error('No player ID provided for move');
      return false;
    }

    // Set current player ID before validation
    this.currentPlayerId = action.actionData.playerId;

    try {
      // Validate move before submitting
      if (!this.isValidMove(action.actionData.from!, action.actionData.to!)) {
        console.error('Invalid move attempt');
        return false;
      }

      // Submit move to server
      const response = await api.submitMove(this.matchId, {
        actionType: 'move',
        actionData: {
        actionType: 'move',
          from: action.actionData.from,
          to: action.actionData.to,
          playerId: this.currentPlayerId,
          promotion: action.actionData.promotion
        }
      });

      return response.isSuccess;
    } catch (err) {
      console.error('Failed to submit move:', err);
      return false;
    }
  }

  public updateState(state: ChessGameState, playerId: string) {
    if (this.isDestroyed || !state) return;

    // Validate and update player ID
    if (playerId) {
      const whiteId = state.gameState.players.white.playerId;
      const blackId = state.gameState.players.black.playerId;
      
      if (playerId === whiteId || playerId === blackId) {
        this.currentPlayerId = playerId;
        console.log('Updated currentPlayerId:', playerId);
      } else {
        console.error('Invalid player ID in updateState:', playerId);
      }
    }

    // Rest of the state update remains the same
    if (state.gameState) {
      this.state = {
        size: state.size,
        label: state.label,
        phase: state.phase,
        status: state.status,
        metadata: state.metadata,
        tickRate: state.tickRate,
        gameState: {
          board: state.gameState.board,
          players: {
            white: {
              playerId: state.gameState.players.white.playerId,
              timeLeft: state.gameState.players.white.timeLeft,
              username: state.gameState.players.white.username,
              properties: {
                ...state.gameState.players.white.properties
              },
              capturedPieces: state.gameState.players.white.capturedPieces
            },
            black: {
              playerId: state.gameState.players.black.playerId,
              timeLeft: state.gameState.players.black.timeLeft,
              username: state.gameState.players.black.username,
              properties: {
                ...state.gameState.players.black.properties
              },
              capturedPieces: state.gameState.players.black.capturedPieces
            }
          },
          currentTurn: state.gameState.currentTurn,
          gameStatus: state.gameState.gameStatus,
          moveHistory: state.gameState.moveHistory,
          lastMove: state.gameState.lastMove
        },
        presences: state.presences,
        startedAt: state.startedAt
      };
    }
  }

  private getPieceAtSquare(square: string): string {
    const [file, rank] = square.split('');
    const x = file.charCodeAt(0) - 'a'.charCodeAt(0);
    const y = 8 - parseInt(rank);
    return this.state.gameState.board[y][x];
  }

  public destroy() {
    if (this.isDestroyed) return;

    this.cleanupCallbacks.forEach(callback => callback());
    this.isDestroyed = true;
  }

  getState(): ChessGameState {
    return { ...this.state };
  }

  // Add getter for current player ID if needed
  public getCurrentPlayerId(): string {
    return this.currentPlayerId;
  }
}