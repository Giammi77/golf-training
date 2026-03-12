import client from './client';
import type { TokenPair, User } from '@/types';

export const login = async (username: string, password: string): Promise<TokenPair> => {
  const { data } = await client.post<TokenPair>('/auth/token/', { username, password });
  return data;
};

export const getMe = async (): Promise<User> => {
  const { data } = await client.get<User>('/auth/me/');
  return data;
};

export const updateMe = async (payload: {
  first_name?: string;
  last_name?: string;
  email?: string;
  golfer_profile?: { nr_tessera?: string; hcp?: number };
}): Promise<User> => {
  const { data } = await client.patch<User>('/auth/me/', payload);
  return data;
};

export const changePassword = async (old_password: string, new_password: string): Promise<void> => {
  await client.post('/auth/change-password/', { old_password, new_password });
};

export const getGolfers = async (): Promise<User[]> => {
  const { data } = await client.get<{ results: User[] }>('/auth/golfers/');
  return data.results;
};

export const resetGolferPassword = async (golferId: number): Promise<{ detail: string }> => {
  const { data } = await client.post<{ detail: string }>(`/auth/golfers/${golferId}/reset-password/`);
  return data;
};

export const resetMyScores = async (): Promise<{ detail: string }> => {
  const { data } = await client.post<{ detail: string }>('/auth/reset-scores/');
  return data;
};
