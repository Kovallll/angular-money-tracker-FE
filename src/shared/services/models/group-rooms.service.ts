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
import { lastValueFrom, Observable } from 'rxjs';

type CreateRoomPayload = {
  name: string;
  description?: string;
  currencyCode?: string;
  /** URL или произвольная строка; как в CreateGroupRoomDto */
  avatar?: string;
};

type UpdateRoomPayload = {
  name?: string;
  description?: string;
  avatar?: string;
};

type CreateInvitePayload = {
  expiresInHours?: number;
};

type UpdateGroupTxPayload = {
  paidBy?: string;
  categoryId?: string;
  amount?: number;
  currencyCode?: string;
  title?: string;
  description?: string;
  date?: string;
};

type CreateGroupTxPayload = {
  paidBy?: string;
  categoryId?: string;
  /** Личная карта пользователя paidBy (по умолчанию — текущий пользователь) */
  cardId?: number;
  type?: 'expense' | 'revenue' | 'transfer';
  transferToCardId?: number;
  affectsCardBalance?: boolean;
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

  updateRoom(roomId: string, payload: UpdateRoomPayload) {
    return lastValueFrom(
      this.http.patch<{
        id: string;
        name: string;
        description?: string | null;
        avatar?: string | null;
        currencyCode: string;
        createdBy: string;
        createdAt: string;
        updatedAt: string;
      }>(`${groupRoomsUrl}/${roomId}`, payload),
    );
  }

  deleteRoom(roomId: string) {
    return lastValueFrom(this.http.delete<{ success: boolean }>(`${groupRoomsUrl}/${roomId}`));
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

  updateRoomTransaction(roomId: string, transactionId: string, payload: UpdateGroupTxPayload) {
    return this.http.patch<GroupTransactionItem>(
      `${groupRoomsUrl}/${roomId}/transactions/${transactionId}`,
      payload,
    );
  }

  deleteRoomTransaction(roomId: string, transactionId: string): Observable<void> {
    return this.http.delete<void>(`${groupRoomsUrl}/${roomId}/transactions/${transactionId}`);
  }
}
