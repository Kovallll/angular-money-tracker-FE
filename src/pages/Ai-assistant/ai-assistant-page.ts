import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AiInsightsHttpService } from '@/shared/services/models';
import { AiChatSessionItem, AiInsightItem } from '@/shared/types';
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
  readonly sessions = signal<AiChatSessionItem[]>([]);
  readonly selectedSessionId = signal<string | null>(null);
  readonly quickQuestions = ['ai.quick.q1', 'ai.quick.q2', 'ai.quick.q3', 'ai.quick.q4'];

  ngOnInit(): void {
    this.loadInsights();
    this.loadSessionsAndHistory();
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
      const sid = this.selectedSessionId() ?? undefined;
      const response = await firstValueFrom(this.ai.ask(q, sid));
      this.chatHistory.update((prev) => [
        ...prev,
        { id: this.nextId(), role: 'assistant', text: response.answer, createdAt: new Date() },
      ]);
      await this.refreshSessions();
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

  async loadChatHistory(): Promise<void> {
    this.chatLoading.set(true);
    try {
      const sid = this.selectedSessionId() ?? undefined;
      const history = await firstValueFrom(this.ai.history(150, sid));
      if (!history.length) {
        this.chatHistory.set([
          {
            id: this.nextId(),
            role: 'assistant',
            text: this.i18n.t('ai.chat.welcome'),
            createdAt: new Date(),
          },
        ]);
        return;
      }
      this.chatHistory.set(
        history.map((m) => ({
          id: m.id,
          role: m.role,
          text: m.message,
          createdAt: new Date(m.createdAt),
        })),
      );
    } catch (err) {
      console.error(err);
      this.chatHistory.set([
        {
          id: this.nextId(),
          role: 'assistant',
          text: this.i18n.t('ai.chat.welcome'),
          createdAt: new Date(),
        },
      ]);
      this.showErrorToast(this.i18n.t('ai.toast.loadInsightsError'));
    } finally {
      this.chatLoading.set(false);
    }
  }

  async loadSessionsAndHistory(): Promise<void> {
    await this.refreshSessions();
    await this.loadChatHistory();
  }

  async refreshSessions(): Promise<void> {
    const sessions = await firstValueFrom(this.ai.sessions(30));
    this.sessions.set(sessions);
    const selected = this.selectedSessionId();
    if (!selected || !sessions.some((s) => s.id === selected)) {
      this.selectedSessionId.set(sessions[0]?.id ?? null);
    }
  }

  async createNewSession(): Promise<void> {
    if (this.chatLoading()) return;
    const created = await firstValueFrom(this.ai.createSession());
    this.sessions.update((prev) => [created, ...prev]);
    this.selectedSessionId.set(created.id);
    this.chatHistory.set([
      {
        id: this.nextId(),
        role: 'assistant',
        text: this.i18n.t('ai.chat.welcome'),
        createdAt: new Date(),
      },
    ]);
  }

  async clearCurrentSession(): Promise<void> {
    const sid = this.selectedSessionId();
    if (!sid || this.chatLoading()) return;
    await firstValueFrom(this.ai.clearSession(sid));
    this.chatHistory.set([
      {
        id: this.nextId(),
        role: 'assistant',
        text: this.i18n.t('ai.chat.welcome'),
        createdAt: new Date(),
      },
    ]);
    await this.refreshSessions();
  }

  async selectSession(id: string): Promise<void> {
    if (this.selectedSessionId() === id) return;
    this.selectedSessionId.set(id);
    await this.loadChatHistory();
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

  formatSessionLabel(session: AiChatSessionItem): string {
    const date = session.lastMessageAt ?? session.updatedAt ?? session.createdAt;
    const dt = new Date(date);
    return new Intl.DateTimeFormat(this.i18n.currentLang() === 'ru' ? 'ru-RU' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dt);
  }

  private nextId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
}
