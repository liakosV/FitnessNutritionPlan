import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  AuthenticationRequestDto,
  AuthenticationResponseDto,
  AuthUser,
  Role,
  UserInsertDto,
  UserReadDto,
} from '../models/api.models';
import { TokenStorageService } from './token-storage.service';

interface JwtPayload {
  sub?: string;
  role?: Role;
  exp?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly baseUrl = `${environment.apiUrl}/api/auth`;
  private readonly currentUserSignal = signal<AuthUser | null>(
    this.readUserFromToken(this.tokenStorage.accessToken),
  );

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);

  login(credentials: AuthenticationRequestDto): Observable<AuthenticationResponseDto> {
    return this.http.post<AuthenticationResponseDto>(`${this.baseUrl}/login`, credentials).pipe(
      tap((response) => this.applySession(response)),
    );
  }

  register(dto: UserInsertDto): Observable<UserReadDto> {
    return this.http.post<UserReadDto>(`${this.baseUrl}/register`, dto);
  }

  refreshToken(): Observable<AuthenticationResponseDto> {
    return this.http
      .post<AuthenticationResponseDto>(`${this.baseUrl}/refresh`, {
        refreshToken: this.tokenStorage.refreshToken,
      })
      .pipe(tap((response) => this.applySession(response)));
  }

  logout(): void {
    this.tokenStorage.clear();
    this.currentUserSignal.set(null);
  }

  hasAnyRole(roles: readonly Role[] | undefined): boolean {
    if (!roles || roles.length === 0) {
      return true;
    }

    const user = this.currentUserSignal();
    return !!user && roles.includes(user.role);
  }

  private applySession(response: AuthenticationResponseDto): void {
    this.tokenStorage.save(response.accessToken, response.refreshToken);
    this.currentUserSignal.set(this.readUserFromToken(response.accessToken));
  }

  private readUserFromToken(token: string | null): AuthUser | null {
    if (!token) {
      return null;
    }

    const payload = this.decodePayload(token);
    if (!payload?.sub || !payload.role) {
      this.tokenStorage.clear();
      return null;
    }

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      this.tokenStorage.clear();
      return null;
    }

    return {
      username: payload.sub,
      role: payload.role,
      expiresAt: payload.exp,
    };
  }

  private decodePayload(token: string): JwtPayload | null {
    try {
      const payload = token.split('.')[1];
      if (!payload) {
        return null;
      }

      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(normalized)) as JwtPayload;
    } catch {
      return null;
    }
  }
}
