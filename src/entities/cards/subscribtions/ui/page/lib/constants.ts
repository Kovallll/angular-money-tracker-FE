import { TableCell } from '@/entities/table/lib';

export const columns: TableCell[] = [
  { field: 'subscribeDate', name: 'subscriptions.startDate' },
  { field: 'subscribeName', name: 'common.title' },
  { field: 'description', name: 'transactions.description' },
  { field: 'type', name: 'txModal.type' },
  { field: 'lastCharge', name: 'subscriptions.lastPaid' },
  { field: 'amount', name: 'txModal.amount' },
];

export const searchProps = { searchField: 'subscribeName', placeholder: 'search.byTitle' };
