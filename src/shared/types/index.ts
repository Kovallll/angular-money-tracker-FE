export type User = { name: string; email: string };

export type Transaction = {
  id: number;
  userId: number;
  cardId: number;
  title: string;
  category: string;
  amount: number;
  date: string;
  type: string;
  paymentMethod: string;
  transactionType: string;
  receipt: string;
  status: string;
};

export interface BalanceCard {
  id: number;
  cardName: string;
  cardNumber: string;
  cardBalance: number;
  cardType: string;
  bankName: string;
  branchName: string;
  transactions: Transaction[];
}

export interface ExpenseItem {
  id: number;
  category: Pick<CategoryItem, 'id' | 'title'>;
  amount: number;
  date: string;
  title: string;
}

export interface CategoryItem {
  id: number;
  title: string;
  expensesAmount: number;
  expenses: ExpenseItem[];
}
