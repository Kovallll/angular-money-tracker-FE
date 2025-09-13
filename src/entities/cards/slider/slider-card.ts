import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-slider',
  standalone: true,
  templateUrl: './slider-card.html',
  styleUrls: ['./slider-card.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderCardComponent {
  items = input<any[]>([]);

  currentIndex = 0;

  get canPrev() {
    return this.currentIndex > 0;
  }

  get canNext() {
    return this.currentIndex < this.items().length - 1;
  }

  handlePrev() {
    if (this.canPrev) this.currentIndex--;
  }

  handleNext() {
    if (this.canNext) this.currentIndex++;
  }

  goTo(index: number) {
    this.currentIndex = index;
  }
}
