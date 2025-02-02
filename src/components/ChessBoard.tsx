import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { ChessGameState } from '../types/game';
import { ChessGame } from '../game/ChessGame';

interface ChessBoardProps {
  gameState: ChessGameState;
  onSquareClick: (square: string, moves?: string[]) => void;
  selectedSquare: string | null;
  legalMoves: string[];
  game: ChessGame | null;
  currentPlayer: string;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({ 
  gameState, 
  onSquareClick, 
  selectedSquare, 
  legalMoves,
  game,
  currentPlayer
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const texturesRef = useRef<{ [key: string]: PIXI.Texture }>({});
  const onSquareClickRef = useRef(onSquareClick);

  useEffect(() => {
    onSquareClickRef.current = onSquareClick;
  }, [onSquareClick]);
 
  useEffect(() => {
    if (!containerRef.current) return;

    const app = new PIXI.Application({
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientWidth,
      backgroundColor: 0x312E2B,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
    });

    const view = app.view as HTMLCanvasElement;
    view.style.width = '100%';
    view.style.height = '100%';
    containerRef.current.appendChild(view);

    appRef.current = app;

    // Create a container to hold the board, pieces, and highlights.
    const gameContainer = new PIXI.Container();
    gameContainer.name = 'gameContainer';
    app.stage.addChild(gameContainer);

    // Generate piece textures
    const pieces = ['K', 'Q', 'R', 'B', 'N', 'P', 'k', 'q', 'r', 'b', 'n', 'p'];
    pieces.forEach(piece => {
      const graphics = new PIXI.Graphics();
      const isWhite = piece === piece.toUpperCase();
      
      graphics.beginFill(isWhite ? 0xFFFFFF : 0x000000);
      graphics.lineStyle(3, isWhite ? 0x000000 : 0xFFFFFF, 1);
      graphics.drawCircle(32, 32, 28);
      graphics.endFill();
      
      const text = new PIXI.Text(piece, {
        fontFamily: 'Arial',
        fontSize: 44,
        fontWeight: 'bold',
        fill: isWhite ? 0x000000 : 0xFFFFFF,
        align: 'center'
      });
      text.anchor.set(0.5);
      text.position.set(32, 32);
      
      graphics.addChild(text);
      texturesRef.current[piece] = app.renderer.generateTexture(graphics);
    });

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current || !app) return;
      const newWidth = containerRef.current.clientWidth;
      app.renderer.resize(newWidth, newWidth);
      drawBoard();
      updatePieces();
    };

    window.addEventListener('resize', handleResize);
    drawBoard();
    updatePieces();

    return () => {
      window.removeEventListener('resize', handleResize);
      appRef.current?.destroy(true);
      appRef.current = null;
    };
  }, []); // runs only once on mount

  useEffect(() => {
    if (appRef.current) {
      updatePieces();
    }
  }, [gameState, selectedSquare, legalMoves]);

  useEffect(() => {
    console.log('State updated:', {
      selectedSquare,
      legalMoves,
      hasGame: !!game
    });
  }, [selectedSquare, legalMoves, game]);

  // DRAWING THE BOARD (Squares)
  const drawBoard = () => {
    if (!appRef.current) return;
  
    const app = appRef.current;
    const boardSize = app.screen.width;
    const squareSize = boardSize / 8;
    const gameContainer = app.stage.getChildByName('gameContainer') as PIXI.Container;
    if (!gameContainer) return;
  
    // Remove any previous board
    const existingBoard = gameContainer.getChildByName('board');
    if (existingBoard) {
      gameContainer.removeChild(existingBoard);
    }
  
    const board = new PIXI.Container();
    board.name = 'board';
  
    // Determine if we should flip the board for black
    const shouldFlipBoard = gameState?.gameState.players.black.playerId === currentPlayer;
  
    // Iterate over board squares using the underlying (white‑oriented) indices.
    // For display, reverse the order if the board should be flipped.
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        // Compute display indices
        const displayFile = shouldFlipBoard ? 7 - file : file;
        const displayRank = shouldFlipBoard ? 7 - rank : rank;
  
        const square = new PIXI.Graphics();
        // Choose color based on the sum of the original indices
        const isLight = (rank + file) % 2 === 0;
        square.beginFill(isLight ? 0xEEEED2 : 0x769656);
        square.drawRect(displayFile * squareSize, displayRank * squareSize, squareSize, squareSize);
        square.endFill();
  
        square.eventMode = 'static';
        square.cursor = 'pointer';
  
        square.on('mouseover', () => {
          square.alpha = 0.85;
        });
  
        square.on('mouseout', () => {
          square.alpha = 1;
        });
  
        // Use the board’s indices (which are in white’s perspective) to compute the square name.
        square.on('pointerdown', () => {
          const letter = String.fromCharCode(97 + file);  // file 0 -> 'a', etc.
          const number = 8 - rank; // rank 0 -> 8, rank 7 -> 1
          const squareName = `${letter}${number}`;
          onSquareClickRef.current(squareName, undefined);
        });
  
        board.addChild(square);
      }
    }
  
    gameContainer.addChild(board);
  };

  // DRAWING PIECES AND HIGHLIGHTS
  const updatePieces = () => {
    if (!appRef.current || !gameState) return;
  
    const app = appRef.current;
    const boardSize = app.screen.width;
    const squareSize = boardSize / 8;
    const gameContainer = app.stage.getChildByName('gameContainer') as PIXI.Container;
    if (!gameContainer) return;
  
    // Get or create the container for pieces.
    let piecesContainer = gameContainer.getChildByName('pieces') as PIXI.Container;
    if (!piecesContainer) {
      piecesContainer = new PIXI.Container();
      piecesContainer.name = 'pieces';
      gameContainer.addChild(piecesContainer);
    }
    piecesContainer.removeChildren();
  
    // Determine if we should flip the board.
    const shouldFlipBoard = gameState.gameState.players.black.playerId === currentPlayer;
  
    // Iterate over the board array (always in white’s perspective)
    gameState.gameState.board.forEach((row, rank) => {
      row.forEach((piece, file) => {
        if (!piece) return;
  
        // Compute display position.
        const displayFile = shouldFlipBoard ? 7 - file : file;
        const displayRank = shouldFlipBoard ? 7 - rank : rank;
        const x = displayFile * squareSize;
        const y = displayRank * squareSize;
  
        const sprite = new PIXI.Sprite(texturesRef.current[piece]);
        sprite.width = sprite.height = squareSize;
        sprite.x = x;
        sprite.y = y;
  
        // Do not apply an extra rotation since the display flip is handled by position.
        sprite.eventMode = 'static';
        sprite.cursor = 'pointer';
        sprite.interactive = true;
  
        sprite.on('pointerdown', async (event) => {
          // Use the underlying indices to compute the square name.
          const letter = String.fromCharCode(97 + file);
          const number = 8 - rank;
          const squareName = `${letter}${number}`;
  
          // Check if it’s the correct side to move.
          const isPieceWhite = piece === piece.toUpperCase();
          if (
            game && 
            ((isPieceWhite && gameState.gameState.currentTurn === 'white' && gameState.gameState.players.white.playerId === currentPlayer) || 
             (!isPieceWhite && gameState.gameState.currentTurn === 'black' && gameState.gameState.players.black.playerId === currentPlayer))
          ) {
            event.stopPropagation();
            const moves = await game.getLegalMoves(squareName, currentPlayer);
            onSquareClickRef.current(squareName, moves);
          }
        });
  
        piecesContainer.addChild(sprite);
      });
    });
  
    // Update highlights for the selected square and legal moves.
    // We use the same mapping as in drawBoard (using underlying indices).
    let highlightsContainer = gameContainer.getChildByName('highlights') as PIXI.Container;
    if (highlightsContainer) {
      gameContainer.removeChild(highlightsContainer);
    }
    highlightsContainer = new PIXI.Container();
    highlightsContainer.name = 'highlights';
    gameContainer.addChild(highlightsContainer);
  
    if (selectedSquare || legalMoves.length > 0) {
      if (selectedSquare) {
        // Extract the file and rank from the selected square (e.g., 'e4')
        const [fileChar, rankChar] = selectedSquare.split('');
        // Convert to the underlying board indices.
        const file = fileChar.charCodeAt(0) - 97;
        const rank = 8 - parseInt(rankChar);
        const highlight = new PIXI.Graphics();
        // Draw highlight at the display position.
        const displayFile = shouldFlipBoard ? 7 - file : file;
        const displayRank = shouldFlipBoard ? 7 - rank : rank;
        highlight.beginFill(0xF7D434, 0.5);
        highlight.drawRect(displayFile * squareSize, displayRank * squareSize, squareSize, squareSize);
        highlight.endFill();
        highlightsContainer.addChild(highlight);
      }
  
      legalMoves.forEach(move => {
        const [fileChar, rankChar] = move.split('');
        const file = fileChar.charCodeAt(0) - 97;
        const rank = 8 - parseInt(rankChar);
        const displayFile = shouldFlipBoard ? 7 - file : file;
        const displayRank = shouldFlipBoard ? 7 - rank : rank;
        const highlight = new PIXI.Graphics();
        highlight.beginFill(0x7BAF3B, 0.5);
        highlight.drawCircle(
          displayFile * squareSize + squareSize / 2,
          displayRank * squareSize + squareSize / 2,
          squareSize / 4
        );
        highlight.endFill();
        highlightsContainer.addChild(highlight);
      });
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full relative"
      style={{ 
        aspectRatio: '1/1',
        maxWidth: '100%',
        maxHeight: '100vh'
      }}
    />
  );
};
