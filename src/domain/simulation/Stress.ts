/**
 * How far an organism's supply has moved from its reference level. Thresholds are conventions for display and
 * counting, not ecological tipping points.
 */
export type StressLevel =
  'surge' | 'ok' | 'mild' | 'high' | 'severe' | 'lost';

export const STRESS_ORDER: readonly StressLevel[] = [
  'ok',
  'surge',
  'mild',
  'high',
  'severe',
  'lost',
];

export function stressOf(supply: number): StressLevel {
  if (supply < 0.005) return 'lost';
  if (supply < 0.3) return 'severe';
  if (supply < 0.6) return 'high';
  if (supply < 0.85) return 'mild';
  if (supply > 1.15) return 'surge';
  return 'ok';
}

export const STRESS_LABELS: Record<StressLevel, string> = {
  ok: 'holding',
  surge: 'surging',
  mild: 'mild stress',
  high: 'high stress',
  severe: 'severe stress',
  lost: 'lost',
};
