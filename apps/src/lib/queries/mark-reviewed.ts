import { api } from '@/lib/api';

export async function markReviewed() {
  const response = await api.post('mark-reviewed');
  return response.json() as Promise<boolean>;
}
