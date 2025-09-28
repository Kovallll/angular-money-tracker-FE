import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { DividerComponent } from '@/shared/components/divider/divider';
import { SubscribeItem } from '@/shared';

@Component({
  selector: 'subscribe-card-item',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, DividerComponent],
  templateUrl: './subscribe-card-item.component.html',
  styleUrls: ['./subscribe-card-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscribeCardItemComponent {
  subscribe = input.required<SubscribeItem>();
  isLast = input<boolean>(false);
}
