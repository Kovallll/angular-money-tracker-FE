import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardCardComponent, CardBodyComponent } from '@/entities/cards/card';
import { AccountComponent } from '@/entities/cards/settings/ui/account/account.component';
import { SecurityComponent } from '@/entities/cards/settings/ui/security/security.component';
import { AnalyticsSettingsComponent } from '@/entities/cards/settings/ui/analytics/analytics-settings.component';
import { UserService } from '@/shared';
import { TranslateModule } from '@ngx-translate/core';

type SettingsTab = 'Account' | 'Security' | 'Analytics';

const TAB_QUERY: Record<string, SettingsTab> = {
  account: 'Account',
  security: 'Security',
  analytics: 'Analytics',
};

const QUERY_BY_TAB: Record<SettingsTab, string> = {
  Account: 'account',
  Security: 'security',
  Analytics: 'analytics',
};

@Component({
  selector: 'settings-tabs',
  templateUrl: './setting-tabs.component.html',
  styleUrls: ['./setting-tabs.component.scss'],
  imports: [
    DashboardCardComponent,
    CardBodyComponent,
    AccountComponent,
    SecurityComponent,
    AnalyticsSettingsComponent,
    TranslateModule,
  ],
})
export class SettingsTabsComponent {
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  selectedTab = signal<SettingsTab>(
    SettingsTabsComponent.tabFromQuery(this.route.snapshot.queryParamMap.get('tab')),
  );
  user = toSignal(this.userService.currentUser$, { initialValue: this.userService.currentUser });

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.selectedTab.set(SettingsTabsComponent.tabFromQuery(params.get('tab')));
    });
  }

  private static tabFromQuery(raw: string | null): SettingsTab {
    const key = raw?.toLowerCase().trim() ?? '';
    return TAB_QUERY[key] ?? 'Account';
  }

  selectTab(tabLabel: string) {
    const tab = tabLabel as SettingsTab;
    this.selectedTab.set(tab);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: QUERY_BY_TAB[tab] },
      replaceUrl: true,
    });
  }

  tabs: SettingsTab[] = ['Account', 'Security', 'Analytics'];
}
