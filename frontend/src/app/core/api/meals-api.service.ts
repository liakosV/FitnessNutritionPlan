import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { MealInsertDto, MealReadDto, MealUpdateDto, ResponseMessageDto } from '../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class MealsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api`;

  create(nutritionPlanUuid: string, dto: MealInsertDto): Observable<MealReadDto> {
    return this.http.post<MealReadDto>(
      `${this.baseUrl}/nutrition-plans/${nutritionPlanUuid}/meals`,
      dto,
    );
  }

  getByNutritionPlan(nutritionPlanUuid: string): Observable<MealReadDto[]> {
    return this.http.get<MealReadDto[]>(
      `${this.baseUrl}/nutrition-plans/${nutritionPlanUuid}/meals`,
    );
  }

  update(uuid: string, dto: MealUpdateDto): Observable<MealReadDto> {
    return this.http.patch<MealReadDto>(`${this.baseUrl}/meals/${uuid}`, dto);
  }

  getByUuid(uuid: string): Observable<MealReadDto> {
    return this.http.get<MealReadDto>(`${this.baseUrl}/meals/${uuid}`);
  }

  getAll(): Observable<MealReadDto[]> {
    return this.http.get<MealReadDto[]>(`${this.baseUrl}/meals`);
  }

  delete(uuid: string): Observable<ResponseMessageDto> {
    return this.http.delete<ResponseMessageDto>(`${this.baseUrl}/meals/${uuid}`);
  }
}
