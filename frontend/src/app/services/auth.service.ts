import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { StorageService } from './storage.service';

export const AUTH_API = 'http://localhost:8090/app/api/v1/auth';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }), withCredentials: true
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private storageService: StorageService) { }

  login(email: string, password: string): Observable<any> {
    return this.http.post(
      `${AUTH_API}/authenticate`,
      {
        email,
        password,
      },
      httpOptions
    ).pipe(tap(() => this.storageService.saveUser(email)));
  }

  register(firstName: string, lastName: string, email: string, password: string): Observable<any> {
    return this.http.post(
      AUTH_API + 'register',
      {
        firstName,
        lastName,
        email,
        password,
      },
      httpOptions
    );
  }

  logout() {
    return this.http.post(`${AUTH_API}/signout`, {}, httpOptions).subscribe({
      next: res => {
        console.log("Logout: " + res);
        this.storageService.clean();
        window.location.reload();
      },
      error: err => {
        console.log(err);
        this.storageService.clean();
        window.location.reload();
      }
    });
  }

  refreshToken() {
    return this.http.post(`${AUTH_API}/refresh-token`, {}, httpOptions)
      .pipe(
        tap((val) => this.storageService.storeAccessToken(val))
      );
  }
}