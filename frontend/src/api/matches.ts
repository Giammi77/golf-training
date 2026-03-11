import client from './client';
import type { Match, Score, Ranking } from '@/types';

interface RegisterMatchResponse {
  match: Match;
  scores: Score[];
}

export const registerMatch = async (clubId: number): Promise<RegisterMatchResponse> => {
  const { data } = await client.post<RegisterMatchResponse>('/matches/register/', {
    club_id: clubId,
  });
  return data;
};

export const getMatchScores = async (matchId: number): Promise<Score[]> => {
  const { data } = await client.get(`/matches/${matchId}/scores/`);
  return data.results ?? data;
};

export const getLeaderboard = async (matchId: number): Promise<Ranking[]> => {
  const { data } = await client.get(`/matches/${matchId}/leaderboard/`);
  return data.results ?? data;
};
