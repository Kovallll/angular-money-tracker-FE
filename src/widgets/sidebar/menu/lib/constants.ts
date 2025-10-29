import { RoutePaths } from '@/shared';

export const menuItems = [
  { id: 1, path: RoutePaths.DASHBOARD, title: 'Dashboard', icon: 'dashboard' },
  {
    id: 2,
    path: RoutePaths.TRANSACTIONS,
    title: 'Transactions',
    icon: 'compare_arrows',
  },
  {
    id: 3,
    path: RoutePaths.BAlANCES,
    title: 'Balances',
    icon: 'account_balance_wallet',
  },
  { id: 4, path: RoutePaths.EXPENSES, title: 'Expenses', icon: 'attach_money' },
  { id: 5, path: RoutePaths.CATEGORIES, title: 'Categories', icon: 'category' },
  { id: 6, path: RoutePaths.GOALS, title: 'Goals', icon: 'check_box' },
  { id: 7, path: RoutePaths.STATISTICS, title: 'Statistics', icon: 'bar_chart' },
  {
    id: 8,
    path: RoutePaths.SUBSCRIPTIONS,
    title: 'Subscriptions',
    icon: 'subscriptions',
  },
  { id: 9, path: RoutePaths.SETTINGS, title: 'Settings', icon: 'settings' },
];
