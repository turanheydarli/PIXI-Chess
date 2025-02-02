module.exports.handler = async function (event, context) {
    try {
        const decodedEvent = decodeEventBody(event);
        const { players, rules, metadata } = parseEventBody(decodedEvent);

        const chessInitialState = {
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
                // Current problematic assignment
                white: {
                    playerId: JSON.parse(players[0]).Id,  // First player is being assigned to white
                    username: JSON.parse(players[0]).username || '',
                    timeLeft: rules.timeControl?.initial || 600000,
                    capturedPieces: [],
                    properties: JSON.parse(players[0])
                },
                black: {
                    playerId: JSON.parse(players[1]).Id,  // Second player is being assigned to black
                    username: JSON.parse(players[1]).username || '',
                    timeLeft: rules.timeControl?.initial || 600000,
                    capturedPieces: [],
                    properties: JSON.parse(players[1])
                }
            },
            currentTurn: 'white',
            moveHistory: [],
            gameStatus: 'active',
            lastMove: null
        };

        const initialState = {
            status: "Ready",
            phase: "Playing",
            startedAt: new Date().toISOString(),
            gameState: chessInitialState,
            metadata: metadata || {},
            presences: [],
            size: players.length,
            label: rules.gameMode || "standard",
            tickRate: rules.tickRate || 1
        };

        return createSuccessResponse(initialState);
    } catch (error) {
        return createErrorResponse(error instanceof Error ? error.message : 'Unknown error');
    }
};

function decodeEventBody(event) {
    if (typeof event === 'string') {
        const buff = Buffer.from(event, 'base64');
        return JSON.parse(buff.toString('utf-8'));
    } else if (event?.body) {
        const buff = Buffer.from(event.body, 'base64');
        return JSON.parse(buff.toString('utf-8'));
    }
    return event;
}

function parseEventBody(event) {
    if (!event?.players || !event?.rules) {
        throw new Error("Missing required fields: players or rules");
    }
    return event;
}

function createSuccessResponse(data) {
    return {
        body: JSON.stringify({
            isSuccess: true,
            data,
            messageText: null
        })
    };
}

function createErrorResponse(messageText) {
    return {
        body: JSON.stringify({
            isSuccess: false,
            data: null,
            messageText
        })
    };
}