import { Routes } from '@angular/router';
import { LoginPage } from '../pages/Login/login-page';
import { AuthLayout } from './layouts/auth-layout/layout';
import { MainLayout } from './layouts/main-layout/layout';
import { RoutePaths } from '@/shared';

const routes: Routes = [
  {
    path: '',
    redirectTo: RoutePaths.LOGIN,
    pathMatch: 'full',
  },
  {
    path: '',
    component: AuthLayout,
    children: [
      { path: RoutePaths.LOGIN, component: LoginPage, title: 'Login' },
      {
        path: RoutePaths.SIGNUP,
        loadComponent: () => import('../pages/SignUp/sign-up-page').then((m) => m.SignUpPage),
      },
    ],
  },
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: RoutePaths.DASHBOARD,
        loadComponent: () =>
          import('../pages/Dashboard/dashboard-page').then((m) => m.DashboardPage),
      },
      {
        path: RoutePaths.BAlANCES,
        loadComponent: () => import('../pages/Balances/balances-page').then((m) => m.BalancesPage),
      },
      {
        path: RoutePaths.EXPENSES,
        loadComponent: () => import('../pages/Expenses/expenses-page').then((m) => m.ExpensesPage),
      },
      {
        path: RoutePaths.GOALS,
        loadComponent: () => import('../pages/Goals/goals-page').then((m) => m.GoalsPage),
      },
      {
        path: RoutePaths.SETTINGS,
        loadComponent: () => import('../pages/Settings/settings-page').then((m) => m.SettingsPage),
      },
      {
        path: RoutePaths.SUBSCRIPTIONS,
        loadComponent: () =>
          import('../pages/Subscriptions/subscriptions-page').then((m) => m.SubscriptionsPage),
      },
      {
        path: RoutePaths.TRANSACTIONS,
        loadComponent: () =>
          import('../pages/Transactions/transactions-page').then((m) => m.TransactionsPage),
      },
    ],
  },
  {
    path: RoutePaths.NOT_FOUND,
    loadComponent: () => import('../pages/NotFound/not-found-page').then((m) => m.NotFoundPage),
  },
  { path: '**', redirectTo: RoutePaths.NOT_FOUND },
];

export default routes;
