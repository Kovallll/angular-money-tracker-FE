export { RoutePaths } from './routes';

export enum TransactionType {
  Revenue = 'Revenue',
  Expenses = 'Expenses',
  Transfers = 'Transfers',
}

export enum Tabs {
  All = 'All',
  Expenses = TransactionType.Expenses,
  Revenue = TransactionType.Revenue,
  Transfers = TransactionType.Transfers,
}
