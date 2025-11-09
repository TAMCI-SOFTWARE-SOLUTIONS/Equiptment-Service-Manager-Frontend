import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { BaseService } from '../../../../shared/api';
import { UserPreferencesEntity } from '../../model/entities/user-preferences.entity';
import { UserPreferencesResponse } from '../types/user-preferences-response.type';
import { UpdateUserPreferencesRequest } from '../types/update-user-preferences-request.type';
import { UserPreferencesEntityFromResponseMapper } from '../mappers/user-preferences-entity-from-response.mapper';
import { UpdateUserPreferencesRequestFromEntityMapper } from '../mappers/update-user-preferences-request-from-entity.mapper';

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'user-preferences';
  }

  getByUser(userId: string): Observable<UserPreferencesEntity> {
    return this.http
      .get<UserPreferencesResponse>(`${this.resourcePath()}?userId=${encodeURIComponent(userId)}`, this.httpOptions)
      .pipe(
        map(resp => UserPreferencesEntityFromResponseMapper.fromDtoToEntity(resp)),
        catchError(this.handleError)
      );
  }

  update(userPreferencesId: string, entity: UserPreferencesEntity): Observable<UserPreferencesEntity> {
    const request: UpdateUserPreferencesRequest =
      UpdateUserPreferencesRequestFromEntityMapper.fromEntityToDto(entity);

    return this.http
      .put<UserPreferencesResponse>(`${this.resourcePath()}/${userPreferencesId}`, request, this.httpOptions)
      .pipe(
        map(resp => UserPreferencesEntityFromResponseMapper.fromDtoToEntity(resp)),
        catchError(this.handleError)
      );
  }
}
