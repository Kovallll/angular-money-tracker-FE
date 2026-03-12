import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GoalsService } from '@/entities/cards/goals/services/goals.service';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { GoalItem } from '@/shared';
import { MatIconModule } from '@angular/material/icon';
import { TransactionsHttpService } from '@/shared/services/models/transactions.service';
import { StatisticsRefreshService } from '@/shared/services/models/statistics-refresh.service';
import { BalancesHttpService } from '@/shared/services/models/balances.service';
import { CategoriesHttpService } from '@/shared/services/models/categories.service';
import { ExpensesHttpService } from '@/shared/services/models/expenses.service';
import { ExchangeRatesService } from '@/shared/services/currency/exchange-rates.service';
import { GOALS_CATEGORY_NAME } from '@/shared/constants';
import { MessageService } from 'primeng/api';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';

@Component({
  standalone: true,
  selector: 'goal-quick-add-funds',
  templateUrl: './quick-add-funds.component.html',
  styleUrls: ['./quick-add-funds.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, AppIconComponent],
})
export class GoalQuickAddFundsComponent {
  private goalsService = inject(GoalsService);
  private currencyService = inject(CurrencyService);
  private elementRef = inject(ElementRef<HTMLElement>);
  private transactionsHttpService = inject(TransactionsHttpService);
  private balancesHttpService = inject(BalancesHttpService);
  private categoriesHttpService = inject(CategoriesHttpService);
  private expensesHttpService = inject(ExpensesHttpService);
  private statisticsRefreshService = inject(StatisticsRefreshService);
  private exchangeRates = inject(ExchangeRatesService);
  private messageService = inject(MessageService);

  goal = input.required<GoalItem>();

  expanded = signal(false);
  amount = signal<string>('');
  isSubmitting = signal(false);

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.expanded()) return;
    const target = event.target as Node;
    const host = this.elementRef.nativeElement;
    if (target && host.contains(target)) return;
    this.cancel();
  }

  get currencyCode(): string {
    return this.goal()?.currencyCode ?? this.currencyService.primaryCode();
  }

  toggle() {
    this.expanded.update((v) => !v);
    if (!this.expanded()) this.amount.set('');
  }

  add() {
    const g = this.goal();
    const raw = this.amount().trim().replace(',', '.');
    const value = raw === '' ? NaN : parseFloat(raw);
    if (!g || Number.isNaN(value) || value <= 0) return;
    const current = g.targetBudget ?? 0;
    const newTarget = current + value;
    this.isSubmitting.set(true);
    this.goalsService.updateGoal$(g.id, { targetBudget: newTarget }).subscribe({
      next: async () => {
        this.isSubmitting.set(false);
        this.amount.set('');
        this.expanded.set(false);
        await this.createGoalContributionTransaction(g, value);
      },
      error: () => this.isSubmitting.set(false),
    });
  }

  private async createGoalContributionTransaction(goal: GoalItem, amount: number): Promise<void> {
    try {
      const cards = this.balancesHttpService.cards();
      const primaryCard = cards.find((c) => c.isPrimary) ?? cards[0];
      const cardId = primaryCard?.id;
      let categoryId: string | undefined =
        goal.categoryId != null && goal.categoryId !== '' ? String(goal.categoryId) : undefined;
      if (categoryId == null) {
        const categories = await this.categoriesHttpService.getCategories();
        const goalsCat = categories.find(
          (c) => String(c.title ?? '').toLowerCase() === GOALS_CATEGORY_NAME.toLowerCase(),
        );
        categoryId = goalsCat != null ? String(goalsCat.id) : undefined;
      }
      if (!cardId || !categoryId) {
        this.messageService.add({
          key: 'toast',
          severity: 'info',
          summary: 'Goal updated',
          detail:
            !cardId && !categoryId
              ? 'Add a card and ensure Goals category exists to record transactions.'
              : !cardId
                ? 'Add a card to record goal contributions as transactions.'
                : 'Goals category not found. Transaction was not created.',
          life: 4000,
        });
        return;
      }
      const primary = this.currencyService.primaryCode();
      const fromCode = goal.currencyCode ?? primary;
      const normalizedAmount = this.exchangeRates.convert(amount, fromCode, primary);
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      await this.transactionsHttpService.createTransaction({
        cardId: String(cardId),
        categoryId: String(categoryId),
        type: 'expense',
        amount: normalizedAmount,
        currencyCode: primary,
        date: dateStr,
        title: `Goal: ${goal.title ?? 'Contribution'}`,
      });
      this.balancesHttpService.refresh();
      this.transactionsHttpService.loadTransactions();
      this.categoriesHttpService.refreshCategories();
      this.expensesHttpService.refreshExpenses();
      this.statisticsRefreshService.refresh();
      this.messageService.add({
        key: 'toast',
        severity: 'success',
        summary: 'Transaction created',
        detail: `Contribution to «${goal.title ?? 'Goal'}» recorded.`,
        life: 3000,
      });
    } catch {
      this.messageService.add({
        key: 'toast',
        severity: 'warn',
        summary: 'Goal updated',
        detail: 'Transaction for this contribution could not be created.',
        life: 4000,
      });
    }
  }

  get amountInvalid(): boolean {
    const raw = this.amount().trim().replace(',', '.');
    if (raw === '') return true;
    const n = parseFloat(raw);
    return Number.isNaN(n) || n <= 0;
  }

  cancel() {
    this.expanded.set(false);
    this.amount.set('');
  }
}
