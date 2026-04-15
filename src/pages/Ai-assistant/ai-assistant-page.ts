import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AiInsightsHttpService } from '@/shared/services/models';
import { AiInsightItem } from '@/shared/types';
import { MessageService } from 'primeng/api';
import { TranslatePipe } from '@ngx-translate/core';
import { I18nService } from '@/shared/services';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: Date;
};

@Component({
  selector: 'ai-assistant-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './ai-assistant-page.html',
  styleUrl: './ai-assistant-page.scss',
})
export class AiAssistantPageComponent implements OnInit {
  private readonly ai = inject(AiInsightsHttpService);
  private readonly messageService = inject(MessageService);
  readonly i18n = inject(I18nService);

  readonly loading = signal(false);
  readonly recomputing = signal(false);
  readonly insights = signal<AiInsightItem[]>([]);
  readonly question = signal('');
  readonly chatHistory = signal<ChatMessage[]>([]);
  readonly chatLoading = signal(false);
  readonly quickQuestions = ['ai.quick.q1', 'ai.quick.q2', 'ai.quick.q3', 'ai.quick.q4'];

  ngOnInit(): void {
    this.loadInsights();
    this.chatHistory.set([
      {
        id: this.nextId(),
        role: 'assistant',
        text: this.i18n.t('ai.chat.welcome'),
        createdAt: new Date(),
      },
    ]);
  }

  async loadInsights(): Promise<void> {
    this.loading.set(true);
    try {
      const data = await firstValueFrom(this.ai.list({ status: 'active' }));
      this.insights.set(data);
    } catch (err) {
      console.error(err);
      this.showErrorToast(this.i18n.t('ai.toast.loadInsightsError'));
    } finally {
      this.loading.set(false);
    }
  }

  async recompute(): Promise<void> {
    this.recomputing.set(true);
    try {
      await firstValueFrom(this.ai.recompute());
      await this.loadInsights();
    } finally {
      this.recomputing.set(false);
    }
  }

  async ask(): Promise<void> {
    const q = this.question().trim();
    if (!q || this.chatLoading()) return;
    this.chatLoading.set(true);
    this.chatHistory.update((prev) => [
      ...prev,
      { id: this.nextId(), role: 'user', text: q, createdAt: new Date() },
    ]);
    this.question.set('');
    try {
      const response = await firstValueFrom(this.ai.ask(q));
      this.chatHistory.update((prev) => [
        ...prev,
        { id: this.nextId(), role: 'assistant', text: response.answer, createdAt: new Date() },
      ]);
    } catch (err) {
      console.error(err);
      this.showErrorToast(this.i18n.t('ai.toast.askError'));
      this.chatHistory.update((prev) => [
        ...prev,
        {
          id: this.nextId(),
          role: 'assistant',
          text: this.i18n.t('ai.chat.retryHint'),
          createdAt: new Date(),
        },
      ]);
    } finally {
      this.chatLoading.set(false);
    }
  }

  useQuickQuestion(questionKey: string): void {
    this.question.set(this.i18n.t(questionKey));
    this.ask();
  }

  async ack(id: string): Promise<void> {
    try {
      await firstValueFrom(this.ai.ack(id, 'acknowledged'));
      this.insights.update((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      console.error(err);
      this.showErrorToast(this.i18n.t('ai.toast.ackError'));
    }
  }

  async dismiss(id: string): Promise<void> {
    try {
      await firstValueFrom(this.ai.ack(id, 'dismissed'));
      this.insights.update((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      console.error(err);
      this.showErrorToast(this.i18n.t('ai.toast.dismissError'));
    }
  }

  private showErrorToast(detail: string): void {
    this.messageService.add({
      key: 'toast',
      severity: 'error',
      summary: this.i18n.t('common.error'),
      detail,
      life: 3000,
    });
  }

  formatTime(value: Date): string {
    return new Intl.DateTimeFormat(this.i18n.currentLang() === 'ru' ? 'ru-RU' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(value);
  }

  private nextId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
}
