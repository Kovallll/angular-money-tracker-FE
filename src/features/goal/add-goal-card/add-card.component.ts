import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { AppButtonComponent } from '@/shared/components/app-button/app-button.component';
import { AppModalShellComponent } from '@/shared/components/app-modal-shell/app-modal-shell.component';
import { InputTextModule } from 'primeng/inputtext';
import { CreateGoalItem, GoalItem, GoalsHttpService } from '@/shared';
import { GoalsService } from '@/entities/cards/goals/services/goals.service';
import { DatePickerModule } from 'primeng/datepicker';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { PriceCurrencyFieldComponent } from '@/shared/components/price-currency-field/price-currency-field.component';
import { CategoriesHttpService } from '@/shared/services/models/categories.service';
import { GOALS_CATEGORY_NAME } from '@/shared/constants';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { Select } from 'primeng/select';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';
import { MessageService } from 'primeng/api';
import { lastValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'goal-add-card-button',
  templateUrl: './add-card.component.html',
  styleUrls: ['./add-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AppButtonComponent,
    AppModalShellComponent,
    ButtonModule,
    DialogModule,
    FormsModule,
    InputTextModule,
    DatePickerModule,
    PriceCurrencyFieldComponent,
    Select,
    AppIconComponent,
  ],
})
export class GoalAddCardButtonComponent {
  private goalsService = inject(GoalsService);
  private goalsHttpService = inject(GoalsHttpService);
  private currencyService = inject(CurrencyService);
  private categoriesHttpService = inject(CategoriesHttpService);
  private messageService = inject(MessageService);
  visible = signal(false);

  /** Задан — цель создаётся в групповой комнате. */
  groupRoomId = input<string | undefined>(undefined);
  /** После успешного создания цели в комнате. */
  roomGoalCreated = output<void>();

  categories = injectQuery(() => {
    const rid = this.groupRoomId()?.trim() ?? '';
    return {
      queryKey: ['categories', 'scope', rid] as const,
      queryFn: () =>
        rid
          ? this.categoriesHttpService.fetchCategoriesByRoom(rid)
          : this.categoriesHttpService.getCategories(),
    };
  });
  @ViewChild('f') form?: NgForm;

  newGoal: Partial<GoalItem> & { currencyCode?: string; categoryId?: string } = {
    title: '',
    targetBudget: 0,
    goalBudget: 0,
    startDate: '',
    endDate: '',
  };

  get targetBudget(): number {
    return this.newGoal.targetBudget ?? 0;
  }
  set targetBudget(v: number) {
    this.newGoal.targetBudget = v;
  }

  get goalBudget(): number {
    return this.newGoal.goalBudget ?? 0;
  }
  set goalBudget(v: number) {
    this.newGoal.goalBudget = v;
  }

  get currencyCode(): string {
    return this.newGoal.currencyCode ?? this.currencyService.primaryCode();
  }
  set currencyCode(v: string) {
    this.newGoal.currencyCode = v;
  }

  openDialog() {
    this.newGoal.currencyCode = this.currencyService.primaryCode();
    this.newGoal.categoryId = this.findGoalsCategoryId() ?? undefined;
    this.visible.set(true);
  }

  closeDialog() {
    this.visible.set(false);
    this.resetGoal();
    this.form?.resetForm();
  }

  /** Синхронизация с закрытием по крестику / Escape / клику по маске */
  onVisibleChange(visible: boolean) {
    if (!visible) this.closeDialog();
  }

  hasDateError(): boolean {
    const start = this.newGoal.startDate;
    const end = this.newGoal.endDate;
    if (!start || !end) return false;
    const startDate = (start as unknown) instanceof Date ? start : new Date(start as string);
    const endDate = (end as unknown) instanceof Date ? end : new Date(end as string);
    return endDate < startDate;
  }

  hasBudgetError(): boolean {
    const target = Number(this.newGoal.targetBudget) ?? 0;
    const goal = Number(this.newGoal.goalBudget) ?? 0;
    return target < 0 || goal <= 0 || target > goal;
  }

  /** Formats date to YYYY-MM-DD using local timezone (avoids UTC shift) */
  private formatDate(value: string | Date | undefined): string {
    if (value == null || value === '') return '';
    const d = (value as unknown) instanceof Date ? value : new Date(value);
    if (isNaN((d as Date).getTime())) return '';
    const x = d as Date;
    const y = x.getFullYear();
    const m = String(x.getMonth() + 1).padStart(2, '0');
    const day = String(x.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private resetGoal() {
    this.newGoal.title = '';
    this.newGoal.targetBudget = 0;
    this.newGoal.goalBudget = 0;
    this.newGoal.startDate = '';
    this.newGoal.endDate = '';
    this.newGoal.currencyCode = this.currencyService.primaryCode();
    this.newGoal.categoryId = undefined;
  }

  private findGoalsCategoryId(): string | undefined {
    const cats = this.categories.data();
    if (!cats?.length) return undefined;
    const goalsCat = cats.find(
      (c) => String(c.title ?? '').toLowerCase() === GOALS_CATEGORY_NAME.toLowerCase(),
    );
    return goalsCat != null ? String(goalsCat.id) : undefined;
  }

  onSubmit(form: NgForm) {
    form.form.markAllAsTouched();
    if (form.invalid || this.hasDateError() || this.hasBudgetError()) return;
    const startStr = this.formatDate(this.newGoal.startDate as string | Date);
    const endStr = this.formatDate(this.newGoal.endDate as string | Date);
    if (!startStr) return;
    const categoryId =
      this.newGoal.categoryId != null && this.newGoal.categoryId !== ''
        ? String(this.newGoal.categoryId)
        : this.findGoalsCategoryId();
    const payload: CreateGoalItem = {
      title: (this.newGoal.title ?? '').trim(),
      targetBudget: Number(this.newGoal.targetBudget) ?? 0,
      goalBudget: Number(this.newGoal.goalBudget) ?? 0,
      currencyCode: this.newGoal.currencyCode || undefined,
      startDate: startStr,
      endDate: endStr || undefined,
      categoryId: categoryId ?? undefined,
    };
    const roomId = this.groupRoomId()?.trim();
    if (roomId) {
      lastValueFrom(this.goalsHttpService.createGoal(payload, { groupRoomId: roomId }))
        .then(() => {
          this.messageService.add({
            key: 'toast',
            severity: 'success',
            summary: 'Success',
            detail: 'Goal created',
            life: 3000,
          });
          this.roomGoalCreated.emit();
          this.visible.set(false);
          this.resetGoal();
        })
        .catch(() => {
          this.messageService.add({
            key: 'toast',
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create goal',
            life: 4000,
          });
        });
      return;
    }
    this.goalsService.createGoal(payload);
    this.visible.set(false);
    this.resetGoal();
  }
}
