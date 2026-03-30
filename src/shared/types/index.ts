export type User = {
  id: string;
  name: string;
  lastname: string;
  phone: string;
  email: string;
  password: string;
  avatar?: string;
  /** Periodicity for auto-saving analytics snapshots: week | month | quarter. Default month. */
  analytics_snapshot_periodicity?: 'week' | 'month' | 'quarter';
  analytics_snapshots_enabled?: boolean;
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
  paymentMethod?: string;
  /** ISO date string when the transaction was created (for sorting by creation time). */
  createdAt?: string;
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
  paymentMethod?: 'cash' | 'card';
  /** For ML prediction feedback: cache key from categorizer/predict. */
  predictionKey?: string;
  /** For ML prediction feedback: category id that was predicted (primary or chosen alternative). */
  predictedCategoryId?: string;
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
  expiry?: string | null;
  /** When true, this card is used for automatic transactions (subscriptions, goals). Only one per user. */
  isPrimary?: boolean;
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
  expiry?: string | null;
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
  /** UUID с бэкенда; в старых местах мог встречаться number. */
  id: string | number;
  title: string;
  expenses: Transaction[];
  revenues: Transaction[];
  totalExpenses: number;
  totalRevenues: number;
  icon: string;
  /** Дата создания категории (если приходит с API). Для сортировки по «что было раньше». */
  createdAt?: string;
  /** Обновляется при редактировании категории или при добавлении транзакции в эту категорию. */
  updatedAt?: string;
}

export interface CreateCategoryItem {
  title: string;
  icon: string;
}

export interface GoalItem {
  id: string | number;
  /** Личная цель: userId; комнатная: groupRoomId. */
  userId?: string;
  groupRoomId?: string | null;
  /** Category ID (e.g. Goals category). */
  categoryId?: string | null;
  targetBudget: number;
  goalBudget: number;
  /** Currency code (e.g. BYN, EUR). Used for display; default BYN if missing. */
  currencyCode?: string;
  startDate: string;
  /** Optional. Goal without end date has no deadline. */
  endDate?: string;
  title: string;
  status?: string;
  /** ISO date string. Used for dashboard sorting (newest first). */
  createdAt?: string;
  /** ISO date string. Used for dashboard sorting (newest first). */
  updatedAt?: string;
}

export type CreateGoalItem = Omit<GoalItem, 'id'>;

export interface SubscribeItem {
  id: number | string;
  userId?: string;
  groupRoomId?: string | null;
  amount: number;
  /** Currency code (e.g. BYN, EUR). Used for display; default BYN if missing. */
  currencyCode?: string;
  subscribeDate: string;
  subscribeName: string;
  lastCharge: string | null;
  type: string;
  description?: string;
  /** Category ID for transaction when marking as paid. */
  categoryId?: string | null;
}

export type CreateSubscribeItem = Omit<SubscribeItem, 'id'> & {
  categoryId?: string | null;
};
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
    topK?: number; // при отсутствии показываются все категории
  };
}

/** Saved analytics snapshot (from MongoDB). */
export interface AnalyticsSnapshotItem {
  _id: string;
  userId: string;
  periodType: 'week' | 'month' | 'quarter';
  periodStart: string;
  periodEnd: string;
  overview: ExpensesOverviewDto;
  categoryLineCharts?: CategoryLineChartDto[];
  createdAt: string;
}

export interface AnalyticsSnapshotsListResponse {
  items: AnalyticsSnapshotItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Результат предсказания категории от ML (categorizer/predict) */
export interface CategorizerPredictionResult {
  category_id: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  confidence: number;
}

export interface CategorizerPrediction {
  primary: CategorizerPredictionResult;
  alternatives: CategorizerPredictionResult[];
  needs_confirmation: boolean;
  source: string;
  /** Redis cache key for feedback when user creates a transaction with this prediction. */
  predictionKey?: string;
}

export interface GroupRoomItem {
  id: string;
  name: string;
  description?: string | null;
  avatar?: string | null;
  currencyCode: string;
  role: 'owner' | 'admin' | 'member';
  membersCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GroupRoomMember {
  userId: string;
  role: 'owner' | 'admin' | 'member';
  invitedBy?: string | null;
  joinedAt: string;
  name: string;
  lastname?: string | null;
  email: string;
  avatar?: string | null;
}

export interface GroupRoomDetails extends Omit<GroupRoomItem, 'role' | 'membersCount'> {
  createdBy: string;
  members: GroupRoomMember[];
}

export interface GroupInviteItem {
  id: string;
  roomId: string;
  createdBy: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface GroupTransactionItem {
  id: string;
  roomId: string;
  paidBy: string;
  createdBy: string;
  categoryId?: string | null;
  amount: number;
  currencyCode: string;
  title: string;
  description?: string | null;
  date: string;
  isSplit: boolean;
  createdAt: string;
  updatedAt: string;
}
