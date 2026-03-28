import type { Exhibit } from '../types/exhibit.types';
import { logisticsDelete, logisticsGet, logisticsPatch, logisticsPost } from './logisticsClient';

export interface ExhibitsListResponse {
  items: Exhibit[];
  total: number;
}

export const exhibitsApi = {
  list(params?: { search?: string; category?: string; status?: string }) {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.category) q.set('category', params.category);
    if (params?.status) q.set('status', params.status);
    const qs = q.toString();
    return logisticsGet<ExhibitsListResponse>(
      `/exhibits${qs ? `?${qs}` : ''}`,
    );
  },
  get(id: string) {
    return logisticsGet<Exhibit>(`/exhibits/${id}`);
  },
  create(body: Partial<Exhibit>) {
    return logisticsPost<Exhibit>('/exhibits', body);
  },
  update(id: string, body: Partial<Exhibit>) {
    return logisticsPatch<Exhibit>(`/exhibits/${id}`, body);
  },
  remove(id: string) {
    return logisticsDelete(`/exhibits/${id}`);
  },
};
