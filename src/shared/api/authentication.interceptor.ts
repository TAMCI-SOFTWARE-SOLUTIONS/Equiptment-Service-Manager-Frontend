import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import {AuthStore} from '../stores';

export const authenticationInterceptor: HttpInterceptorFn = (request, next) => {
  const token = localStorage.getItem('token');
  const authStore = inject(AuthStore);

  const authRequest = token
    ? request.clone({headers: request.headers.set('Authorization', `Bearer ${token}`)}) : request;

  return next(authRequest).pipe(
    catchError(error => {
      /*
       * Handle token expiration
       * If the token is expired, refresh it and retry the request
       * If the token is invalid, clear it and redirect to log in
       */
      if (error.status === 401 && token) {
        authStore.handleTokenExpiration();
      }
      return throwError(() => error);
    })
  );
};
