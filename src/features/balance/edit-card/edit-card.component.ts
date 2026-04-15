import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';
import { UpdateCardModalComponent } from './modal/edit-card-modal.component';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AppButtonComponent } from '@/shared/components/app-button/app-button.component';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService } from '@/shared/services';

@Component({
  standalone: true,
  selector: 'balance-update-card-button',
  templateUrl: './edit-card.component.html',
  styleUrls: ['./edit-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppButtonComponent, DynamicDialogModule, AppIconComponent, TranslateModule],
  providers: [DialogService],
})
export class BalanceEditCardButtonComponent {
  ref: DynamicDialogRef | undefined | null;
  private i18n = inject(I18nService);

  constructor(public dialogService: DialogService) {}

  show() {
    this.ref = this.dialogService.open(UpdateCardModalComponent, {
      header: this.i18n.t('balances.editCard'),
      closable: true,
      dismissableMask: true,
      styleClass: 'modal',
    });
  }
}
