import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { BaseService } from '../../../../shared/api';
import { LocationEntity } from '../../model';
import { LocationResponse } from '../types/location-response.type';
import { CreateLocationRequest } from '../types/create-location-request.type';
import { LocationEntityFromResponseMapper } from '../mappers/location-entity-from-response.mapper';
import { CreateLocationRequestFromEntityMapper } from '../mappers/create-location-request-from-entity.mapper';
import {UpdateLocationRequestFromEntityMapper} from '../mappers/update-location-request-from-entity.mapper';
import {UpdateLocationRequest} from '../types/update-location-request.type';

@Injectable({
  providedIn: 'root'
})
export class LocationService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'locations';
  }

  /**
   * POST /api/v1/locations
   * Create new location
   */
  create(entity: LocationEntity): Observable<LocationEntity> {
    const request: CreateLocationRequest = CreateLocationRequestFromEntityMapper.fromEntityToDto(entity);

    return this.http.post<LocationResponse>(
      this.resourcePath(),
      request,
      this.httpOptions
    ).pipe(
      map((response: LocationResponse) =>
        LocationEntityFromResponseMapper.fromDtoToEntity(response)
      ),
      // NO retry for POST (non-idempotent)
      catchError(this.handleError)
    );
  }

  /**
   * GET /api/v1/locations/{locationId}
   * Get location by ID
   */
  getById(locationId: string): Observable<LocationEntity> {
    return this.http.get<LocationResponse>(
      `${this.resourcePath()}/${locationId}`,
      this.httpOptions
    ).pipe(
      map((response: LocationResponse) =>
        LocationEntityFromResponseMapper.fromDtoToEntity(response)
      ),
      retry(2),
      catchError(this.handleError)
    );
  }

  /**
   * GET /api/v1/locations?areaId={areaId}
   * Get all locations by area ID
   */
  getAllByAreaId(areaId: string): Observable<LocationEntity[]> {
    const params = `areaId=${areaId}`;

    return this.http.get<LocationResponse[]>(
      `${this.resourcePath()}?${params}`,
      this.httpOptions
    ).pipe(
      map((responses: LocationResponse[]) =>
        responses.map(r => LocationEntityFromResponseMapper.fromDtoToEntity(r))
      ),
      retry(2),
      catchError(this.handleError)
    );
  }

  /**
   * PUT /api/v1/locations/{locationId}
   * Update location
   */
  update(locationId: string, entity: LocationEntity): Observable<LocationEntity> {
    const request: UpdateLocationRequest = UpdateLocationRequestFromEntityMapper.fromEntityToDto(entity);

    return this.http.put<LocationResponse>(
      `${this.resourcePath()}/${locationId}`,
      request,
      this.httpOptions
    ).pipe(
      map((response: LocationResponse) =>
        LocationEntityFromResponseMapper.fromDtoToEntity(response)
      ),
      retry(2),
      catchError(this.handleError)
    );
  }

  /**
   * DELETE /api/v1/locations/{locationId}
   * Delete location
   */
  delete(locationId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.resourcePath()}/${locationId}`,
      this.httpOptions
    ).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
}
