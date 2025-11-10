import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import {BaseService} from '../../../../shared/api/services/base.service';
import { CircuitAssignmentEntity } from '../../model';
import { CircuitAssignmentResponse } from '../types/circuit-assignment-response.type';
import { CreateCircuitAssignmentRequest } from '../types/create-circuit-assignment-request.type';
import { CircuitAssignmentEntityFromResponseMapper } from '../mappers/circuit-assignment-entity-from-response.mapper';
import { CreateCircuitAssignmentRequestFromEntityMapper } from '../mappers/create-circuit-assignment-request-from-entity.mapper';

@Injectable({
  providedIn: 'root'
})
export class CircuitAssignmentService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'circuit-assignments'; // Matches backend @RequestMapping
  }

  create(entity: CircuitAssignmentEntity): Observable<CircuitAssignmentEntity> {
    const request: CreateCircuitAssignmentRequest =
      CreateCircuitAssignmentRequestFromEntityMapper.fromEntityToDto(entity);

    return this.http.post<CircuitAssignmentResponse>(
      this.resourcePath(),
      request,
      this.httpOptions
    ).pipe(
      map((response: CircuitAssignmentResponse) =>
        CircuitAssignmentEntityFromResponseMapper.fromDtoToEntity(response)
      ),
      // NO retry for POST (non-idempotent)
      catchError(this.handleError)
    );
  }

  /**
   * DELETE /api/v1/circuit-assignments/{id}
   * Delete circuit assignment
   */
  delete(id: string, equipmentPowerDistributionAssignmentId: string): Observable<void> {
    const params = { equipmentPowerDistributionAssignmentId };
    return this.http.delete<void>(
      `${this.resourcePath()}/${id}`,
      { ...this.httpOptions, params }
    ).pipe(
      retry(2), // Retry DELETE (idempotent)
      catchError(this.handleError)
    );
  }
}
