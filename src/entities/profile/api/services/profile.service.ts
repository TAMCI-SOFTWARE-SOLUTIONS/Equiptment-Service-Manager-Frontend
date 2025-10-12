import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { BaseService } from '../../../../shared/api';
import { ProfileEntity } from '../../model';
import { ProfileResponse } from '../types/profile-response.type';
import { CreateProfileRequest } from '../types/create-profile-request.type';
import { ProfileEntityFromResponseMapper } from '../mappers/profile-entity-from-response.mapper';
import { CreateProfileRequestFromEntityMapper } from '../mappers/create-profile-request-from-entity.mapper';

@Injectable({
  providedIn: 'root'
})
export class ProfileService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'profiles';
  }

  create(entity: ProfileEntity): Observable<ProfileEntity> {
    const request: CreateProfileRequest =
      CreateProfileRequestFromEntityMapper.fromEntityToDto(entity);

    return this.http.post<ProfileResponse>(
      this.resourcePath(),
      request,
      this.httpOptions
    ).pipe(
      map((response: ProfileResponse) =>
        ProfileEntityFromResponseMapper.fromDtoToEntity(response)
      ),
      retry(2),
      catchError(this.handleError)
    );
  }

  getById(profileId: string): Observable<ProfileEntity> {
    return this.http.get<ProfileResponse>(
      `${this.resourcePath()}/${profileId}`,
      this.httpOptions
    ).pipe(
      map((response: ProfileResponse) =>
        ProfileEntityFromResponseMapper.fromDtoToEntity(response)
      ),
      retry(2),
      catchError(this.handleError)
    );
  }

  getByUserId(userId: string): Observable<ProfileEntity> {
    return this.http.get<ProfileResponse>(
      `${this.resourcePath()}/user/${userId}`,
      this.httpOptions
    ).pipe(
      map((response: ProfileResponse) =>
        ProfileEntityFromResponseMapper.fromDtoToEntity(response)
      ),
      retry(2),
      catchError(this.handleError)
    )
  }
}
