import { CategoriesCardsComponent } from '@/widgets/categoriesCards/ui/categoriesCards.component';
import { Component } from '@angular/core';

@Component({
  selector: 'categories-page',
  imports: [CategoriesCardsComponent],
  templateUrl: './categories-page.html',
  styleUrl: `./categories-page.scss`,
  standalone: true,
})
export class CategoriesPageComponent {}
