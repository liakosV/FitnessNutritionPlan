import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  ResponseMessageDto,
  WorkoutProgramInsertDto,
  WorkoutProgramReadDto,
  WorkoutProgramUpdateDto,
} from '../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class WorkoutProgramsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/workout/programs`;

  create(dto: WorkoutProgramInsertDto): Observable<WorkoutProgramReadDto> {
    return this.http.post<WorkoutProgramReadDto>(this.baseUrl, dto);
  }

  update(uuid: string, dto: WorkoutProgramUpdateDto): Observable<WorkoutProgramReadDto> {
    return this.http.patch<WorkoutProgramReadDto>(`${this.baseUrl}/${uuid}`, dto);
  }

  delete(uuid: string): Observable<ResponseMessageDto> {
    return this.http.delete<ResponseMessageDto>(`${this.baseUrl}/${uuid}`);
  }

  getAll(): Observable<WorkoutProgramReadDto[]> {
    return this.http.get<WorkoutProgramReadDto[]>(this.baseUrl);
  }

  getAccessible(): Observable<WorkoutProgramReadDto[]> {
    return this.http.get<WorkoutProgramReadDto[]>(`${this.baseUrl}/accessible`);
  }

  getByCoach(coachUuid: string): Observable<WorkoutProgramReadDto[]> {
    return this.http.get<WorkoutProgramReadDto[]>(`${this.baseUrl}/coach/${coachUuid}`);
  }

  getMine(): Observable<WorkoutProgramReadDto[]> {
    return this.http.get<WorkoutProgramReadDto[]>(`${this.baseUrl}/my`);
  }
}
