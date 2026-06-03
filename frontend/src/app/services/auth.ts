import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  http: HttpClient = inject(HttpClient);

  login(credentials) {
    return this.http.post
  }
}
