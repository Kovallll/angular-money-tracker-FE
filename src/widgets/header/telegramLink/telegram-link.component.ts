import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TelegramHttpService } from '@/shared/services/telegram/telegram.service';

@Component({
  selector: 'telegram-link',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './telegram-link.component.html',
  styleUrls: ['./telegram-link.component.scss'],
})
export class TelegramLinkComponent implements OnInit {
  linked = false;
  loading = false;

  constructor(private telegramService: TelegramHttpService) {}

  async ngOnInit() {
    try {
      const status = await this.telegramService.getStatus();
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
    } catch (err) {
      console.error('Ошибка отвязки Telegram:', err);
    } finally {
      this.loading = false;
    }
  }
}
