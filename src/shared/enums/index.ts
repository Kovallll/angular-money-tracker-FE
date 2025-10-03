export { RoutePaths } from './routes';

export enum TransactionType {
  Revenue = 'Revenue',
  Expenses = 'Expenses',
}

export enum Tabs {
  All = 'All',
  Expenses = TransactionType.Expenses,
  Revenue = TransactionType.Revenue,
}
