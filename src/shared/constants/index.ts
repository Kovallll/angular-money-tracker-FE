export const defaultPageSize = 10;
export const defaultPage = 0;
export const tabs = ['All', 'Expenses', 'Revenue'];

export const expensesUrl = 'expenses';
export const categoriesUrl = 'categories';
export const balancesUrl = 'balances';
export const subscriptionsUrl = 'subscribtions';
export const goalsUrl = 'goals';
export const transactionsUrl = 'transactions';
export const statisticsUrl = 'statistics';
export const usersUrl = 'users';
export const exchangeRatesUrl = 'exchange-rates';

export const chartColors = { blue: '#3b82f6', red: '#ef4444' };

/** Имя категории подписок, создаётся по умолчанию на бэке. */
export const SUBSCRIPTIONS_CATEGORY_NAME = 'Subscriptions';

/** Имя категории целей, создаётся по умолчанию на бэке. */
export const GOALS_CATEGORY_NAME = 'Goals';

export {
  DEFAULT_CATEGORY_ICON,
  CATEGORY_ICON_OPTIONS,
  getCategoryIconName,
  type CategoryIconOption,
} from './category-icons';
