import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { BaseService } from '../../../../shared/api';
import { CommunicationProtocolEntity } from '../../model';
import { CommunicationProtocolResponse } from '../types/communication-protocol-response.type';
import { CreateCommunicationProtocolRequest } from '../types/create-communication-protocol-request.type';
import { CommunicationProtocolEntityFromResponseMapper } from '../mappers/communication-protocol-entity-from-response.mapper';
import { CreateCommunicationProtocolRequestFromEntityMapper } from '../mappers/create-communication-protocol-request-from-entity.mapper';

@Injectable({
  providedIn: 'root'
})
export class CommunicationProtocolService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'communication-protocols'; // Matches backend @RequestMapping
  }

  /**
   * GET /api/v1/communication-protocols
   * Get all communication protocols
   */
  getAll(): Observable<CommunicationProtocolEntity[]> {
    return this.http.get<CommunicationProtocolResponse[]>(this.resourcePath(), this.httpOptions).pipe(
      map((responses: CommunicationProtocolResponse[]) =>
        responses.map(r => CommunicationProtocolEntityFromResponseMapper.fromDtoToEntity(r))
      ),
      retry(2), // Retry GET requests
      catchError(this.handleError)
    );
  }

  /**
   * POST /api/v1/communication-protocols
   * Create new communication protocol
   */
  create(entity: CommunicationProtocolEntity): Observable<CommunicationProtocolEntity> {
    const request: CreateCommunicationProtocolRequest =
      CreateCommunicationProtocolRequestFromEntityMapper.fromEntityToDto(entity);

    return this.http.post<CommunicationProtocolResponse>(
      this.resourcePath(),
      request,
      this.httpOptions
    ).pipe(
      map((response: CommunicationProtocolResponse) =>
        CommunicationProtocolEntityFromResponseMapper.fromDtoToEntity(response)
      ),
      // NO retry for POST (non-idempotent)
      catchError(this.handleError)
    );
  }
}
