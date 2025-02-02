module.exports.handler = async function (event, context) {
    try {
        const { state, action, playerId, matchId, rules } = parseEventBody(decodeEventBody(event));

        // Initialize or get gameState from the match state
        if (!state.gameState) {
            return createErrorResponse("Invalid game state");
        }

        // Handle chess actions
        // In the switch statement
        switch (action.actionType) {
            case "move":
                handleMove(state, action, playerId);  // Changed from action.actionData to action
                break;

            case "resign":
                handleResign(state, playerId);
                break;

            case "draw_offer":
                handleDrawOffer(state, playerId);
                break;

            case "draw_accept":
                handleDrawAccept(state, playerId);
                break;

            case "draw_decline":
                handleDrawDecline(state, playerId);
                break;

            default:
                return createErrorResponse("Invalid action type");
        }

        return createSuccessResponse(state);
    } catch (error) {
        console.error('Error in handler:', error);
        return createErrorResponse(error.message);
    }
};

// Update handleMove function to match
function handleMove(state, moveData, playerId) {
    const { from, to } = moveData;  // Now directly destructuring from the action
    const currentPlayer = state.gameState.currentTurn === 'white' ? 
        state.gameState.players.white : 
        state.gameState.players.black;

    if (currentPlayer.playerId !== playerId) {
        throw new Error("Not your turn");
    }

    // Update board state
    const [fromFile, fromRank] = from.split('');
    const [toFile, toRank] = to.split('');
    
    const fromX = fromFile.charCodeAt(0) - 'a'.charCodeAt(0);
    const fromY = 8 - parseInt(fromRank);
    const toX = toFile.charCodeAt(0) - 'a'.charCodeAt(0);
    const toY = 8 - parseInt(toRank);

    const piece = state.gameState.board[fromY][fromX];
    const targetPiece = state.gameState.board[toY][toX];

    // Handle captures
    if (targetPiece) {
        currentPlayer.capturedPieces.push(targetPiece);
    }

    // Update board
    state.gameState.board[fromY][fromX] = '';
    state.gameState.board[toY][toX] = piece;

    // Update game state
    state.gameState.currentTurn = state.gameState.currentTurn === 'white' ? 'black' : 'white';
    state.gameState.lastMove = { from, to, captured: !!targetPiece };
    state.gameState.moveHistory.push(`${piece}${from}-${to}`);
}

function handleResign(state, playerId) {
    const resigningColor = state.gameState.players.white.playerId === playerId ? 'white' : 'black';
    const winningColor = resigningColor === 'white' ? 'black' : 'white';
    
    state.gameState.gameStatus = 'finished';
    state.gameState.winner = winningColor;
    state.gameState.endReason = 'resignation';
}

function handleDrawOffer(state, playerId) {
    const offeringColor = state.gameState.players.white.playerId === playerId ? 'white' : 'black';
    state.gameState.drawOffer = offeringColor;
}

function handleDrawAccept(state, playerId) {
    if (!state.gameState.drawOffer) return;
    
    const acceptingColor = state.gameState.players.white.playerId === playerId ? 'white' : 'black';
    if (acceptingColor === state.gameState.drawOffer) return;

    state.gameState.gameStatus = 'finished';
    state.gameState.winner = 'draw';
    state.gameState.endReason = 'draw_agreement';
    state.gameState.drawOffer = null;
}

function handleDrawDecline(state, playerId) {
    if (!state.gameState.drawOffer) return;
    
    const decliningColor = state.gameState.players.white.playerId === playerId ? 'white' : 'black';
    if (decliningColor === state.gameState.drawOffer) return;

    state.gameState.drawOffer = null;
}

function decodeEventBody(event) {
    try {
        if (typeof event === 'string') {
            return JSON.parse(event);
        }
        
        if (event.body) {
            if (event.isBase64Encoded) {
                const decodedBody = Buffer.from(event.body, 'base64').toString('utf8');
                return JSON.parse(decodedBody);
            }
            return typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
        }
        
        return event;
    } catch (error) {
        throw new Error(`Failed to decode event body: ${error.message}`);
    }
}

function parseEventBody(event) {
    if (!event?.state) {
        throw new Error("Missing required field: state");
    }
    if (!event?.action) {
        throw new Error("Missing required field: action");
    }
    if (!event?.playerId) {
        throw new Error("Missing required field: playerId");
    }
    if (!event?.matchId) {
        throw new Error("Missing required field: matchId");
    }
    return event;
}

function createSuccessResponse(data) {
    return {
        statusCode: 200,
        body: JSON.stringify({
            isSuccess: true,
            data,
            messageText: null
        })
    };
}

function createErrorResponse(messageText) {
    return {
        statusCode: 400,
        body: JSON.stringify({
            isSuccess: false,
            data: null,
            messageText
        })
    };
}