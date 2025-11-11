import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';

import { ButtonModule } from 'primeng/button';

@Component({
  standalone: true,
  selector: 'goal-adjust-dialog',
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    InputNumberModule,
    DatePickerModule,
    ButtonModule,
  ],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class GoalAdjustDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<GoalAdjustDialogComponent>,
  ) {}

  onCancel() {
    this.dialogRef.close();
  }

  onSave() {
    this.dialogRef.close(this.data);
  }

  onDelete() {
    this.dialogRef.close({ delete: true });
  }
}
