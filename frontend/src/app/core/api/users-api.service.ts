import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  ChangePasswordDto,
  ResponseMessageDto,
  Role,
  UserReadDto,
  UserUpdateDto,
} from '../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class UsersApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/users`;

  getAll(): Observable<UserReadDto[]> {
    return this.http.get<UserReadDto[]>(this.baseUrl);
  }

  getMessageRecipients(): Observable<UserReadDto[]> {
    return this.http.get<UserReadDto[]>(`${this.baseUrl}/message-recipients`);
  }

  getByUuid(uuid: string): Observable<UserReadDto> {
    return this.http.get<UserReadDto>(`${this.baseUrl}/${uuid}`);
  }

  updateMe(dto: UserUpdateDto): Observable<UserReadDto> {
    return this.http.patch<UserReadDto>(`${this.baseUrl}/me`, dto);
  }

  changePassword(dto: ChangePasswordDto): Observable<UserReadDto> {
    return this.http.patch<UserReadDto>(`${this.baseUrl}/me/password`, dto);
  }

  changeRole(uuid: string, role: Role): Observable<UserReadDto> {
    return this.http.patch<UserReadDto>(`${this.baseUrl}/${uuid}/role`, JSON.stringify(role), {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    });
  }

  delete(uuid: string): Observable<ResponseMessageDto> {
    return this.http.delete<ResponseMessageDto>(`${this.baseUrl}/${uuid}`);
  }
}
