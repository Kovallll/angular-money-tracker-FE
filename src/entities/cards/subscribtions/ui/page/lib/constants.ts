import { TableCell } from '@/entities/table/lib';

export const columns: TableCell[] = [
  { field: 'subscribeDate', name: 'Date' },
  { field: 'subscribeName', name: 'Title' },
  { field: 'description', name: 'Description' },
  { field: 'type', name: 'Type' },
  { field: 'lastCharge', name: 'Last charge' },
  { field: 'amount', name: 'Amount' },
];

export const searchProps = { searchField: 'subscribeName', placeholder: 'Search by title' };
