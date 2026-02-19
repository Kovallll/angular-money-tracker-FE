import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

interface LinkResponse {
  code: string;
  link: string;
}

interface StatusResponse {
  linked: boolean;
  telegramUserId?: number;
}

@Injectable({ providedIn: 'root' })
export class TelegramHttpService {
  private http = inject(HttpClient);

  generateLink(): Promise<LinkResponse> {
    return lastValueFrom(this.http.post<LinkResponse>('telegram/link', {}));
  }

  getStatus(): Promise<StatusResponse> {
    return lastValueFrom(this.http.get<StatusResponse>('telegram/status'));
  }

  unlink(): Promise<{ success: boolean }> {
    return lastValueFrom(this.http.delete<{ success: boolean }>('telegram/link'));
  }
}
