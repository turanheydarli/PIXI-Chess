export interface ChessGameState {
  size: number;
  label: string;
  phase: string;
  status: string;
  metadata: {
    version: string;
    gameMode: string;
  };
  tickRate: number;
  gameState: {
    board: string[][];
    players: {
      white: {
        playerId: string;
        timeLeft: number;
        username: string;
        properties: {
          Id: string;
          User: any;
          GameId: string;
          Status: string;
          UserId: string;
          Username: string;
          CreatedAt: string;
          UpdatedAt: string;
          Attributes: any;
          DisplayName: string;
          AuthProvider: number;
        };
        capturedPieces: string[];
      };
      black: {
        playerId: string;
        timeLeft: number;
        username: string;
        properties: {
          Id: string;
          User: any;
          GameId: string;
          Status: string;
          UserId: string;
          Username: string;
          CreatedAt: string;
          UpdatedAt: string;
          Attributes: any;
          DisplayName: string;
          AuthProvider: number;
        };
        capturedPieces: string[];
      };
    };
    lastMove: {
      from: string;
      to: string;
      captured: boolean;
    } | null;
    gameStatus: 'active' | 'check' | 'checkmate' | 'draw';
    currentTurn: 'white' | 'black';
    moveHistory: string[];
  };
  presences: Array<{
    meta: Record<string, any>;
    mode: string;
    status: string;
    joinedAt: string;
    lastSeen: string;
    playerId: string;
    sessionId: string;
  }>;
  startedAt: string;
}

export interface ChessAction {
  actionType: 'move' | 'resign' | 'offerDraw' | 'acceptDraw';
  actionData: {
    actionType: string,
    from?: string;
    to?: string;
    promotion?: 'q' | 'r' | 'b' | 'n';
    playerId?: string;
  };
  playerId?: string;
}