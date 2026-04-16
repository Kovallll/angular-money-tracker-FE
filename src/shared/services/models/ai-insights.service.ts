import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  AiChatHistoryMessage,
  AiChatResponse,
  AiChatSessionItem,
  AiInsightItem,
} from '@/shared/types';

@Injectable({ providedIn: 'root' })
export class AiInsightsHttpService {
  private http = inject(HttpClient);

  list(params?: { status?: string; type?: string }) {
    const qp: Record<string, string> = {};
    if (params?.status) qp['status'] = params.status;
    if (params?.type) qp['type'] = params.type;
    return this.http.get<AiInsightItem[]>('ai/insights', { params: qp });
  }

  recompute() {
    return this.http.post<{ created: number }>('ai/insights/recompute', {});
  }

  ack(id: string, status: 'acknowledged' | 'dismissed') {
    return this.http.post<{ success: boolean }>(`ai/insights/${id}/ack`, { status });
  }

  ask(question: string, sessionId?: string) {
    return this.http.post<AiChatResponse>('ai/chat', { question, sessionId });
  }

  history(limit = 100, sessionId?: string) {
    const params: Record<string, string> = { limit: String(limit) };
    if (sessionId) params['sessionId'] = sessionId;
    return this.http.get<AiChatHistoryMessage[]>('ai/chat/history', {
      params,
    });
  }

  sessions(limit = 30) {
    return this.http.get<AiChatSessionItem[]>('ai/chat/sessions', {
      params: { limit: String(limit) },
    });
  }

  createSession() {
    return this.http.post<AiChatSessionItem>('ai/chat/sessions', {});
  }

  clearSession(id: string) {
    return this.http.post<{ success: boolean }>(`ai/chat/sessions/${id}/clear`, {});
  }
}
