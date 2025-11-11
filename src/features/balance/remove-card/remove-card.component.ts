import { BalancesHttpService } from '@/shared';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  standalone: true,
  selector: 'balance-remove-card-button',
  templateUrl: './remove-card.component.html',
  styleUrls: ['./remove-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, ButtonModule],
})
export class BalanceRemoveCardButtonComponent {
  private balancesHttpService = inject(BalancesHttpService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  handleDelete() {
    const id = this.route.snapshot.paramMap.get('id');
    this.balancesHttpService.deleteCard(Number(id)).subscribe({
      next: () => {
        this.router.navigate(['balances']);
      },
      error: (err) => console.error('Delete error', err),
    });
  }
}
