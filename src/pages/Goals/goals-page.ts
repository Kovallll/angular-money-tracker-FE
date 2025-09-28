import { Component } from '@angular/core';
import { GoalsCardsComponent } from '@/widgets/goalsCards/goalsCards.component';

@Component({
  selector: 'app-goals-page',
  imports: [GoalsCardsComponent],
  templateUrl: './goals-page.html',
  styleUrl: `./goals-page.scss`,
})
export class GoalsPageComponent {}
