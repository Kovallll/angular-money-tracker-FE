export type User = {
  id: string;
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
  categoryId: number;
  title: string;
  category: string;
  amount: number;
  /** Currency code (e.g. BYN, USD). Default BYN if missing. */
  currencyCode?: string;
  date: string;
  type: string;
  paymentMethod: string;
  transactionType: string;
  receipt: string;
  status: string;
};

export type CreateTransaction = Omit<Transaction, 'id' | 'userId' | 'cardId' | 'categoryId'>;

/** Payload для создания транзакции (формат бэкенда) */
export interface CreateTransactionPayload {
  cardId: string;
  categoryId: string;
  type: 'expense' | 'revenue';
  amount: number;
  currencyCode?: string;
  date: string;
  title?: string;
  description?: string;
}

export interface BalanceCard {
  id: number;
  cardName: string;
  cardNumber: string;
  cardBalance: number;
  /** Currency code for this card (e.g. BYN, USD). Defaults to app primary if missing. */
  currencyCode?: string;
  cardType: string;
  bankName: string;
  branchName: string;
  transactions: Transaction[];
}

export interface CreateCard {
  cardName: string;
  cardNumber: string;
  cardBalance: number;
  /** Currency code for this card (e.g. BYN, USD). */
  currencyCode?: string;
  cardType: string;
  bankName: string;
  branchName: string;
}

export interface ExpenseItem {
  id: number;
  category: Pick<CategoryItem, 'id' | 'title' | 'icon'>;
  amount: number;
  /** Currency code of the amount (e.g. BYN, USD). Used for conversion to primary. */
  currencyCode?: string;
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
  icon: string;
}

export interface CreateCategoryItem {
  title: string;
  icon: string;
}

export interface GoalItem {
  id: number;
  targetBudget: number;
  goalBudget: number;
  startDate: string;
  endDate: string;
  title: string;
}

export type CreateGoalItem = Omit<GoalItem, 'id'>;

export interface SubscribeItem {
  id: number;
  amount: number;
  subscribeDate: string;
  subscribeName: string;
  lastCharge: string;
  type: string;
  description?: string;
}

export type CreateSubscribeItem = Omit<SubscribeItem, 'id'>;
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
