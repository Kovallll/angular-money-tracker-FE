import { UserService } from '@/shared/services/user/user.service';
import { User } from '@/shared';
import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  effect,
  inject,
  signal,
} from '@angular/core';
import { environment } from '@/environments/environment';
import { MatButtonModule } from '@angular/material/button';
import { ExportReportComponent } from './exportReport/export-report.component';
import { NotificationComponent } from '@/entities/notification/notification.component';
import { TelegramLinkComponent } from './telegramLink/telegram-link.component';
import { CurrencySelectorComponent } from '@/shared/components/currency-selector/currency-selector.component';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';
import { TranslatePipe } from '@ngx-translate/core';
import { I18nService } from '@/shared/services';
import { DialogService } from 'primeng/dynamicdialog';
import { QuickAddTransactionModalComponent } from '@/features/transactions/quick-add-modal/quick-add-transaction-modal.component';

@Component({
  selector: 'app-header',
  imports: [
    MatButtonModule,
    CurrencySelectorComponent,
    ExportReportComponent,
    NotificationComponent,
    TelegramLinkComponent,
    AppIconComponent,
    TranslatePipe,
  ],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
  host: { class: 'container' },
  providers: [DialogService],
})
export class HeaderComponent implements OnInit {
  @ViewChild('compactMoreButton') compactMoreButton?: ElementRef<HTMLElement>;
  @ViewChild('compactMorePanel') compactMorePanel?: ElementRef<HTMLElement>;

  user: User | null = null;
  date = '';
  avatarLoadError = false;
  readonly i18n = inject(I18nService);
  readonly compactMenuOpen = signal(false);
  readonly isUltraCompact = signal(false);

  constructor(
    private userService: UserService,
    private dialogService: DialogService,
  ) {
    effect(() => {
      const lang = this.i18n.currentLang();
      this.date = new Date().toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US');
    });
    this.updateCompactMode();
  }

  ngOnInit() {
    this.user = this.userService.currentUser;
    this.updateCompactMode();
  }

  avatarUrl(avatar: string): string {
    if (!avatar) return '';
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) return avatar;
    const base = environment.apiUrl ?? '';
    return base ? `${base}/api${avatar.startsWith('/') ? avatar : '/' + avatar}` : avatar;
  }

  openQuickAddTransaction(): void {
    this.compactMenuOpen.set(false);
    this.dialogService.open(QuickAddTransactionModalComponent, {
      header: this.i18n.t('header.quickAddTransaction'),
      closable: true,
      dismissableMask: true,
      styleClass: 'modal',
      width: 'min(100vw - 24px, 440px)',
      focusOnShow: false,
    });
  }

  switchLanguage(lang: 'ru' | 'en'): void {
    this.i18n.setLanguage(lang);
    this.compactMenuOpen.set(false);
  }

  toggleCompactMenu(): void {
    this.compactMenuOpen.update((v) => !v);
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateCompactMode();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.compactMenuOpen()) return;
    const target = event.target as Node | null;
    if (!target) return;
    const inButton = !!this.compactMoreButton?.nativeElement.contains(target);
    const inPanel = !!this.compactMorePanel?.nativeElement.contains(target);
    if (!inButton && !inPanel) {
      this.compactMenuOpen.set(false);
    }
  }

  private updateCompactMode(): void {
    if (typeof window === 'undefined') return;
    const ultra = window.innerWidth < 400;
    this.isUltraCompact.set(ultra);
    if (!ultra) {
      this.compactMenuOpen.set(false);
    }
  }
}
