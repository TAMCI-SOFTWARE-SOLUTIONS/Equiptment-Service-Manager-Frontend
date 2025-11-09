import { Injectable } from '@angular/core';
import {Observable, map, retry} from 'rxjs';
import { UserEntity } from '../../model';
import { AuthenticatedUserResponse } from '../types/authenticated-user-response.type';
import { SignInRequest } from '../types/sign-in-request.type';
import { SignUpRequest } from '../types/sign-up-request.type';
import { AuthenticatedUserFromResponseMapper } from '../mappers/authenticated-user-from-response.mapper';
import { SignInRequestFromCredentialsMapper, SignInCredentials } from '../mappers/sign-in-request-from-credentials.mapper';
import { SignUpRequestFromEntityMapper } from '../mappers/sign-up-request-from-entity.mapper';
import {catchError} from 'rxjs/operators';
import {BaseService} from '../../../../shared/api';
import {SetInitialPasswordRequestType} from '../types/set-initial-password-request.type';
import {ResetPasswordRequestType} from '../types/reset-password-request.type';
import {HttpParams} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'authentication';
  }

  signIn(credentials: SignInCredentials): Observable<UserEntity> {
    const request: SignInRequest = SignInRequestFromCredentialsMapper.fromCredentialsToDto(credentials);

    return this.http.post<AuthenticatedUserResponse>(`${this.resourcePath()}/sign-in`, request, this.httpOptions).pipe(
      map((response: AuthenticatedUserResponse) => AuthenticatedUserFromResponseMapper.fromDtoToEntity(response)),
      retry(2),
      catchError(this.handleError)
    );
  }

  signUp(user: UserEntity): Observable<UserEntity> {
    const request: SignUpRequest = SignUpRequestFromEntityMapper.fromEntityToDto(user);

    return this.http.post<AuthenticatedUserResponse>(`${this.resourcePath()}/sign-up`, request, this.httpOptions).pipe(
      map((response: AuthenticatedUserResponse) => AuthenticatedUserFromResponseMapper.fromDtoToEntity(response)),
      retry(2),
      catchError(this.handleError)
    );
  }

  getCurrentUser(): Observable<UserEntity> {
    return this.http.get<AuthenticatedUserResponse>(`${this.resourcePath()}/me`, this.httpOptions).pipe(
      map((response: AuthenticatedUserResponse) => AuthenticatedUserFromResponseMapper.fromDtoToEntity(response)),
      retry(2),
      catchError(this.handleError)
    );
  }

  setInitialPassword(accessToken: string, newPassword: string): Observable<void> {
    const request: SetInitialPasswordRequestType = {
      activationToken: accessToken,
      password: newPassword
    };

    return this.http.post<void>(`${this.resourcePath()}/set-initial-password`, request, this.httpOptions).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  forgotPassword(email: string): Observable<void> {
    const params = new HttpParams().set('email', email);
    return this.http.post<void>(`${this.resourcePath()}/forgot-password`, null,  { ...this.httpOptions, params: params }).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    const request: ResetPasswordRequestType = {
      resetToken: token,
      newPassword: newPassword
    };
    return this.http.post<void>(`${this.resourcePath()}/reset-password`, request , this.httpOptions).pipe(
      retry(2),
    )
  }
}
