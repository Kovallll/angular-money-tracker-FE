import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TelegramHttpService } from '@/shared/services/telegram/telegram.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'telegram-link',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './telegram-link.component.html',
  styleUrls: ['./telegram-link.component.scss'],
})
export class TelegramLinkComponent implements OnInit, OnDestroy {
  private readonly telegramService = inject(TelegramHttpService);
  private readonly messageService = inject(MessageService);

  linked = false;
  loading = false;
  private readonly handleWindowFocus = () => void this.refreshStatus(true);
  private readonly handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      void this.refreshStatus(true);
    }
  };

  async ngOnInit() {
    window.addEventListener('focus', this.handleWindowFocus);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    await this.refreshStatus();
  }

  ngOnDestroy(): void {
    window.removeEventListener('focus', this.handleWindowFocus);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }

  private async refreshStatus(notifyOnLinked = false): Promise<void> {
    try {
      const status = await this.telegramService.getStatus();
      if (notifyOnLinked && !this.linked && status.linked) {
        this.messageService.add({
          key: 'toast',
          severity: 'success',
          summary: 'Telegram linked',
          detail: 'Аккаунт Telegram успешно привязан.',
          life: 3000,
        });
      }
      this.linked = status.linked;
    } catch {
      this.linked = false;
    }
  }

  async linkTelegram() {
    if (this.loading) return;
    this.loading = true;

    try {
      const { link } = await this.telegramService.generateLink();
      window.open(link, '_blank');
      setTimeout(() => void this.refreshStatus(true), 1500);
    } catch (err) {
      console.error('Ошибка генерации ссылки Telegram:', err);
    } finally {
      this.loading = false;
    }
  }

  async unlinkTelegram() {
    if (this.loading) return;
    this.loading = true;

    try {
      await this.telegramService.unlink();
      this.linked = false;
      this.messageService.add({
        key: 'toast',
        severity: 'success',
        summary: 'Telegram unlinked',
        detail: 'Привязка Telegram отключена.',
        life: 2500,
      });
    } catch (err) {
      console.error('Ошибка отвязки Telegram:', err);
    } finally {
      this.loading = false;
    }
  }
}
