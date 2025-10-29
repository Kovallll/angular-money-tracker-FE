export type User = {
  name: string;
  lastname: string;
  phone: string;
  email: string;
  password: string;
  avatar?: string;
};

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

export interface CreateCard {
  cardName: string;
  cardNumber: string;
  cardBalance: number;
  cardType: string;
  bankName: string;
  branchName: string;
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
  expenses: Transaction[];
  revenues: Transaction[];
  totalExpenses: number;
  totalRevenues: number;
}

export interface GoalItem {
  id: number;
  targetBudget: number;
  goalBudget: number;
  startDate: string;
  endDate: string;
  title: string;
}

export interface SubscribeItem {
  id: number;
  amount: number;
  subscribeDate: string;
  subscribeName: string;
  lastCharge: string;
  type: string;
  description?: string;
}

export interface CategoryLineChartDto {
  categoryId: number;
  title: string;
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor?: string;
    tension?: number;
    pointRadius?: number;
    fill?: boolean;
  }>;
}

export interface ChartJsPie {
  labels: string[];
  datasets: Array<{ data: number[]; backgroundColor: string[] }>;
}

export interface ChartJsBar {
  labels: string[]; // месяцы
  datasets: Array<{ label: string; data: number[]; backgroundColor?: string }>;
}

export interface ChartJsLine {
  labels: string[]; // месяцы
  datasets: Array<{
    label: string;
    data: number[];
    borderColor?: string;
    tension?: number;
    fill?: boolean;
  }>;
}

export interface ExpensesOverviewDto {
  pie: ChartJsPie; // доли категорий за текущий месяц
  bar: ChartJsBar; // по категориям за последние N месяцев (топ-K)
  line: ChartJsLine; // суммарно по всем категориям за 12 мес.
  meta: {
    monthIndex: number; // 0..11 текущий месяц
    year: number;
    monthsBar: number;
    topK: number;
  };
}
