import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-slide',
  standalone: true,
  templateUrl: './slide.html',
  styleUrl: './slide.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlideComponent {}
