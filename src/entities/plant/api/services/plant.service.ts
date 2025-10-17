import { Injectable } from '@angular/core';
import {Observable, of} from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { BaseService } from '../../../../shared/api';
import { PlantEntity } from '../../model';
import { PlantResponse } from '../types/plant-response.type';
import { CreatePlantRequest } from '../types/create-plant-request.type';
import { PlantEntityFromResponseMapper } from '../mappers/plant-entity-from-response.mapper';
import { CreatePlantRequestFromEntityMapper } from '../mappers/create-plant-request-from-entity.mapper';
import {UpdatePlantRequestFromEntityMapper} from '../mappers/update-plant-request-from-entity.mapper';
import {UpdatePlantRequest} from '../types/update-plant-request.type';
import {AreaEntity} from '../../../area/model';
import {AreaEntityFromResponseMapper, AreaResponseDto} from '../../../area/api';
import {HttpParams} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PlantService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'plants'; // Matches backend @RequestMapping
  }

  /**
   * POST /api/v1/plants
   * Create new plant
   */
  create(entity: PlantEntity): Observable<PlantEntity> {
    const request: CreatePlantRequest = CreatePlantRequestFromEntityMapper.fromEntityToDto(entity);

    return this.http.post<PlantResponse>(
      this.resourcePath(),
      request,
      this.httpOptions
    ).pipe(
      map((response: PlantResponse) =>
        PlantEntityFromResponseMapper.fromDtoToEntity(response)
      ),
      // NO retry for POST (non-idempotent)
      catchError(this.handleError)
    );
  }

  /**
   * GET /api/v1/plants/{plantId}
   * Get plant by ID
   */
  getById(plantId: string): Observable<PlantEntity> {
    return this.http.get<PlantResponse>(
      `${this.resourcePath()}/${plantId}`,
      this.httpOptions
    ).pipe(
      map((response: PlantResponse) =>
        PlantEntityFromResponseMapper.fromDtoToEntity(response)
      ),
      retry(2),
      catchError(this.handleError)
    );
  }

  /**
   * GET /api/v1/plants?clientId={clientId}
   * Get all plants by client ID
   */
  getAllByClientId(clientId: string): Observable<PlantEntity[]> {
    const params = `clientId=${clientId}`;

    return this.http.get<PlantResponse[]>(
      `${this.resourcePath()}?${params}`,
      this.httpOptions
    ).pipe(
      map((responses: PlantResponse[]) =>
        responses.map(r => PlantEntityFromResponseMapper.fromDtoToEntity(r))
      ),
      retry(2),
      catchError(this.handleError)
    );
  }

  /**
   * GET /api/v1/plants/{plantId}/areas
   * Get all areas by plant ID
   */
  getAllAreasByPlantId(plantId: string): Observable<AreaEntity[]> {
    return this.http.get<AreaResponseDto[]>(
      `${this.resourcePath()}/${plantId}/areas`,
      this.httpOptions
    ).pipe(
      map((areas: AreaResponseDto[]) => areas.map(area => AreaEntityFromResponseMapper.fromDtoToEntity(area))),
      retry(2),
      catchError(this.handleError)
    );
  }
  /**
   * GET /api/v1/plants/batchGet
   * Get all plants by IDs
   * @param ids
   */
  getAllByIds(ids: string[]): Observable<PlantEntity[]> {
    if (!ids || ids.length === 0) {return of([]);}
    const params = ids.reduce((acc, id) => acc.append('ids', id), new HttpParams());
    const options = {...this.httpOptions, params};
    return this.http.get<PlantResponse[]>(
      `${this.resourcePath()}/batchGet`,
      options
    ).pipe(
      map((plants: PlantResponse[]) =>
        plants.map(plant => PlantEntityFromResponseMapper.fromDtoToEntity(plant))
      ),
      retry(2),
      catchError(this.handleError)
    );
  }

  /**
   * PUT /api/v1/plants/{plantId}
   * Update plant
   */
  update(plantId: string, entity: PlantEntity): Observable<PlantEntity> {
    const request: UpdatePlantRequest = UpdatePlantRequestFromEntityMapper.fromEntityToDto(entity);

    return this.http.put<PlantResponse>(
      `${this.resourcePath()}/${plantId}`,
      request,
      this.httpOptions
    ).pipe(
      map((response: PlantResponse) =>
        PlantEntityFromResponseMapper.fromDtoToEntity(response)
      ),
      retry(2),
      catchError(this.handleError)
    );
  }

  /**
   * DELETE /api/v1/plants/{plantId}
   * Delete plant
   */
  delete(plantId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.resourcePath()}/${plantId}`,
      this.httpOptions
    ).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
}
