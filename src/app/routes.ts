import { Routes } from '@angular/router';
import { LoginPage } from '../pages/Login/login-page';
import { AuthLayout } from './layouts/auth-layout/layout';
import { MainLayout } from './layouts/main-layout/layout';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '',
    component: AuthLayout,
    children: [
      { path: 'login', component: LoginPage, title: 'Login' },
      {
        path: 'signup',
        loadComponent: () =>
          import('../pages/SignUp/sign-up-page').then((m) => m.SignUpPage),
      },
    ],
  },
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('../pages/Dashboard/dashboard-page').then(
            (m) => m.DashboardPage,
          ),
      },
      {
        path: 'balances',
        loadComponent: () =>
          import('../pages/Balances/balances-page').then((m) => m.BalancesPage),
      },
      {
        path: 'expenses',
        loadComponent: () =>
          import('../pages/Expenses/expenses-page').then((m) => m.ExpensesPage),
      },
      {
        path: 'goals',
        loadComponent: () =>
          import('../pages/Goals/goals-page').then((m) => m.GoalsPage),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('../pages/Settings/settings-page').then((m) => m.SettingsPage),
      },
      {
        path: 'subscriptions',
        loadComponent: () =>
          import('../pages/Subscriptions/subscriptions-page').then(
            (m) => m.SubscriptionsPage,
          ),
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import('../pages/Transactions/transactions-page').then(
            (m) => m.TransactionsPage,
          ),
      },
    ],
  },

  // not found
  {
    path: '404',
    loadComponent: () =>
      import('../pages/NotFound/not-found-page').then((m) => m.NotFoundPage),
  },
  { path: '**', redirectTo: '404' },
];

export default routes;
