module.exports.handler = async function (event, context) {
    try {
        let parsedEvent;

        // Handle body parsing
        try {
            if (event.isBase64Encoded) {
                const decodedPayload = Buffer.from(event.body, "base64").toString("utf-8");
                parsedEvent = JSON.parse(decodedPayload);
            } else {
                parsedEvent = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
            }
        } catch (parseError) {
            return createErrorResponse("Invalid request body format");
        }

        // Validate input
        if (!parsedEvent?.tickets || !Array.isArray(parsedEvent.tickets)) {
            return createSuccessResponse([]);
        }

        // For chess, we always want exactly 2 players
        const minPlayers = 2;
        const maxPlayers = 2;

        // Group tickets by rating ranges
        const now = Date.now();
        const ticketsWithMetadata = parsedEvent.tickets.map(ticket => ({
            ...ticket,
            waitTime: (now - new Date(ticket.properties?.createdAt || now).getTime()) / 1000,
            rating: ticket.properties?.rating || 1500 // Default chess rating
        }));

        // Sort tickets by wait time (longest wait first)
        const sortedTickets = ticketsWithMetadata.sort((a, b) => b.waitTime - a.waitTime);

        const matches = [];
        const usedTickets = new Set();

        // Try to match players with similar ratings
        for (const ticket of sortedTickets) {
            if (usedTickets.has(ticket.id)) continue;

            const ratingRange = calculateRatingRange(ticket.waitTime);
            const potentialOpponent = sortedTickets.find(t => 
                !usedTickets.has(t.id) && 
                t.id !== ticket.id &&
                Math.abs(t.rating - ticket.rating) <= ratingRange
            );

            if (potentialOpponent) {
                const match = [ticket.id, potentialOpponent.id];
                matches.push(match);
                usedTickets.add(ticket.id);
                usedTickets.add(potentialOpponent.id);
            }
        }

        // Match remaining players if they've been waiting too long (over 60 seconds)
        const remainingTickets = sortedTickets.filter(t => !usedTickets.has(t.id));
        const longWaitingTickets = remainingTickets.filter(t => t.waitTime > 60);

        while (longWaitingTickets.length >= 2) {
            const match = [
                longWaitingTickets[0].id,
                longWaitingTickets[1].id
            ];
            longWaitingTickets.splice(0, 2);
            matches.push(match);
        }

        return createSuccessResponse(matches);

    } catch (error) {
        return createErrorResponse(error.message);
    }
};

function calculateRatingRange(waitTimeSeconds) {
    // Base rating range is 100
    // Increase by 50 every 10 seconds of waiting
    // Cap at 400 after 60 seconds
    const baseRange = 100;
    const increasePerInterval = 50;
    const intervalSeconds = 10;
    const maxRange = 400;

    const additionalRange = Math.floor(waitTimeSeconds / intervalSeconds) * increasePerInterval;
    return Math.min(baseRange + additionalRange, maxRange);
}

function createSuccessResponse(data) {
    return {
        body: JSON.stringify({
            data,
            isSuccess: true,
            messageText: null
        })
    };
}

function createErrorResponse(messageText) {
    return {
        body: JSON.stringify({
            data: null,
            isSuccess: false,
            messageText
        })
    };
}