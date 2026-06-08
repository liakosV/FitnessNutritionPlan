import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ErrorResponseDto } from '../models/api.models';

@Injectable({
  providedIn: 'root',
})
export class ApiErrorService {
  message(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'Something went wrong.';
    }

    if (!error.error) {
      return error.message || 'The server is not reachable.';
    }

    if (this.isValidationMap(error.error)) {
      return Object.entries(error.error)
        .map(([field, message]) => `${field}: ${message}`)
        .join(' ');
    }

    if (this.isErrorResponse(error.error)) {
      return error.error.message;
    }

    if (typeof error.error === 'string') {
      return error.error;
    }

    return error.message || 'The request failed.';
  }

  private isValidationMap(value: unknown): value is Record<string, string> {
    return (
      typeof value === 'object' &&
      value !== null &&
      !('message' in value) &&
      Object.values(value).every((entry) => typeof entry === 'string')
    );
  }

  private isErrorResponse(value: unknown): value is ErrorResponseDto {
    return (
      typeof value === 'object' &&
      value !== null &&
      'message' in value &&
      typeof (value as ErrorResponseDto).message === 'string'
    );
  }
}
