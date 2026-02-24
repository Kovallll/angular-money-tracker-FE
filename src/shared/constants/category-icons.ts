/**
 * Единый источник иконок категорий для приложения.
 * Названия соответствуют Material Icons (fontIcon).
 * Эти же значения хранятся в БД в поле categories.icon.
 */
export const DEFAULT_CATEGORY_ICON = 'category';

export interface CategoryIconOption {
  value: string;
  label: string;
}

export const CATEGORY_ICON_OPTIONS: CategoryIconOption[] = [
  { value: 'directions_car', label: 'Auto' },
  { value: 'local_taxi', label: 'Transport' },
  { value: 'restaurant', label: 'Food' },
  { value: 'shopping_cart', label: 'Shopping' },
  { value: 'movie', label: 'Entertainment' },
  { value: 'school', label: 'Courses' },
  { value: 'local_hospital', label: 'Medicine' },
  { value: 'receipt', label: 'Receipt' },
  { value: 'subscriptions', label: 'Subscriptions' },
  { value: 'savings', label: 'Savings' },
  { value: 'account_balance', label: 'Bank' },
  { value: 'category', label: 'Category' },
  { value: 'inventory_2', label: 'Other' },
];

/** Возвращает имя иконки для отображения; при пустом или неизвестном — default. */
export function getCategoryIconName(icon: string | null | undefined): string {
  if (icon == null || icon === '') return DEFAULT_CATEGORY_ICON;
  return icon;
}
