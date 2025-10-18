import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { BaseService } from '../../../../shared/api';
import { PowerDistributionPanelEntity } from '../../model';
import { PowerDistributionPanelResponse } from '../types/power-distribution-panel-response.type';
import { CreatePowerDistributionPanelRequest } from '../types/create-power-distribution-panel-request.type';
import { PowerDistributionPanelEntityFromResponseMapper } from '../mappers/power-distribution-panel-entity-from-response.mapper';
import { CreatePowerDistributionPanelRequestFromEntityMapper } from '../mappers/create-power-distribution-panel-request-from-entity.mapper';
import {
  UpdatePowerDistributionPanelRequestFromEntityMapper
} from '../mappers/update-power-distribution-panel-request-from-entity.mapper';
import {UpdatePowerDistributionPanelRequest} from '../types/update-power-distribution-panel-request.type';

@Injectable({
  providedIn: 'root'
})
export class PowerDistributionPanelService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'power-distribution-panels'; // Matches backend @RequestMapping
  }

  /**
   * GET /api/v1/power-distribution-panels/{powerDistributionPanelId}
   * Get power distribution panel by ID
   */
  getById(powerDistributionPanelId: string): Observable<PowerDistributionPanelEntity> {
    return this.http.get<PowerDistributionPanelResponse>(
      `${this.resourcePath()}/${powerDistributionPanelId}`,
      this.httpOptions
    ).pipe(
      map((response: PowerDistributionPanelResponse) =>
        PowerDistributionPanelEntityFromResponseMapper.fromDtoToEntity(response)
      ),
      retry(2),
      catchError(this.handleError)
    );
  }

  /**
   * GET /api/v1/power-distribution-panels
   * Get all power distribution panels
   */
  getAll(): Observable<PowerDistributionPanelEntity[]> {
    return this.http.get<PowerDistributionPanelResponse[]>(
      this.resourcePath(),
      this.httpOptions
    ).pipe(
      map((responses: PowerDistributionPanelResponse[]) => responses.map(r => PowerDistributionPanelEntityFromResponseMapper.fromDtoToEntity(r))),
      retry(2),
      catchError(this.handleError)
    )
  }

  /**
   * GET /api/v1/power-distribution-panels:batchGet
   * Batch get power distribution panels by IDs
   */
  batchGetByIds(ids: string[]): Observable<PowerDistributionPanelEntity[]> {
    const params = ids.join(',');
    return this.http.get<PowerDistributionPanelResponse[]>(
      `${this.resourcePath()}:batchGet`,
      { ...this.httpOptions, params: { ids: params } }
    ).pipe(
      map((responses: PowerDistributionPanelResponse[]) =>
        responses.map(r => PowerDistributionPanelEntityFromResponseMapper.fromDtoToEntity(r))
      ),
      retry(2),
      catchError(this.handleError)
    );
  }

  /**
   * POST /api/v1/power-distribution-panels
   * Create new power distribution panel
   */
  create(entity: PowerDistributionPanelEntity): Observable<PowerDistributionPanelEntity> {
    const request: CreatePowerDistributionPanelRequest =
      CreatePowerDistributionPanelRequestFromEntityMapper.fromEntityToDto(entity);

    return this.http.post<PowerDistributionPanelResponse>(
      this.resourcePath(),
      request,
      this.httpOptions
    ).pipe(
      map((response: PowerDistributionPanelResponse) =>
        PowerDistributionPanelEntityFromResponseMapper.fromDtoToEntity(response)
      ),
      // NO retry for POST (non-idempotent)
      catchError(this.handleError)
    );
  }

  /**
   * PUT /api/v1/power-distribution-panels/{powerDistributionPanelId}
   * Update existing power distribution panel
   */
  update(entity: PowerDistributionPanelEntity): Observable<PowerDistributionPanelEntity> {
    const request: UpdatePowerDistributionPanelRequest =
      UpdatePowerDistributionPanelRequestFromEntityMapper.fromEntityToDto(entity);
    return this.http.put<PowerDistributionPanelResponse>(
      `${this.resourcePath()}/${entity.id}`,
      request,
      this.httpOptions
    ).pipe(
      map((response: PowerDistributionPanelResponse) =>
        PowerDistributionPanelEntityFromResponseMapper.fromDtoToEntity(response)
      )
    )
  }

  /**
   * DELETE /api/v1/power-distribution-panels/{powerDistributionPanelId}
   * Delete power distribution panel
   */
  delete(powerDistributionPanelId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.resourcePath()}/${powerDistributionPanelId}`,
      this.httpOptions
    ).pipe(
      retry(2),
    )
  }
}
