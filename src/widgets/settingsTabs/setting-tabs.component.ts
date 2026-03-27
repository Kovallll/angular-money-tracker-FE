import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DashboardCardComponent, CardBodyComponent } from '@/entities/cards/card';
import { MatTabGroup } from '@angular/material/tabs';
import { MatTab } from '@angular/material/tabs';
import { AccountComponent } from '@/entities/cards/settings/ui/account/account.component';
import { SecurityComponent } from '@/entities/cards/settings/ui/security/security.component';
import { AnalyticsSettingsComponent } from '@/entities/cards/settings/ui/analytics/analytics-settings.component';
import { UserService } from '@/shared';

@Component({
  selector: 'settings-tabs',
  templateUrl: './setting-tabs.component.html',
  styleUrls: ['./setting-tabs.component.scss'],
  imports: [
    DashboardCardComponent,
    CardBodyComponent,
    MatTabGroup,
    MatTab,
    AccountComponent,
    SecurityComponent,
    AnalyticsSettingsComponent,
  ],
})
export class SettingsTabsComponent {
  private userService = inject(UserService);

  selectedTab = signal('Account');
  user = toSignal(this.userService.currentUser$, { initialValue: this.userService.currentUser });

  onChangeTabContent(tabLabel: string) {
    this.selectedTab.set(tabLabel);
  }

  tabs = ['Account', 'Security', 'Analytics'];
}
