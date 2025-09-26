import { CategoryItem, ExpenseItem } from '../types';
// Моки расходов
export const expenses: ExpenseItem[] = [
  {
    id: 0,
    amount: 1000,
    date: '2024-01-01',
    title: 'Car repair',
    category: { id: 0, title: 'Auto' },
  },
  {
    id: 1,
    amount: 50,
    date: '2024-01-01',
    title: 'Bus ticket',
    category: { id: 1, title: 'Transport' },
  },
  {
    id: 2,
    amount: 200,
    date: '2024-01-01',
    title: 'Groceries',
    category: { id: 2, title: 'Food' },
  },
  {
    id: 3,
    amount: 300,
    date: '2024-01-01',
    title: 'Clothes',
    category: { id: 3, title: 'Shopping' },
  },
  {
    id: 4,
    amount: 150,
    date: '2024-01-01',
    title: 'Cinema tickets',
    category: { id: 4, title: 'Entertainments' },
  },
  {
    id: 5,
    amount: 80,
    date: '2024-01-01',
    title: 'Miscellaneous',
    category: { id: 5, title: 'Other' },
  },
  {
    id: 6,
    amount: 120,
    date: '2024-01-01',
    title: 'Restaurant',
    category: { id: 2, title: 'Food' },
  },
  { id: 7, amount: 400, date: '2024-01-01', title: 'Fuel', category: { id: 0, title: 'Auto' } },
  {
    id: 8,
    amount: 75,
    date: '2024-01-01',
    title: 'Office supplies',
    category: { id: 5, title: 'Other' },
  },
  {
    id: 9,
    amount: 600,
    date: '2024-01-01',
    title: 'Shoes',
    category: { id: 3, title: 'Shopping' },
  },
];

export const categories: CategoryItem[] = Object.values(
  expenses.reduce<Record<number, CategoryItem>>((acc, expense) => {
    const catId = expense.category.id;

    if (!acc[catId]) {
      acc[catId] = {
        id: catId,
        title: expense.category.title,
        expensesAmount: 0,
        expenses: [],
      };
    }

    acc[catId].expenses.push(expense);
    acc[catId].expensesAmount += expense.amount;

    return acc;
  }, {}),
);
