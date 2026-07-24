import { fetchApi } from '../../../core/api/api.config';

export interface GoalItem {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: string;
  owner?: string;
  status?: string;
}

type ApiRecord = Record<string, unknown>;

function record(value: unknown): ApiRecord {
  return typeof value === 'object' && value !== null ? value as ApiRecord : {};
}

function numberValue(value: unknown): number {
  return typeof value === 'number' ? value : Number(value ?? 0) || 0;
}

function stringValue(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function mapGoal(value: unknown, index: number): GoalItem {
  const item = record(value);
  return {
    id: stringValue(item.id ?? item.goalId, `goal-${index}`),
    title: stringValue(item.title ?? item.name ?? item.goalName, 'Meta sin nombre'),
    current: numberValue(item.current ?? item.actual ?? item.progress),
    target: numberValue(item.target ?? item.goal ?? item.targetValue),
    unit: stringValue(item.unit, 'unidades'),
    owner: stringValue(item.owner ?? item.sellerName ?? item.supervisorName, ''),
    status: stringValue(item.status, ''),
  };
}

export const goalsService = {
  async getGoals(scope?: string): Promise<GoalItem[]> {
    const query = scope ? `?scope=${encodeURIComponent(scope)}` : '';
    const response = await fetchApi<unknown>(`/goals${query}`);
    const records = Array.isArray(response)
      ? response
      : Array.isArray(record(response).items)
        ? record(response).items as unknown[]
        : [];
    return records.map(mapGoal);
  },
};
