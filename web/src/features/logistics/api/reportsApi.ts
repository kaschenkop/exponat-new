import type { LogisticsReportSummary } from '../types/inventory.types';
import { logisticsGet } from './logisticsClient';

export const reportsApi = {
  summary() {
    return logisticsGet<LogisticsReportSummary>('/reports/summary');
  },
};
