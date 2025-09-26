import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { DividerComponent } from '@/shared/components/divider/divider';

@Component({
  selector: 'subscribe-card-item',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, DividerComponent],
  templateUrl: './subscribe-card-item.component.html',
  styleUrls: ['./subscribe-card-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscribeCardItemComponent {
  item = input.required<any>();
  isLast = input<boolean>(false);
}
