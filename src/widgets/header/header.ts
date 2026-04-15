import { UserService } from '@/shared/services/user/user.service';
import { User } from '@/shared';
import { Component, OnInit, effect, inject } from '@angular/core';
import { environment } from '@/environments/environment';
import { MatButtonModule } from '@angular/material/button';
import { ExportReportComponent } from './exportReport/export-report.component';
import { NotificationComponent } from '@/entities/notification/notification.component';
import { TelegramLinkComponent } from './telegramLink/telegram-link.component';
import { CurrencySelectorComponent } from '@/shared/components/currency-selector/currency-selector.component';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';
import { TranslatePipe } from '@ngx-translate/core';
import { I18nService } from '@/shared/services';

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
})
export class HeaderComponent implements OnInit {
  user: User | null = null;
  date = '';
  avatarLoadError = false;
  readonly i18n = inject(I18nService);

  constructor(private userService: UserService) {
    effect(() => {
      const lang = this.i18n.currentLang();
      this.date = new Date().toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US');
    });
  }

  ngOnInit() {
    this.user = this.userService.currentUser;
  }

  avatarUrl(avatar: string): string {
    if (!avatar) return '';
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) return avatar;
    const base = environment.apiUrl ?? '';
    return base ? `${base}/api${avatar.startsWith('/') ? avatar : '/' + avatar}` : avatar;
  }

  switchLanguage(lang: 'ru' | 'en'): void {
    this.i18n.setLanguage(lang);
  }
}
