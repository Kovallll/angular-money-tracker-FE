import { BalancesHttpService } from '@/shared';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppButtonComponent } from '@/shared/components/app-button/app-button.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService } from '@/shared/services';

@Component({
  standalone: true,
  selector: 'balance-remove-card-button',
  templateUrl: './remove-card.component.html',
  styleUrls: ['./remove-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppButtonComponent, AppIconComponent, TranslateModule],
})
export class BalanceRemoveCardButtonComponent {
  private balancesHttpService = inject(BalancesHttpService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private i18n = inject(I18nService);

  handleDelete() {
    this.confirmationService.confirm({
      message: this.i18n.t('balances.confirmDeleteMessage'),
      header: this.i18n.t('balances.confirmDeleteTitle'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.i18n.t('balances.delete'),
      rejectLabel: this.i18n.t('balances.cancel'),
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
          summary: this.i18n.t('common.success'),
          detail: this.i18n.t('balances.cardDeleted'),
          life: 3000,
        });
        this.router.navigate(['balances']);
      },
      error: () => {
        this.messageService.add({
          key: 'toast',
          severity: 'error',
          summary: this.i18n.t('common.error'),
          detail: this.i18n.t('balances.deleteCardError'),
          life: 4000,
        });
      },
    });
  }
}
