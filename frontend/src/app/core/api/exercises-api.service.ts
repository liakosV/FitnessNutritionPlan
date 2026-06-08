import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  ExerciseInsertDto,
  ExerciseReadDto,
  ExerciseUpdateDto,
  ResponseMessageDto,
} from '../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class ExercisesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api`;

  create(workoutDayUuid: string, dto: ExerciseInsertDto): Observable<ExerciseReadDto> {
    return this.http.post<ExerciseReadDto>(
      `${this.baseUrl}/workout/days/${workoutDayUuid}/exercises`,
      dto,
    );
  }

  getByWorkoutDay(workoutDayUuid: string): Observable<ExerciseReadDto[]> {
    return this.http.get<ExerciseReadDto[]>(
      `${this.baseUrl}/workout/days/${workoutDayUuid}/exercises`,
    );
  }

  update(exerciseUuid: string, dto: ExerciseUpdateDto): Observable<ExerciseReadDto> {
    return this.http.patch<ExerciseReadDto>(`${this.baseUrl}/exercises/${exerciseUuid}`, dto);
  }

  delete(exerciseUuid: string): Observable<ResponseMessageDto> {
    return this.http.delete<ResponseMessageDto>(`${this.baseUrl}/exercises/${exerciseUuid}`);
  }
}
