import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  NutritionPlanInsertDto,
  NutritionPlanReadDto,
  NutritionPlanUpdateDto,
  ResponseMessageDto,
} from '../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class NutritionPlansApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/nutrition-plans`;

  create(dto: NutritionPlanInsertDto): Observable<NutritionPlanReadDto> {
    return this.http.post<NutritionPlanReadDto>(this.baseUrl, dto);
  }

  update(uuid: string, dto: NutritionPlanUpdateDto): Observable<NutritionPlanReadDto> {
    return this.http.patch<NutritionPlanReadDto>(`${this.baseUrl}/${uuid}`, dto);
  }

  getByUuid(uuid: string): Observable<NutritionPlanReadDto> {
    return this.http.get<NutritionPlanReadDto>(`${this.baseUrl}/${uuid}`);
  }

  getAll(): Observable<NutritionPlanReadDto[]> {
    return this.http.get<NutritionPlanReadDto[]>(this.baseUrl);
  }

  delete(uuid: string): Observable<ResponseMessageDto> {
    return this.http.delete<ResponseMessageDto>(`${this.baseUrl}/${uuid}`);
  }
}
