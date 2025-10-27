import { SettingsFormData } from '../schema/settings';
import { api } from './base';

export async function postSettings(data: SettingsFormData): Promise<SettingsFormData> {
  const response = await api.post('settings', { json: data });
  return response.json();
}
