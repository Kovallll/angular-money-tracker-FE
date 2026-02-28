import { ValidatorFn } from '@angular/forms';

/** Нормализованный номер: 375 + 9 цифр (всего 12 цифр). */
const BELARUS_PHONE_DIGITS = /^375\d{9}$/;

/**
 * Валидация телефона Беларуси: +375 (XX) XXX-XX-XX.
 * Допускает значение в любом формате, проверяет наличие 12 цифр (375 + 9).
 */
export const belarusPhoneValidator: ValidatorFn = (control) => {
  const value = control.value;
  if (value == null || String(value).trim() === '') return null;
  const digits = String(value).replace(/\D/g, '');
  let normalized = digits;
  if (digits.startsWith('80') && digits.length === 11) normalized = '375' + digits.slice(2);
  else if (digits.startsWith('8') && digits.length === 10) normalized = '375' + digits.slice(1);
  return BELARUS_PHONE_DIGITS.test(normalized) ? null : { belarusPhone: true };
};
