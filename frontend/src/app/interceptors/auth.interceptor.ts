import { HTTP_INTERCEPTORS, HttpClient, HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { APP_INITIALIZER, Injectable } from '@angular/core';

import { StorageService } from '../services/storage.service';

import { Observable, of, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

import { EventBusService } from '../_shared/event-bus.service';
import { EventData } from '../_shared/event.class';
import { AUTH_API, AuthService } from '../services/auth.service';
import { XSRFTokenService } from '../services/xsrf.service';

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
  private isRefreshing = false;

  constructor(
    private storageService: StorageService,
    private authService: AuthService,
    private eventBusService: EventBusService,
    private xsrfTokenService: XSRFTokenService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (!req.url.includes('/api/v1/auth/csrf')) {
      const xsrfToken = this.xsrfTokenService.getXsrfToken();
      if (xsrfToken != null) {
        req = req.clone({ setHeaders: { 'X-XSRF-TOKEN': xsrfToken } });
      } else {
        console.error("No se encontró la cookie XSRF-TOKEN");
      }
    }

    return next.handle(req).pipe(
      tap((res: HttpEvent<any>) => {
        if (req.url.includes('/api/v1/auth/authenticate')) {
          if (res instanceof HttpResponse) {
            this.storageService.storeAccessToken(res.body);
          }
        }
      }),
      catchError((error) => {
        if (
          error instanceof HttpErrorResponse &&
          !req.url.includes('/api/v1/auth/authenticate') &&
          error.status === 401
        ) {
          return this.handle401Error(req, next);
        } else if (
          error instanceof HttpErrorResponse && error.status === 403 // cookie http-only de refresh token caduco
        ) {
          console.warn("emito evento de logout");
          this.eventBusService.emit(new EventData('logout', null));
        }

        return throwError(() => error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;

      if (this.storageService.isLoggedIn()) {
        return this.authService.refreshToken().pipe(
          switchMap((res: any) => {
            console.warn(JSON.stringify(res))
            this.storageService.storeAccessToken(res);

            this.isRefreshing = false;

            return next.handle(request);
          }),
          catchError((error) => {
            this.isRefreshing = false;

            if (error.status == '403') {
              console.warn("emito evento de logout");
              this.eventBusService.emit(new EventData('logout', null));
            }

            return throwError(() => error);
          })
        );
      }
    }

    return next.handle(request);
  }
}

export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: HttpRequestInterceptor, multi: true },
];

function getCsrfToken(httpClient: HttpClient): () => Observable<any> {
  return () => httpClient.get(`${AUTH_API}/csrf`, { withCredentials: true }).pipe(catchError((err) => of(null)));
}

export const httpInitializerProviders = [{
  provide: APP_INITIALIZER,
  useFactory: getCsrfToken,
  deps: [HttpClient],
  multi: true,
}]