import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { BaseService } from '../../../../shared/api';
import { EquipmentPowerDistributionAssignmentEntity } from '../../model/entities/equipment-power-distribution-assignment.entity';
import { EquipmentPowerDistributionAssignmentResponse } from '../types/equipment-power-distribution-assignment-response.type';
import { CreateEquipmentPowerDistributionAssignmentRequest } from '../types/create-equipment-power-distribution-assignment-request.type';
import { EquipmentPowerDistributionAssignmentEntityFromResponseMapper } from '../mappers/equipment-power-distribution-assignment-entity-from-response.mapper';
import { CreateEquipmentPowerDistributionAssignmentRequestFromEntityMapper } from '../mappers/create-equipment-power-distribution-assignment-request-from-entity.mapper';

@Injectable({
  providedIn: 'root'
})
export class EquipmentPowerDistributionAssignmentService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'equipment-power-distribution-assignments'; // Matches backend @RequestMapping
  }

  /**
   * GET /api/v1/equipment-power-distribution-assignments/{id}
   * Get equipment power distribution assignment by ID
   */
  getById(id: string): Observable<EquipmentPowerDistributionAssignmentEntity> {
    return this.http.get<EquipmentPowerDistributionAssignmentResponse>(
      `${this.resourcePath()}/${id}`,
      this.httpOptions
    ).pipe(
      map((response: EquipmentPowerDistributionAssignmentResponse) =>
        EquipmentPowerDistributionAssignmentEntityFromResponseMapper.fromDtoToEntity(response)
      ),
      retry(2),
      catchError(this.handleError)
    );
  }

  /**
   * GET /api/v1/equipment-power-distribution-assignments?equipmentId={equipmentId}
   * Get all equipment power distribution assignments by equipment ID
   */
  getAllByEquipmentId(equipmentId: string): Observable<EquipmentPowerDistributionAssignmentEntity[]> {
    return this.http.get<EquipmentPowerDistributionAssignmentResponse[]>(
      this.resourcePath(),
      { ...this.httpOptions, params: { equipmentId } }
    ).pipe(
      map((responses: EquipmentPowerDistributionAssignmentResponse[]) =>
        responses.map(r => EquipmentPowerDistributionAssignmentEntityFromResponseMapper.fromDtoToEntity(r))
      ),
      retry(2),
      catchError(this.handleError)
    );
  }

  /**
   * POST /api/v1/equipment-power-distribution-assignments
   * Create new equipment power distribution assignment
   */
  create(entity: EquipmentPowerDistributionAssignmentEntity): Observable<EquipmentPowerDistributionAssignmentEntity> {
    const request: CreateEquipmentPowerDistributionAssignmentRequest =
      CreateEquipmentPowerDistributionAssignmentRequestFromEntityMapper.fromEntityToDto(entity);

    return this.http.post<EquipmentPowerDistributionAssignmentResponse>(
      this.resourcePath(),
      request,
      this.httpOptions
    ).pipe(
      map((response: EquipmentPowerDistributionAssignmentResponse) =>
        EquipmentPowerDistributionAssignmentEntityFromResponseMapper.fromDtoToEntity(response)
      ),
      // NO retry for POST (non-idempotent)
      catchError(this.handleError)
    );
  }

  /**
   * UPDATE /api/v1/equipment-power-distribution-assignments/{id}
   * Update equipment power distribution assignment
   */
  update(entity: EquipmentPowerDistributionAssignmentEntity): Observable<EquipmentPowerDistributionAssignmentEntity> {
    const request: CreateEquipmentPowerDistributionAssignmentRequest =
      CreateEquipmentPowerDistributionAssignmentRequestFromEntityMapper.fromEntityToDto(entity);
    return this.http.put<EquipmentPowerDistributionAssignmentResponse>(
      `${this.resourcePath()}/${entity.id}`,
      request,
      this.httpOptions
    ).pipe(
      map((response: EquipmentPowerDistributionAssignmentResponse) =>
        EquipmentPowerDistributionAssignmentEntityFromResponseMapper.fromDtoToEntity(response)
      ),
      // NO retry for PUT (non-idempotent)
      catchError(this.handleError)
    );
  }

  /**
   * DELETE /api/v1/equipment-power-distribution-assignments/{id}
   * Delete equipment power distribution assignment
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.resourcePath()}/${id}`,
      this.httpOptions
    ).pipe(
      retry(2),
    );
  }
}
