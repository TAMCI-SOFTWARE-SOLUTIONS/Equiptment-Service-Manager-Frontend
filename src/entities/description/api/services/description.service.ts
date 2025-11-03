import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { DescriptionEntity } from '../../model/entities/description.entity';
import { DescriptionResponse } from '../types/description-response.type';
import { CreateDescriptionRequest } from '../types/create-description-request.type';
import { UpdateDescriptionRequest } from '../types/update-description-request.type';
import { DescriptionEntityFromResponseMapper } from '../mappers/description-entity-from-response.mapper';
import { CreateDescriptionRequestFromEntityMapper } from '../mappers/create-description-request-from-entity.mapper';
import { UpdateDescriptionRequestFromEntityMapper } from '../mappers/update-description-request-from-entity.mapper';
import {BaseService} from '../../../../shared/api';
import {HttpParams} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DescriptionService extends BaseService {

  constructor() {
    super();
    this.resourceEndpoint = 'descriptions';
  }

  /**
   * GET /api/v1/descriptions
   * Get all descriptions
   */
  getAll(): Observable<DescriptionEntity[]> {
    return this.http.get<DescriptionResponse[]>(this.resourcePath(), this.httpOptions).pipe(
      map((responses: DescriptionResponse[]) => responses.map(r => DescriptionEntityFromResponseMapper.fromDtoToEntity(r))),
      retry(2),
      catchError(this.handleError)
    );
  }

  /**
   * GET /api/v1/descriptions/{id}
   * Get description by ID
   */
  getById(id: string): Observable<DescriptionEntity> {
    return this.http.get<DescriptionResponse>(`${this.resourcePath()}/${id}`, this.httpOptions).pipe(
      map((response: DescriptionResponse) => DescriptionEntityFromResponseMapper.fromDtoToEntity(response)),
      retry(2),
      catchError(this.handleError)
    );
  }

  /**
   * POST /api/v1/descriptions
   * Create new description
   */
  create(entity: DescriptionEntity): Observable<DescriptionEntity> {
    const request: CreateDescriptionRequest =
      CreateDescriptionRequestFromEntityMapper.fromEntityToDto(entity);

    return this.http.post<DescriptionResponse>(this.resourcePath(), request, this.httpOptions).pipe(
      map((response: DescriptionResponse) => DescriptionEntityFromResponseMapper.fromDtoToEntity(response)),
      // NO retry for POST (non-idempotent)
      catchError(this.handleError)
    );
  }

  /**
   * PUT /api/v1/descriptions/{id}
   * Update existing description
   */
  update(id: string, entity: Partial<DescriptionEntity>): Observable<DescriptionEntity> {
    const request: UpdateDescriptionRequest =
      UpdateDescriptionRequestFromEntityMapper.fromEntityToDto(entity);

    return this.http.put<DescriptionResponse>(`${this.resourcePath()}/${id}`, request, this.httpOptions).pipe(
      map((response: DescriptionResponse) => DescriptionEntityFromResponseMapper.fromDtoToEntity(response)),
      retry(2), // Retry PUT (idempotent)
      catchError(this.handleError)
    );
  }

  /**
   * GET /api/v1/descriptions:batchGet?ids=[]
   * Batch get descriptions by IDs
   */
  batchGetByIds(ids: string[]): Observable<DescriptionEntity[]> {
    if (!ids || ids.length === 0) {return of([]);}
    const params = ids.reduce((acc, id) => acc.append('ids', id), new HttpParams());
    const options = { ...this.httpOptions, params };
    return this.http.get<DescriptionResponse[]>(`${this.resourcePath()}/:batchGet`, options).pipe(
      map((responses: DescriptionResponse[]) => responses.map(r => DescriptionEntityFromResponseMapper.fromDtoToEntity(r))
      ),
      retry(2),
      catchError(this.handleError)
    );
  }
}
