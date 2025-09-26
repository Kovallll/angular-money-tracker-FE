import { Component } from '@angular/core';
import { DashboardCardsComponent } from '@/widgets/dashboardCards/dashboardCards.component';

@Component({
  selector: 'dashboard-page',
  standalone: true,
  imports: [DashboardCardsComponent],
  templateUrl: './dashboard-page.html',
  styleUrl: `./dashboard-page.scss`,
})
export class DashboardPageComponent {}
