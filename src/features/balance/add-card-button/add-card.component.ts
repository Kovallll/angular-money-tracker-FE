import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';
import { AddCardModalComponent } from './modal/add-card-modal.component';
import { DialogService, DynamicDialogModule, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AppButtonComponent } from '@/shared/components/app-button/app-button.component';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService } from '@/shared/services';

@Component({
  standalone: true,
  selector: 'balance-add-card-button',
  templateUrl: './add-card.component.html',
  styleUrls: ['./add-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppButtonComponent, DynamicDialogModule, AppIconComponent, TranslateModule],
  providers: [DialogService],
})
export class BalanceAddCardButtonComponent {
  ref: DynamicDialogRef | undefined | null;
  private i18n = inject(I18nService);

  constructor(public dialogService: DialogService) {}

  show() {
    this.ref = this.dialogService.open(AddCardModalComponent, {
      header: this.i18n.t('balances.addCard'),
      closable: true,
      dismissableMask: true,
      styleClass: 'modal add-card-modal',
      width: '660px',
    });
  }
}
