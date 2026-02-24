import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CreateGoalItem, GoalItem } from '@/shared/types';
import { GoalsService } from '@/entities/cards/goals/services/goals.service';
import { DatePickerModule } from 'primeng/datepicker';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { PriceCurrencyFieldComponent } from '@/shared/components/price-currency-field/price-currency-field.component';

@Component({
  standalone: true,
  selector: 'goal-add-card-button',
  templateUrl: './add-card.component.html',
  styleUrls: ['./add-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonModule,
    DialogModule,
    FormsModule,
    InputTextModule,
    DatePickerModule,
    PriceCurrencyFieldComponent,
  ],
})
export class GoalAddCardButtonComponent {
  private goalsService = inject(GoalsService);
  private currencyService = inject(CurrencyService);
  visible = signal(false);

  newGoal: Partial<GoalItem> & { currencyCode?: string } = {
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
    this.visible.set(true);
  }

  closeDialog() {
    this.visible.set(false);
    this.resetGoal();
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
    return Number(this.newGoal.targetBudget) < 0 || Number(this.newGoal.goalBudget) < 0;
  }

  private formatDate(value: string | Date | undefined): string {
    if (value == null || value === '') return '';
    const d = (value as unknown) instanceof Date ? value : new Date(value);
    return isNaN((d as Date).getTime()) ? '' : (d as Date).toISOString().split('T')[0];
  }

  private resetGoal() {
    this.newGoal.title = '';
    this.newGoal.targetBudget = 0;
    this.newGoal.goalBudget = 0;
    this.newGoal.startDate = '';
    this.newGoal.endDate = '';
    this.newGoal.currencyCode = this.currencyService.primaryCode();
  }

  onSubmit(form: NgForm) {
    form.form.markAllAsTouched();
    if (form.invalid || this.hasDateError() || this.hasBudgetError()) return;
    const startStr = this.formatDate(this.newGoal.startDate as string | Date);
    const endStr = this.formatDate(this.newGoal.endDate as string | Date);
    if (!startStr || !endStr) return;
    const payload: CreateGoalItem = {
      title: (this.newGoal.title ?? '').trim(),
      targetBudget: Number(this.newGoal.targetBudget) ?? 0,
      goalBudget: Number(this.newGoal.goalBudget) ?? 0,
      currencyCode: this.newGoal.currencyCode || undefined,
      startDate: startStr,
      endDate: endStr,
    };
    this.goalsService.createGoal(payload);
    this.visible.set(false);
    this.resetGoal();
  }
}
