import { menuItems } from '@/widgets/sidebar/menu/lib/constants';

/** Сколько пунктов показывать как основные табы (остальные — в «Ещё»). */
export const PRIMARY_TABS_COUNT = 4;

/** Все пункты меню из единого конфига сайдбара. */
export const allMenuItems = menuItems;

/** Основные табы (первые N). */
export const primaryTabItems = menuItems.slice(0, PRIMARY_TABS_COUNT);

/** Пункты в панели «Ещё». */
export const moreMenuItems = menuItems.slice(PRIMARY_TABS_COUNT);
