import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationResponseDto, Credentials } from '../interfaces/user';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs';

const API_URL = `${environment.apiUrl}/api/auth`;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http: HttpClient = inject(HttpClient);

  login(credentials: Credentials) {
    return this.http.post<AuthenticationResponseDto>(`${API_URL}/login`, credentials).pipe(
      tap((res) => {
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('refreshToken', res.refreshToken);
      })

    );
  }

  refreshToken() {
    return this.http.post<AuthenticationResponseDto>(`${API_URL}/refresh`, {refreshToken : localStorage.getItem('refreshToken')})
    .pipe(
      tap((res) => {
        localStorage.setItem('accessToken', res.accessToken);
        localStorage.setItem('refreshToken', res.refreshToken);
      })
    );
  }
}
