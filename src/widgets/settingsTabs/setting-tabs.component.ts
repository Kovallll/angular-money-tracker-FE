import { Component, signal } from '@angular/core';
import { DashboardCardComponent, CardBodyComponent } from '@/entities/cards/card';
import { MatTabGroup } from '@angular/material/tabs';
import { MatTab } from '@angular/material/tabs';
import { AccountComponent } from '@/entities/cards/settings/ui/account/account.component';
import { SecurityComponent } from '@/entities/cards/settings/ui/security/security.component';
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
  ],
})
export class SettingsTabsComponent {
  selectedTab: string = 'Account';
  user = signal(this.userService.getUser());

  onChangeTabContent(tabLabel: string) {
    this.selectedTab = tabLabel;
  }

  tabs = ['Account', 'Security'];

  constructor(private userService: UserService) {}
}
