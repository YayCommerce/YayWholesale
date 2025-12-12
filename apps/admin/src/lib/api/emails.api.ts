import { api } from './base';

export async function updateEmailStatus(
  emailId: string,
  status: boolean,
): Promise<{ success: boolean; message: string }> {
  const response = await api.post(`emails/update-status`, { json: { emailId, status } });
  return response.json();
}
