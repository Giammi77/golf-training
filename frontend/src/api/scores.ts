import client from './client';
import type { Score } from '@/types';

export const incrementStroke = async (scoreId: number): Promise<Score> => {
  const { data } = await client.patch<Score>(`/scores/${scoreId}/increment/`);
  return data;
};

export const decrementStroke = async (scoreId: number): Promise<Score> => {
  const { data } = await client.patch<Score>(`/scores/${scoreId}/decrement/`);
  return data;
};

export const finishMatch = async (matchId: number): Promise<{ terminato: boolean; status: string }> => {
  const { data } = await client.post('/scores/finish/', { match_id: matchId });
  return data;
};
