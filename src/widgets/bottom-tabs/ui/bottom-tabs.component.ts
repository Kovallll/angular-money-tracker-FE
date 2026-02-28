import { Component, inject } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { MoreSheetComponent } from './more-sheet/more-sheet.component';
import { moreMenuItems, primaryTabItems } from '../lib/constants';

@Component({
  selector: 'app-bottom-tabs',
  standalone: true,
  imports: [RouterModule, MatIconModule],
  templateUrl: './bottom-tabs.component.html',
  styleUrls: ['./bottom-tabs.component.scss'],
})
export class BottomTabsComponent {
  private bottomSheet = inject(MatBottomSheet);
  router = inject(Router);

  primaryItems = primaryTabItems;
  moreItems = moreMenuItems;
  hasMore = moreMenuItems.length > 0;

  isMoreActive(): boolean {
    const url = this.router.url.replace(/^\//, '').split('/')[0];
    return this.moreItems.some((item) => url === item.path || url.startsWith(item.path + '/'));
  }

  openMore() {
    this.bottomSheet.open(MoreSheetComponent, {
      data: moreMenuItems,
      panelClass: 'more-sheet-panel',
    });
  }
}
