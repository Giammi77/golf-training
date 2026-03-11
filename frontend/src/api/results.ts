import client from './client';
import type { OfficialResult, ResultSummary } from '@/types';

export const getResults = async (section: 'all' | 'last20' | 'best8' = 'all'): Promise<OfficialResult[]> => {
  const { data } = await client.get(`/results/?section=${section}`);
  return data.results ?? data;
};

export const importResults = async (file: File): Promise<{ message: string; count: number }> => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await client.post('/results/import/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const getResultSummary = async (): Promise<ResultSummary> => {
  const { data } = await client.get<ResultSummary>('/results/summary/');
  return data;
};
