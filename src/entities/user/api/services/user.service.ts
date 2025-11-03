import { Injectable } from '@angular/core';
import {Observable, map, retry} from 'rxjs';
import { BaseService } from '../../../../shared/api';
import { UserEntity } from '../../model';
import { UserResponse } from '../types/user-response.type';
import { UserEntityFromResponseMapper } from '../mappers/user-entity-from-response.mapper';
import {catchError} from 'rxjs/operators';
import {CreateUserRequestFromEntityMapper} from '../mappers/create-user-request-from-entity.mapper';
import {CreateUserRequestType} from '../types/create-user-request.type';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'users';
  }

  getAll(): Observable<UserEntity[]> {
    return this.http.get<UserResponse[]>(this.resourcePath(), this.httpOptions).pipe(
      map((responses: UserResponse[]) => responses.map(r => UserEntityFromResponseMapper.fromDtoToEntity(r))),
      retry(2),
      catchError(this.handleError)
    );
  }

  getById(id: string): Observable<UserEntity> {
    return this.http.get<UserResponse>(`${this.resourcePath()}/${id}`, this.httpOptions).pipe(
      map((response: UserResponse) => UserEntityFromResponseMapper.fromDtoToEntity(response)),
      retry(2),
      catchError(this.handleError)
    );
  }

  create(user: UserEntity): Observable<UserEntity> {
    const request: CreateUserRequestType = CreateUserRequestFromEntityMapper.fromEntityToDto(user);

    console.log(request);

    return this.http.post<UserResponse>(this.resourcePath(), request, this.httpOptions).pipe(
      map((response: UserResponse) => UserEntityFromResponseMapper.fromDtoToEntity(response)),
      retry(2),
      catchError(this.handleError)
    );
  }
}
