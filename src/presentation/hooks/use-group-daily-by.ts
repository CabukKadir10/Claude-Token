import { useMemo } from 'react';
import {
  groupDailyBy,
  type GroupByPeriod,
  type GroupedDailyBucket,
} from '@/application/use-cases/group-daily-by';
import type { DailyBucket } from '@/domain/entities/daily-bucket';

export function useGroupDailyBy(
  daily: ReadonlyArray<DailyBucket>,
  period: GroupByPeriod,
): ReadonlyArray<GroupedDailyBucket> {
  return useMemo(() => groupDailyBy({ daily, period }), [daily, period]);
}
