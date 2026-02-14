import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { User } from '@/shared/types';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // Текущий пользователь из AuthService
  get currentUser$(): Observable<User | null> {
    return this.authService.user$;
  }

  get currentUser(): User | null {
    return this.authService['currentUser'].value;
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  get userId(): string | null {
    return this.currentUser?.id || null;
  }

  // Обновление профиля
  async updateProfile(data: Partial<User>): Promise<User> {
    const userId = this.userId;
    if (!userId) throw new Error('Not authenticated');

    const response = await this.http.patch<User>(`users/${userId}`, data).toPromise();

    if (!response) throw new Error('Update failed');

    // Обновляем локальные данные
    this.authService.updateUserData(response);
    return response;
  }

  // Загрузка аватара
  async uploadAvatar(file: File): Promise<string> {
    const userId = this.userId;
    if (!userId) throw new Error('Not authenticated');

    const formData = new FormData();
    formData.append('avatar', file);

    const response = await this.http
      .post<{ avatarUrl: string }>(`users/${userId}/avatar`, formData)
      .toPromise();

    if (!response) throw new Error('Upload failed');

    // Обновляем локальные данные
    this.authService.updateUserData({ avatar: response.avatarUrl });
    return response.avatarUrl;
  }

  // Смена пароля
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    const userId = this.userId;
    if (!userId) throw new Error('Not authenticated');

    await this.http
      .post(`users/${userId}/change-password`, {
        oldPassword,
        newPassword,
      })
      .toPromise();
  }

  // Удаление аккаунта
  async deleteAccount(): Promise<void> {
    const userId = this.userId;
    if (!userId) throw new Error('Not authenticated');

    await this.http.delete(`users/${userId}`).toPromise();

    this.authService.logout();
  }

  // Получение статистики пользователя
  async getStats(): Promise<any> {
    const userId = this.userId;
    if (!userId) throw new Error('Not authenticated');

    return this.http.get(`users/${userId}/stats`).toPromise();
  }
}
