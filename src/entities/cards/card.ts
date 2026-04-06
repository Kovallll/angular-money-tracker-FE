import { Component, ContentChild, ChangeDetectionStrategy, input, inject } from '@angular/core';
import { DividerComponent } from '@/shared/components/divider/divider';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';
import type { SeeAllNavigation } from './see-all-navigation';

export type { SeeAllNavigation } from './see-all-navigation';

@Component({
  selector: 'card-header',
  standalone: true,
  template: `<ng-content></ng-content>`,
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardHeaderComponent {}

@Component({
  selector: 'card-body',
  standalone: true,
  template: `<ng-content></ng-content>`,
  styles: `
    :host {
      height: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardBodyComponent {}

@Component({
  selector: 'dashboard-card',
  standalone: true,
  templateUrl: './card.html',
  styleUrls: ['./card.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DividerComponent, AppIconComponent],
})
export class DashboardCardComponent {
  router = inject(Router);

  title = input<string>('');
  seeAllPath = input<string>('');
  /** When set (e.g. room overview), takes precedence over {@link seeAllPath}. */
  seeAllNavigation = input<SeeAllNavigation | null>(null);
  isWithSeeAll = input(false);
  hideHeaderDivider = input(false);
  @ContentChild(CardHeaderComponent) cardHeader?: CardHeaderComponent;

  onSeeAllClick() {
    const nav = this.seeAllNavigation();
    if (nav?.commands?.length) {
      void this.router.navigate(nav.commands, {
        queryParams: nav.queryParams,
      });
      return;
    }
    const path = this.seeAllPath();
    if (path) void this.router.navigate([path]);
  }
}
