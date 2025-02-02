
module.exports.handler = async function (event, context) {
    try {
        const { matchId, playerId, action, state } = parseEventBody(decodeEventBody(event));

        const { from, to } = action;
        
        // Initialize gameState if it's a string
        if (typeof state.gameState === 'string') {
            state.gameState = JSON.parse(state.gameState);
        }

        // Validate player's turn
        const playerColor = state.gameState.players.white.playerId === playerId ? 'white' : 'black';
        if (state.gameState.currentTurn !== playerColor) {
            return createErrorResponse("Not your turn");
        }

        // Get piece positions
        const [fromFile, fromRank] = from.split('');
        const [toFile, toRank] = to.split('');
        
        const fromX = fromFile.charCodeAt(0) - 'a'.charCodeAt(0);
        const fromY = 8 - parseInt(fromRank);
        const toX = toFile.charCodeAt(0) - 'a'.charCodeAt(0);
        const toY = 8 - parseInt(toRank);

        // Get pieces
        const piece = state.gameState.board[fromY][fromX];
        const targetPiece = state.gameState.board[toY][toX];

        // Validate piece ownership
        const isWhitePiece = piece === piece.toUpperCase();
        if ((isWhitePiece && playerColor !== 'white') ||
            (!isWhitePiece && playerColor !== 'black')) {
            return createErrorResponse("Not your piece");
        }

        // Make the move
        if (targetPiece) {
            state.gameState.players[playerColor].capturedPieces.push(targetPiece);
        }

        // Update board
        state.gameState.board[fromY][fromX] = '';
        state.gameState.board[toY][toX] = piece;

        // Update game state
        state.gameState.currentTurn = playerColor === 'white' ? 'black' : 'white';
        state.gameState.lastMove = { from, to, captured: !!targetPiece };
        state.gameState.moveHistory.push(`${piece}${from}-${to}`);

        return createSuccessResponse({
            ...state,
            gameState: state.gameState
        });
    } catch (error) {
        console.error('Error in handler:', error);
        return createErrorResponse(error.message);
    }
};

function getPieceShape(type, rotation) {
    const shapes = {
        1: [ // T
            [[1,1,1],
             [0,1,0]],
            [[0,1],
             [1,1],
             [0,1]],
            [[0,1,0],
             [1,1,1]],
            [[1,0],
             [1,1],
             [1,0]]
        ],
        2: [ // I
            [[1,1,1,1]],
            [[1],
             [1],
             [1],
             [1]],
            [[1,1,1,1]],
            [[1],
             [1],
             [1],
             [1]]
        ],
        3: [ // O
            [[1,1],
             [1,1]],
            [[1,1],
             [1,1]],
            [[1,1],
             [1,1]],
            [[1,1],
             [1,1]]
        ],
        4: [ // L
            [[1,1,1],
             [1,0,0]],
            [[1,1],
             [0,1],
             [0,1]],
            [[0,0,1],
             [1,1,1]],
            [[1,0],
             [1,0],
             [1,1]]
        ],
        5: [ // J
            [[1,1,1],
             [0,0,1]],
            [[0,1],
             [0,1],
             [1,1]],
            [[1,0,0],
             [1,1,1]],
            [[1,1],
             [1,0],
             [1,0]]
        ],
        6: [ // S
            [[0,1,1],
             [1,1,0]],
            [[1,0],
             [1,1],
             [0,1]],
            [[0,1,1],
             [1,1,0]],
            [[1,0],
             [1,1],
             [0,1]]
        ],
        7: [ // Z
            [[1,1,0],
             [0,1,1]],
            [[0,1],
             [1,1],
             [1,0]],
            [[1,1,0],
             [0,1,1]],
            [[0,1],
             [1,1],
             [1,0]]
        ]
    };
    
    return shapes[type][rotation % 4];
}


function isValidMove(field, pieceType, position, rotation) {
    const shape = getPieceShape(pieceType, rotation);
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
                const fieldX = position.x + x;
                const fieldY = position.y + y;
                if (fieldX < 0 || fieldX >= 10 || fieldY >= 22 || (fieldY >= 0 && field[fieldY][fieldX] !== 0)) {
                    return false;
                }
            }
        }
    }
    return true;
}

function checkCompletedLines(field) {
    const completedLines = [];
    for (let y = 0; y < field.length; y++) {
        if (field[y].every(cell => cell !== 0)) {
            completedLines.push(y);
        }
    }
    return completedLines;
}

function removeCompletedLines(field, lines) {
    lines.sort((a, b) => a - b);
    for (const line of lines) {
        field.splice(line, 1);
        field.unshift(Array(10).fill(0));
    }
}

function calculateScore(lineCount) {
    const scores = {
        1: 100,
        2: 300,
        3: 500,
        4: 800
    };
    return scores[lineCount] || 0;
}

function decodeEventBody(event) {
    if (typeof event === 'string') {
        return JSON.parse(event);
    }
    
    if (event.body) {
        if (event.isBase64Encoded) {
            const decodedBody = Buffer.from(event.body, 'base64').toString('utf8');
            return JSON.parse(decodedBody);
        }
        return JSON.parse(event.body);
    }
    
    return event;
}


function createSuccessResponse(data) {
    return {
        body: JSON.stringify({
            isSuccess: true,
            data,
            errorMessage: null
        })
    };
}

function createErrorResponse(errorMessage) {
    return {
        body: JSON.stringify({
            isSuccess: false,
            data: null,
            errorMessage
        })
    };
}

function parseEventBody(event) {
    if (!event?.matchId || !event?.playerId || !event?.action || !event?.state) {
        throw new Error("Missing required fields");
    }
    return event;
}