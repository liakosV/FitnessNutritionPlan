import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  ResponseMessageDto,
  WorkoutDayInsertDto,
  WorkoutDayReadDto,
  WorkoutDayUpdateDto,
} from '../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class WorkoutDaysApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api`;

  create(dto: WorkoutDayInsertDto): Observable<WorkoutDayReadDto> {
    return this.http.post<WorkoutDayReadDto>(`${this.baseUrl}/workout-days`, dto);
  }

  update(uuid: string, dto: WorkoutDayUpdateDto): Observable<WorkoutDayReadDto> {
    return this.http.patch<WorkoutDayReadDto>(`${this.baseUrl}/workout-days/${uuid}`, dto);
  }

  getByWorkoutProgram(workoutProgramUuid: string): Observable<WorkoutDayReadDto[]> {
    return this.http.get<WorkoutDayReadDto[]>(
      `${this.baseUrl}/workout/programs/${workoutProgramUuid}/workout-days`,
    );
  }

  delete(uuid: string): Observable<ResponseMessageDto> {
    return this.http.delete<ResponseMessageDto>(`${this.baseUrl}/workout-days/${uuid}`);
  }
}
