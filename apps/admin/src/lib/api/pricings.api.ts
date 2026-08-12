import { api } from '@/lib/api/api';

export function exportPricingCsv() {
  return api.post('pricing/export').blob();
}

export function importPricingCsv(formData: FormData) {
  return api
    .post('pricing/import', {
      body: formData,
    })
    .json<{ logs: { success: number; failed: string[] } }>();
}
