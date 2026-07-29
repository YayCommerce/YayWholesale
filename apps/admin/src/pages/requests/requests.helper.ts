import { __ } from '@wordpress/i18n';

import { parseWPDate, parseWPTime } from '@/lib/helpers/format.helper';
import { RequestField } from '@/lib/schema/requests.type';

export const handleDataByType = (field: RequestField) => {
  const value = field.value;

  if (!value || value.length == 0) {
    return value;
  }

  if (field.type.toLowerCase() == 'date') {
    return parseWPDate(value);
  }

  if (field.type.toLowerCase() == 'time') {
    return parseWPTime(value);
  }

  return value;
};

export const isPhoneField = (field: RequestField) => {
  return field.label.toLowerCase().includes(__('phone', 'yay-wholesale-b2b')) || field.type.toLowerCase() === 'phone';
};

export const isImageAttachmentUrl = (url: string): boolean => {
  return /\.(jpg|jpeg|png|gif|webp|bmp|svg|avif|heic)$/i.test(url);
};
