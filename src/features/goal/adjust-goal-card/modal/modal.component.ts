import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { AppModalShellComponent } from '@/shared/components/app-modal-shell/app-modal-shell.component';
import { ConfirmationService } from 'primeng/api';
import { PriceCurrencyFieldComponent } from '@/shared/components/price-currency-field/price-currency-field.component';
import { CurrencyService } from '@/shared/services/currency/currency.service';
import { CategoriesHttpService } from '@/shared/services/models/categories.service';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { Select } from 'primeng/select';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';

@Component({
  standalone: true,
  selector: 'goal-adjust-dialog',
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    DatePickerModule,
    AppModalShellComponent,
    PriceCurrencyFieldComponent,
    Select,
    AppIconComponent,
  ],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class GoalAdjustDialogComponent {
  data = inject(MAT_DIALOG_DATA) as Record<string, unknown> & {
    title?: string;
    targetBudget?: number;
    goalBudget?: number;
    startDate?: string;
    endDate?: string;
    currencyCode?: string;
    categoryId?: string | null;
  };
  private dialogRef = inject(MatDialogRef<GoalAdjustDialogComponent>);
  private confirmationService = inject(ConfirmationService);
  private currencyService = inject(CurrencyService);
  private categoriesHttpService = inject(CategoriesHttpService);

  categories = injectQuery(() => ({
    queryKey: ['categories'] as const,
    queryFn: () => this.categoriesHttpService.getCategories(),
  }));

  get currencyCode(): string {
    return this.data.currencyCode ?? this.currencyService.primaryCode();
  }
  set currencyCode(v: string) {
    this.data.currencyCode = v;
  }

  get targetBudget(): number {
    return this.data.targetBudget ?? 0;
  }
  set targetBudget(v: number) {
    this.data.targetBudget = v;
  }

  get goalBudget(): number {
    return this.data.goalBudget ?? 0;
  }
  set goalBudget(v: number) {
    this.data.goalBudget = v;
  }

  /** Нормализованные опции категорий (id как строка) для совпадения с goal.categoryId. */
  get categoryOptions(): { id: string; title: string; icon: string }[] {
    const list = this.categories.data() ?? [];
    return list.map((c) => ({ ...c, id: String(c.id) }));
  }

  /** Текущая категория цели (строка) для привязки к p-select. */
  get selectedCategoryId(): string | null {
    const v = this.data.categoryId;
    return v != null && v !== '' ? String(v) : null;
  }
  set selectedCategoryId(v: string | null) {
    this.data.categoryId = v ?? undefined;
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSave() {
    this.dialogRef.close(this.data);
  }

  hasDateError(): boolean {
    const start = this.data?.startDate;
    const end = this.data?.endDate;
    if (!start || !end) return false;
    const startDate = (start as unknown) instanceof Date ? start : new Date(start as string);
    const endDate = (end as unknown) instanceof Date ? end : new Date(end as string);
    if (isNaN((startDate as Date).getTime()) || isNaN((endDate as Date).getTime())) return false;
    return (endDate as Date) < (startDate as Date);
  }

  hasBudgetError(): boolean {
    return this.goalBudget <= 0 || this.targetBudget > this.goalBudget;
  }

  onDelete() {
    this.confirmationService.confirm({
      message: `Delete goal «${this.data?.title ?? ''}»?`,
      header: 'Confirm deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      accept: () => this.dialogRef.close({ delete: true }),
    });
  }
}
