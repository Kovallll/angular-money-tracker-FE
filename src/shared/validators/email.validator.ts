import { ValidatorFn } from '@angular/forms';

/**
 * Строгая валидация email, соответствующая backend (class-validator IsEmail).
 * Требует: local@domain.tld, где tld минимум 2 символа.
 * Отклоняет: 123@1, user@localhost и т.п.
 */
const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

export const emailValidator: ValidatorFn = (control) => {
  const value = control.value;
  if (value == null || value === '') return null;
  return EMAIL_PATTERN.test(String(value).trim()) ? null : { email: true };
};
