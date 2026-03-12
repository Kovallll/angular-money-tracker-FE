import { UserService } from '@/shared/services/user/user.service';
import { User } from '@/shared';
import { Component, OnInit } from '@angular/core';
import { environment } from '@/environments/environment';
import { MatButtonModule } from '@angular/material/button';
import { ExportReportComponent } from './exportReport/export-report.component';
import { NotificationComponent } from '@/entities/notification/notification.component';
import { TelegramLinkComponent } from './telegramLink/telegram-link.component';
import { CurrencySelectorComponent } from '@/shared/components/currency-selector/currency-selector.component';
import { AppIconComponent } from '@/shared/components/app-icon/app-icon.component';

@Component({
  selector: 'app-header',
  imports: [
    MatButtonModule,
    CurrencySelectorComponent,
    ExportReportComponent,
    NotificationComponent,
    TelegramLinkComponent,
    AppIconComponent,
  ],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
  host: { class: 'container' },
})
export class HeaderComponent implements OnInit {
  user: User | null = null;
  date = new Date().toLocaleDateString();
  avatarLoadError = false;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.user = this.userService.currentUser;
  }

  avatarUrl(avatar: string): string {
    if (!avatar) return '';
    if (avatar.startsWith('http://') || avatar.startsWith('https://')) return avatar;
    const base = environment.apiUrl ?? '';
    return base ? `${base}/api${avatar.startsWith('/') ? avatar : '/' + avatar}` : avatar;
  }
}
