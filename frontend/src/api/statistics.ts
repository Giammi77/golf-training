import client from './client';
import type { HistoryMatch, Score, PointsTrend, PointsDistribution, StatisticsSummary, ParPerformance } from '@/types';

const clubParam = (clubId?: number | null) =>
  clubId ? `?club=${clubId}` : '';

export const getHistoryMatches = async (clubId?: number | null): Promise<HistoryMatch[]> => {
  const { data } = await client.get<{ results: HistoryMatch[] }>(`/history/matches/${clubParam(clubId)}`);
  return data.results;
};

export const getHistoryScores = async (matchId: number): Promise<Score[]> => {
  const { data } = await client.get(`/history/matches/${matchId}/scores/`);
  return data.results ?? data;
};

export const deleteHistoryMatch = async (matchId: number): Promise<void> => {
  await client.delete(`/history/matches/${matchId}/`);
};

export const getPointsTrend = async (limit = 15, clubId?: number | null): Promise<PointsTrend[]> => {
  const p = clubId ? `&club=${clubId}` : '';
  const { data } = await client.get(`/statistics/points-trend/?limit=${limit}${p}`);
  return data.results ?? data;
};

export const getPointsDistribution = async (clubId?: number | null): Promise<PointsDistribution[]> => {
  const { data } = await client.get(`/statistics/points-distribution/${clubParam(clubId)}`);
  return data.results ?? data;
};

export const getStatisticsSummary = async (clubId?: number | null): Promise<StatisticsSummary> => {
  const { data } = await client.get(`/statistics/summary/${clubParam(clubId)}`);
  return data;
};

export const getParPerformance = async (clubId?: number | null): Promise<ParPerformance[]> => {
  const { data } = await client.get(`/statistics/par-performance/${clubParam(clubId)}`);
  return data.results ?? data;
};
