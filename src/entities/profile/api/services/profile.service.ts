import { Injectable } from '@angular/core';
import {Observable, of} from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { BaseService } from '../../../../shared/api';
import { ProfileEntity } from '../../model';
import {CreateProfileRequest, ProfileResponse, UpdateProfileRequest} from '../types';
import {
  CreateProfileRequestFromEntityMapper,
  ProfileEntityFromResponseMapper,
  UpdateProfileRequestFromEntityMapper
} from '../mappers';
import {HttpParams} from '@angular/common/http';

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

  getAll(): Observable<ProfileEntity[]> {
    return this.http.get<ProfileResponse[]>(
      `${this.resourcePath()}`,
      this.httpOptions
    ).pipe(
      map((response: ProfileResponse[]) =>
        response.map(
          (profile: ProfileResponse) =>
            ProfileEntityFromResponseMapper.fromDtoToEntity(profile)
        )
      )
    )
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
    );
  }

  update(profileId: string, entity: ProfileEntity): Observable<ProfileEntity> {
    const request: UpdateProfileRequest =
      UpdateProfileRequestFromEntityMapper.fromEntityToDto(entity);

    return this.http.put<ProfileResponse>(
      `${this.resourcePath()}/${profileId}`,
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

  delete(profileId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.resourcePath()}/${profileId}`,
      this.httpOptions
    ).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  getAllByUserIds(userIds: string[]): Observable<ProfileEntity[]> {
    if (!userIds || userIds.length === 0) { return of([]); }
    const params = userIds.reduce((acc, userIds) => acc.append('userIds', userIds), new HttpParams());
    const options = { ...this.httpOptions, params };
    return this.http.get<ProfileResponse[]>(`${this.resourcePath()}/:batchGetByUserIds`, options).pipe(
      map((response: ProfileResponse[]) => response.map((profile: ProfileResponse) => ProfileEntityFromResponseMapper.fromDtoToEntity(profile))),
      retry(2),
      catchError(this.handleError)
    );
  }
}
