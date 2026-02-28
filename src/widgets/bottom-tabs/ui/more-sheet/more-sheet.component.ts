import { Component, inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { MenuItem } from '../types';

@Component({
  selector: 'app-more-sheet',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './more-sheet.component.html',
  styleUrls: ['./more-sheet.component.scss'],
})
export class MoreSheetComponent {
  private bottomSheetRef = inject(MatBottomSheetRef<MoreSheetComponent>);
  private router = inject(Router);
  items = inject<MenuItem[]>(MAT_BOTTOM_SHEET_DATA);

  select(item: MenuItem) {
    this.router.navigate(['/', item.path]);
    this.bottomSheetRef.dismiss();
  }
}
