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
  };
  private dialogRef = inject(MatDialogRef<GoalAdjustDialogComponent>);
  private confirmationService = inject(ConfirmationService);
  private currencyService = inject(CurrencyService);

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
