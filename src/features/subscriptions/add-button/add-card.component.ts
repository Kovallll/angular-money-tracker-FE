import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { AppButtonComponent } from '@/shared/components/app-button/app-button.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { AddSubscriptionModalComponent } from './modal/add-card-modal.component';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';
import { TranslateModule } from '@ngx-translate/core';
import { I18nService } from '@/shared/services';

@Component({
  standalone: true,
  selector: 'subscription-add-button',
  templateUrl: './add-card.component.html',
  styleUrls: ['./add-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppButtonComponent, AppIconComponent, TranslateModule],
  providers: [DialogService],
})
export class SubscriptionAddButtonComponent {
  ref: DynamicDialogRef | undefined | null;
  private i18n = inject(I18nService);

  groupRoomId = input<string | undefined>(undefined);

  constructor(public dialogService: DialogService) {}

  show() {
    const rid = this.groupRoomId()?.trim();
    this.ref = this.dialogService.open(AddSubscriptionModalComponent, {
      header: this.i18n.t('subscriptions.addSubscription'),
      closable: true,
      dismissableMask: true,
      styleClass: 'modal subscription-modal',
      data: rid ? { groupRoomId: rid } : undefined,
      focusOnShow: false,
    });
  }
}
