// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { PushService } from '../push/push.service';

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthResponse {
  user: { id: string; email: string; name: string; avatar: string };
  accessToken: string;
  refreshToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser = new BehaviorSubject<any>(null);
  public user$ = this.currentUser.asObservable();

  constructor(
    private http: HttpClient,
    private pushService: PushService,
  ) {
    this.loadStoredAuth();
  }

  private loadStoredAuth() {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const user = localStorage.getItem('user');

    if (accessToken && user) {
      this.currentUser.next(JSON.parse(user));
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    // Получаем или создаём push-подписку
    let pushSubscription = await this.pushService.getCurrentSubscription();

    if (!pushSubscription) {
      try {
        pushSubscription = await this.pushService.createSubscription();
      } catch (e) {
        console.log('Push не настроен, продолжаем без него');
      }
    }

    const response = await this.http
      .post<AuthResponse>(`auth/login`, {
        email,
        password,
        pushSubscription: pushSubscription?.toJSON(),
        userAgent: navigator.userAgent,
      })
      .toPromise();

    if (!response) throw new Error('Login failed');

    this.storeAuth(response);
    this.currentUser.next(response.user);

    return response;
  }

  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    const response = await this.http
      .post<AuthResponse>(`auth/register`, {
        email,
        password,
        name,
      })
      .toPromise();

    if (!response) throw new Error('Registration failed');

    this.storeAuth(response);
    this.currentUser.next(response.user);

    return response;
  }

  // Исправленный refreshToken — возвращает Observable
  refreshToken(): Observable<Tokens | null> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return of(null);

    return this.http
      .post<AuthResponse>(`auth/refresh`, {
        refreshToken,
      })
      .pipe(
        tap((response) => {
          this.storeAuth(response);
        }),
        switchMap((response) => {
          return of({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          });
        }),
        catchError((error) => {
          this.logout();
          return of(null);
        }),
      );
  }

  logout(): void {
    const userId = this.currentUser.value?.id;
    if (userId) {
      this.http.post(`auth/logout`, {}).subscribe();
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.currentUser.next(null);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  private storeAuth(response: AuthResponse): void {
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.user));
  }

  updateUserData(data: Partial<AuthResponse['user']>): void {
    const current = this.currentUser.value;
    if (!current) return;

    const updated = { ...current, ...data };
    this.currentUser.next(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  }

  // Получение полного профиля с сервера
  async loadUserProfile(): Promise<void> {
    const userId = this.currentUser.value?.id;
    if (!userId) return;

    try {
      const profile = await this.http.get<any>(`users/${userId}/profile`).toPromise();

      if (profile) {
        this.updateUserData(profile);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  }
}
