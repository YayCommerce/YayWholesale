import { api } from '@/lib/api/base';

export async function markReviewed() {
  const response = await api.post('mark-reviewed');
  return response.json() as Promise<boolean>;
}
