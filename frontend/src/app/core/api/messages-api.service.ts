import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { MessageInsertDto, MessageReadDto, ResponseMessageDto } from '../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class MessagesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/messages`;

  send(dto: MessageInsertDto): Observable<MessageReadDto> {
    return this.http.post<MessageReadDto>(this.baseUrl, dto);
  }

  getByUuid(messageUuid: string): Observable<MessageReadDto> {
    return this.http.get<MessageReadDto>(`${this.baseUrl}/${messageUuid}`);
  }

  getSent(): Observable<MessageReadDto[]> {
    return this.http.get<MessageReadDto[]>(`${this.baseUrl}/sent`);
  }

  getReceived(): Observable<MessageReadDto[]> {
    return this.http.get<MessageReadDto[]>(`${this.baseUrl}/received`);
  }

  getConversation(otherUserUuid: string): Observable<MessageReadDto[]> {
    return this.http.get<MessageReadDto[]>(`${this.baseUrl}/conversation/${otherUserUuid}`);
  }

  delete(messageUuid: string): Observable<ResponseMessageDto> {
    return this.http.delete<ResponseMessageDto>(`${this.baseUrl}/${messageUuid}`);
  }
}
