import { BalancesHttpService } from '@/shared';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppButtonComponent } from '@/shared/components/app-button/app-button.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';

@Component({
  standalone: true,
  selector: 'balance-remove-card-button',
  templateUrl: './remove-card.component.html',
  styleUrls: ['./remove-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppButtonComponent, AppIconComponent],
})
export class BalanceRemoveCardButtonComponent {
  private balancesHttpService = inject(BalancesHttpService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  handleDelete() {
    this.confirmationService.confirm({
      message: 'Delete this card? Related data will not be deleted.',
      header: 'Confirm deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      accept: () => this.doDelete(),
    });
  }

  private doDelete() {
    const id = this.route.snapshot.paramMap.get('id');
    this.balancesHttpService.deleteCard(Number(id)).subscribe({
      next: () => {
        this.messageService.add({
          key: 'toast',
          severity: 'success',
          summary: 'Success',
          detail: 'Card deleted',
          life: 3000,
        });
        this.router.navigate(['balances']);
      },
      error: () => {
        this.messageService.add({
          key: 'toast',
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete card',
          life: 4000,
        });
      },
    });
  }
}
