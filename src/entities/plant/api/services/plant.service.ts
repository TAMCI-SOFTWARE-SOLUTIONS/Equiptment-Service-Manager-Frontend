import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { BaseService } from '../../../../shared/api';
import { PlantEntity } from '../../model';
import { PlantResponse } from '../types/plant-response.type';
import { CreatePlantRequest } from '../types/create-plant-request.type';
import { PlantEntityFromResponseMapper } from '../mappers/plant-entity-from-response.mapper';
import { CreatePlantRequestFromEntityMapper } from '../mappers/create-plant-request-from-entity.mapper';

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
}
