import { Component, ContentChild, ChangeDetectionStrategy, input, inject } from '@angular/core';
import { DividerComponent } from '@/shared/components/divider/divider';
import { Router } from '@angular/router';
import { MatIcon, MatIconModule } from '@angular/material/icon';

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
  imports: [DividerComponent, MatIcon],
})
export class DashboardCardComponent {
  router = inject(Router);

  title = input<string>('');
  seeAllPath = input<string>('');
  isWithSeeAll = input(false);
  @ContentChild(CardHeaderComponent) cardHeader?: CardHeaderComponent;

  onRedirect(path: string) {
    this.router.navigate([path]);
  }
}
