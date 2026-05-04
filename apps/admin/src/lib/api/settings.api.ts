import { Settings } from '@/lib/schema/settings.schema';
import type { Response } from './api.type';
import { api } from './base';

export async function postSettings(data: Settings) {
  return await api.post('settings', { json: data }).json<Response<Settings>>();
}
