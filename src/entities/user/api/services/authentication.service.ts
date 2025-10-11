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
}
