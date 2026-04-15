import { RoutePaths } from '@/shared';

export const menuItems = [
  { id: 1, path: RoutePaths.DASHBOARD, title: 'menu.dashboard', icon: 'dashboard' },
  {
    id: 2,
    path: RoutePaths.TRANSACTIONS,
    title: 'menu.transactions',
    icon: 'compare_arrows',
  },
  {
    id: 3,
    path: RoutePaths.BAlANCES,
    title: 'menu.balances',
    icon: 'account_balance_wallet',
  },
  { id: 5, path: RoutePaths.CATEGORIES, title: 'menu.categories', icon: 'category' },
  { id: 4, path: RoutePaths.EXPENSES, title: 'menu.expenses', icon: 'attach_money' },
  { id: 6, path: RoutePaths.GOALS, title: 'menu.goals', icon: 'check_box' },
  { id: 7, path: RoutePaths.STATISTICS, title: 'menu.statistics', icon: 'bar_chart' },
  {
    id: 8,
    path: RoutePaths.SUBSCRIPTIONS,
    title: 'menu.subscriptions',
    icon: 'subscriptions',
  },
  { id: 10, path: RoutePaths.RATES, title: 'menu.bankingTools', icon: 'account_balance' },
  { id: 12, path: RoutePaths.AI_ASSISTANT, title: 'menu.aiAssistant', icon: 'smart_toy' },
  { id: 11, path: RoutePaths.ROOMS, title: 'menu.rooms', icon: 'groups' },
  { id: 9, path: RoutePaths.SETTINGS, title: 'menu.settings', icon: 'settings' },
];
