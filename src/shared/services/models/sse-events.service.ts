import { Injectable, OnDestroy, signal } from '@angular/core';
import { environment } from '@/environments/environment';

type GroupEvent = {
  type: string;
  roomId?: string;
  actorId?: string;
  payload?: Record<string, unknown>;
  ts: number;
};

@Injectable({
  providedIn: 'root',
})
export class SseEventsService implements OnDestroy {
  private source: EventSource | null = null;
  readonly lastGroupEvent = signal<GroupEvent | null>(null);
  readonly isConnected = signal<boolean>(false);

  connectGroupEvents(token: string) {
    if (this.source) return;
    const base = environment.apiUrl ?? '';
    const url = `${base}/api/group-rooms/events?access_token=${encodeURIComponent(token)}`;
    this.source = new EventSource(url);

    this.source.onopen = () => this.isConnected.set(true);
    this.source.onerror = () => this.isConnected.set(false);
    const handleEvent = (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data) as GroupEvent;
        this.lastGroupEvent.set(parsed);
      } catch {
        // ignore malformed events
      }
    };
    this.source.onmessage = handleEvent;
    this.source.addEventListener('room_created', handleEvent as EventListener);
    this.source.addEventListener('invite_created', handleEvent as EventListener);
    this.source.addEventListener('member_joined', handleEvent as EventListener);
    this.source.addEventListener('member_removed', handleEvent as EventListener);
    this.source.addEventListener('member_role_changed', handleEvent as EventListener);
    this.source.addEventListener('group_transaction_created', handleEvent as EventListener);
    this.source.addEventListener('group_transaction_updated', handleEvent as EventListener);
    this.source.addEventListener('group_transaction_deleted', handleEvent as EventListener);
  }

  disconnect() {
    if (this.source) {
      this.source.close();
      this.source = null;
    }
    this.isConnected.set(false);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
