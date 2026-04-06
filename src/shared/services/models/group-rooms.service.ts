import { groupRoomsUrl } from '@/shared/constants';
import {
  GroupInviteItem,
  GroupRoomDetails,
  GroupRoomItem,
  GroupTransactionItem,
  RoomContributionsResponse,
} from '@/shared/types';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

type CreateRoomPayload = {
  name: string;
  description?: string;
  currencyCode?: string;
  /** URL или произвольная строка; как в CreateGroupRoomDto */
  avatar?: string;
};

type CreateInvitePayload = {
  expiresInHours?: number;
};

type CreateGroupTxPayload = {
  paidBy?: string;
  categoryId?: string;
  /** Личная карта пользователя paidBy (по умолчанию — текущий пользователь) */
  cardId?: number;
  amount: number;
  currencyCode?: string;
  title: string;
  description?: string;
  date: string;
};

@Injectable({
  providedIn: 'root',
})
export class GroupRoomsHttpService {
  private readonly http = inject(HttpClient);

  getMyRooms() {
    return lastValueFrom(this.http.get<GroupRoomItem[]>(groupRoomsUrl));
  }

  getRoomDetails(roomId: string) {
    return lastValueFrom(this.http.get<GroupRoomDetails>(`${groupRoomsUrl}/${roomId}`));
  }

  createRoom(payload: CreateRoomPayload) {
    return lastValueFrom(this.http.post<GroupRoomItem>(groupRoomsUrl, payload));
  }

  createInvite(roomId: string, payload: CreateInvitePayload = {}) {
    return lastValueFrom(
      this.http.post<GroupInviteItem>(`${groupRoomsUrl}/${roomId}/invites`, payload),
    );
  }

  acceptInvite(token: string) {
    return lastValueFrom(this.http.post(`${groupRoomsUrl}/invites/${token}/accept`, {}));
  }

  rejectInvite(token: string) {
    return lastValueFrom(this.http.post(`${groupRoomsUrl}/invites/${token}/reject`, {}));
  }

  updateMemberRole(roomId: string, userId: string, role: 'admin' | 'member') {
    return lastValueFrom(
      this.http.patch(`${groupRoomsUrl}/${roomId}/members/${userId}/role`, { role }),
    );
  }

  removeMember(roomId: string, userId: string) {
    return lastValueFrom(this.http.delete(`${groupRoomsUrl}/${roomId}/members/${userId}`));
  }

  getRoomContributions(roomId: string) {
    return lastValueFrom(
      this.http.get<RoomContributionsResponse>(`${groupRoomsUrl}/${roomId}/contributions`),
    );
  }

  getRoomTransactions(roomId: string) {
    return lastValueFrom(
      this.http.get<GroupTransactionItem[]>(`${groupRoomsUrl}/${roomId}/transactions`),
    );
  }

  createRoomTransaction(roomId: string, payload: CreateGroupTxPayload) {
    return lastValueFrom(
      this.http.post<GroupTransactionItem>(`${groupRoomsUrl}/${roomId}/transactions`, payload),
    );
  }
}
