import { apiFetchJson } from '@/shared/lib/api-client';
import type {
  BudgetTrendData,
  DashboardActivity,
  DashboardEvent,
  DashboardProject,
  DashboardStats,
} from '@/features/dashboard/types/dashboard.types';

function dashboardHeaders(): HeadersInit {
  const headers: Record<string, string> = {};
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('access_token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    if (!token) {
      const devOrg =
        process.env.NEXT_PUBLIC_DEV_ORGANIZATION_ID ??
        (process.env.NODE_ENV !== 'production'
          ? '11111111-1111-1111-1111-111111111111'
          : undefined);
      if (devOrg) {
        headers['X-Organization-Id'] = devOrg;
      }
    }
  }
  return headers;
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    return apiFetchJson<DashboardStats>('/api/dashboard/stats', {
      headers: dashboardHeaders(),
    });
  },

  getRecentProjects: async (): Promise<DashboardProject[]> => {
    return apiFetchJson<DashboardProject[]>('/api/dashboard/recent-projects', {
      headers: dashboardHeaders(),
    });
  },

  getBudgetTrend: async (months: number): Promise<BudgetTrendData[]> => {
    return apiFetchJson<BudgetTrendData[]>(
      `/api/dashboard/budget-trend?months=${months}`,
      { headers: dashboardHeaders() },
    );
  },

  getUpcomingEvents: async (): Promise<DashboardEvent[]> => {
    return apiFetchJson<DashboardEvent[]>('/api/dashboard/upcoming-events', {
      headers: dashboardHeaders(),
    });
  },

  getActivity: async (limit = 10): Promise<DashboardActivity[]> => {
    return apiFetchJson<DashboardActivity[]>(
      `/api/dashboard/activity?limit=${limit}`,
      { headers: dashboardHeaders() },
    );
  },
};
