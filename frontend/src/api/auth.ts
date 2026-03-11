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
