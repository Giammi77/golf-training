import client from './client';
import type { HistoryMatch, Score, PointsTrend, PointsDistribution, StatisticsSummary, ParPerformance } from '@/types';

export const getHistoryMatches = async (): Promise<HistoryMatch[]> => {
  const { data } = await client.get<{ results: HistoryMatch[] }>('/history/matches/');
  return data.results;
};

export const getHistoryScores = async (matchId: number): Promise<Score[]> => {
  const { data } = await client.get(`/history/matches/${matchId}/scores/`);
  return data.results ?? data;
};

export const deleteHistoryMatch = async (matchId: number): Promise<void> => {
  await client.delete(`/history/matches/${matchId}/`);
};

export const getPointsTrend = async (limit = 15): Promise<PointsTrend[]> => {
  const { data } = await client.get(`/statistics/points-trend/?limit=${limit}`);
  return data.results ?? data;
};

export const getPointsDistribution = async (): Promise<PointsDistribution[]> => {
  const { data } = await client.get('/statistics/points-distribution/');
  return data.results ?? data;
};

export const getStatisticsSummary = async (): Promise<StatisticsSummary> => {
  const { data } = await client.get('/statistics/summary/');
  return data;
};

export const getParPerformance = async (): Promise<ParPerformance[]> => {
  const { data } = await client.get('/statistics/par-performance/');
  return data.results ?? data;
};
