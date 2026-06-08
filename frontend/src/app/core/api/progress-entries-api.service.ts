import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  ProgressEntryInsertDto,
  ProgressEntryReadDto,
  ResponseMessageDto,
} from '../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class ProgressEntriesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api`;

  createMine(dto: ProgressEntryInsertDto): Observable<ProgressEntryReadDto> {
    return this.http.post<ProgressEntryReadDto>(`${this.baseUrl}/users/me/progress-entries`, dto);
  }

  getMine(): Observable<ProgressEntryReadDto[]> {
    return this.http.get<ProgressEntryReadDto[]>(`${this.baseUrl}/users/me/progress-entries`);
  }

  delete(uuid: string): Observable<ResponseMessageDto> {
    return this.http.delete<ResponseMessageDto>(`${this.baseUrl}/progress-entries/${uuid}`);
  }
}
