import axios from 'axios';
import { ChessAction, ChessGameState } from '../types/game';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7257/api/v1';
const GAME_KEY = import.meta.env.VITE_GAME_KEY || '';

// Change from const api to export const api
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'X-Game-Key': GAME_KEY,
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const authenticate = async (username: string) => {
  const response = await api.post('/players/authenticate', {
    provider: 3,
    username,
  });
  return response.data;
};

export const getCurrentPlayer = async () => {
  const response = await api.get('/players/me');
  return response.data;
};

export const createQueue = async () => {
  const response = await api.post('/matchmaking/queues', {
    name: 'chess_standard',
    description: 'Standard Chess 1v1',
    minPlayers: 2,
    maxPlayers: 2,
    ticketTTL: '00:05:00',
    matchmakerFunctionName: "chess.matchmaker",
    rules: {
      gameMode: 'standard',
      timeControl: {
        initial: 600000,  // 10 minutes
        increment: 5000   // 5 seconds
      }
    },
  });
  return response.data;
};

export const createTicket = async () => {
  const response = await api.post('/matchmaking/tickets', {
    queueName: 'chess_standard',
    properties: {
      rating: 1500
    },
  });
  return response.data;
};

export const setPresence = async (matchId: string) => {
  const response = await api.post(`/matchmaking/matches/${matchId}/presence`, {
    status: "connected",
    sessionId: crypto.randomUUID(),
    meta: {}
  });
  return response.data;
};

export const markReady = async (matchId: string) => {
  const response = await api.post(`/matchmaking/matches/${matchId}/ready`);
  return response.data;
};

export const submitMove = async (matchId: string, action: ChessAction) => {
  const response = await api.post(`/matchmaking/matches/${matchId}/actions`, {
    actionType: action.actionType,
    actionData: action.actionData
  });
  return response.data;
};

export const getMatchState = async (matchId: string): Promise<ChessGameState> => {
  const response = await api.get(`/matchmaking/matches/${matchId}/state`);
  return response.data;
};

interface MatchTicketResponse {
  id: string;
  gameId: string;
  playerId: string;
  queueName: string;
  status: string;
  properties: any;
  createdAt: string;
  expiresAt: string;
  matchId: string | null;
}

export const getTicket = async (ticketId: string): Promise<MatchTicketResponse> => {
  const response = await api.get(`/matchmaking/tickets/${ticketId}`);
  return response.data;
};

export const processMatchmaking = async (ticketId: string) => {
  // First process matchmaking
  await api.post('/matchmaking/process');
  
  // Then check ticket status
  const ticket = await getTicket(ticketId);
  
  // If matchId is present, return it
  if (ticket.matchId) {
    return ticket.matchId;
  }
  
  return null;
};