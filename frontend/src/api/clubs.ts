import client from './client';
import type { Club } from '@/types';

export const getClubs = async (): Promise<Club[]> => {
  const { data } = await client.get('/clubs/');
  return data.results ?? data;
};

export const getClub = async (id: number): Promise<Club> => {
  const { data } = await client.get<Club>(`/clubs/${id}/`);
  return data;
};
