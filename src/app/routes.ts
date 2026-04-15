import { Routes } from '@angular/router';
import { LoginPageComponent } from '../pages/Login/login-page';
import { AuthLayoutComponent } from './layouts/auth-layout/layout';
import { MainLayoutComponent } from './layouts/main-layout/layout';
import { RoutePaths } from '@/shared';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: RoutePaths.DASHBOARD,
    pathMatch: 'full',
  },
  {
    path: '',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [
      { path: RoutePaths.LOGIN, component: LoginPageComponent, title: 'Login' },
      {
        path: RoutePaths.SIGNUP,
        loadComponent: () =>
          import('../pages/SignUp/sign-up-page').then((m) => m.SignUpPageComponent),
      },
    ],
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: RoutePaths.DASHBOARD,
        loadComponent: () =>
          import('../pages/Dashboard/dashboard-page').then((m) => m.DashboardPageComponent),
      },
      {
        path: RoutePaths.BAlANCES,
        loadComponent: () =>
          import('../pages/Balances/balances-page').then((m) => m.BalancesPageComponent),
      },
      {
        path: RoutePaths.EXPENSES,
        loadComponent: () =>
          import('../pages/Expenses/expenses-page').then((m) => m.ExpensesPageComponent),
      },
      {
        path: RoutePaths.GOALS,
        loadComponent: () => import('../pages/Goals/goals-page').then((m) => m.GoalsPageComponent),
      },
      {
        path: RoutePaths.STATISTICS,
        loadComponent: () =>
          import('../pages/Statistics/statistics-page').then((m) => m.StatisticsPageComponent),
      },
      {
        path: RoutePaths.SETTINGS,
        loadComponent: () =>
          import('../pages/Settings/settings-page').then((m) => m.SettingsPageComponent),
      },
      {
        path: RoutePaths.SUBSCRIPTIONS,
        loadComponent: () =>
          import('../pages/Subscriptions/subscriptions-page').then(
            (m) => m.SubscriptionsPageComponent,
          ),
      },
      {
        path: RoutePaths.TRANSACTIONS,
        loadComponent: () =>
          import('../pages/Transactions/transactions-page').then(
            (m) => m.TransactionsPageComponent,
          ),
      },
      {
        path: RoutePaths.CATEGORIES,
        loadComponent: () =>
          import('../pages/Categories/categories-page').then((m) => m.CategoriesPageComponent),
      },
      {
        path: `${RoutePaths.CATEGORY_DETAILS}/:id`,
        loadComponent: () =>
          import('../pages/Category-details/category-details-page').then(
            (m) => m.CategoryDetailsPageComponent,
          ),
      },
      {
        path: `${RoutePaths.BALANCE_DETAILS}/:id`,
        loadComponent: () =>
          import('../pages/Balance-details/balance-details-page').then(
            (m) => m.BalanceDetailsPageComponent,
          ),
      },
      {
        path: `${RoutePaths.EXPENSES_DETAILS}/:id`,
        loadComponent: () =>
          import('../pages/Expenses-details/expenses-details-page').then(
            (m) => m.ExpensesDetailsPageComponent,
          ),
      },
      {
        path: RoutePaths.RATES,
        loadComponent: () => import('../pages/Rates/rates-page').then((m) => m.RatesPageComponent),
        title: 'Banking tools',
      },
      {
        path: RoutePaths.AI_ASSISTANT,
        loadComponent: () =>
          import('../pages/Ai-assistant/ai-assistant-page').then((m) => m.AiAssistantPageComponent),
        title: 'AI Assistant',
      },
      {
        path: RoutePaths.ROOMS,
        loadComponent: () => import('../pages/Rooms/rooms-page').then((m) => m.RoomsPageComponent),
        title: 'Rooms',
      },
      {
        path: `${RoutePaths.ROOM_DETAILS}/:roomId`,
        loadComponent: () =>
          import('../pages/Room-details/room-details-page').then((m) => m.RoomDetailsPageComponent),
        title: 'Room details',
      },
    ],
  },
  {
    path: RoutePaths.NOT_FOUND,
    loadComponent: () =>
      import('../pages/NotFound/not-found-page').then((m) => m.NotFoundPageComponent),
  },
  { path: '**', redirectTo: RoutePaths.NOT_FOUND },
];

export default routes;
