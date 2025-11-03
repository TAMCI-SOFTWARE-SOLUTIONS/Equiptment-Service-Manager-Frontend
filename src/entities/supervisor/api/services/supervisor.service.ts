import { Injectable } from '@angular/core';
import {Observable, of} from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { BaseService } from '../../../../shared/api';
import { SupervisorEntity } from '../../model';
import { SupervisorResponse } from '../types';
import { CreateSupervisorRequest } from '../types';
import { UpdateSupervisorRequest } from '../types';
import { SupervisorEntityFromResponseMapper } from '../mappers';
import { CreateSupervisorRequestFromEntityMapper } from '../mappers';
import { UpdateSupervisorRequestFromEntityMapper } from '../mappers';
import {HttpParams} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SupervisorService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'supervisors';
  }

  /**
   * POST /api/v1/supervisors
   * Create new supervisor
   */
  create(entity: SupervisorEntity): Observable<SupervisorEntity> {
    const request: CreateSupervisorRequest = CreateSupervisorRequestFromEntityMapper.fromEntityToDto(entity);

    return this.http.post<SupervisorResponse>(
      this.resourcePath(),
      request,
      this.httpOptions
    ).pipe(
      map((response: SupervisorResponse) =>
        SupervisorEntityFromResponseMapper.fromDtoToEntity(response)
      ),
      catchError(this.handleError)
    );
  }

  /**
   * GET /api/v1/supervisors
   * Get all supervisors
   */
  getAll(): Observable<SupervisorEntity[]> {
    return this.http.get<SupervisorResponse[]>(
      this.resourcePath(),
      this.httpOptions
    ).pipe(
      map((responses: SupervisorResponse[]) =>
        responses.map(r => SupervisorEntityFromResponseMapper.fromDtoToEntity(r))
      ),
      retry(2),
      catchError(this.handleError)
    );
  }

  /**
   * GET /api/v1/supervisors/{id}
   * Get supervisor by ID
   */
  getById(id: string): Observable<SupervisorEntity> {
    return this.http.get<SupervisorResponse>(
      `${this.resourcePath()}/${id}`,
      this.httpOptions
    ).pipe(
      map((response: SupervisorResponse) =>
        SupervisorEntityFromResponseMapper.fromDtoToEntity(response)
      ),
      retry(2),
      catchError(this.handleError)
    );
  }

  /**
   * PUT /api/v1/supervisors/{id}
   * Update existing supervisor
   */
  update(id: string, entity: SupervisorEntity): Observable<SupervisorEntity> {
    const request: UpdateSupervisorRequest = UpdateSupervisorRequestFromEntityMapper.fromEntityToDto(entity);

    return this.http.put<SupervisorResponse>(
      `${this.resourcePath()}/${id}`,
      request,
      this.httpOptions
    ).pipe(
      map((response: SupervisorResponse) =>
        SupervisorEntityFromResponseMapper.fromDtoToEntity(response)
      ),
      retry(2),
      catchError(this.handleError)
    );
  }

  /**
   * DELETE /api/v1/supervisors/{id}
   * Delete supervisor
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.resourcePath()}/${id}`,
      this.httpOptions
    ).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  /**
   * GET /api/v1/supervisors/:batchGet
   * Get supervisors by IDs
   */
  getAllByIds(ids: string[]): Observable<SupervisorEntity[]> {
    if (!ids || ids.length === 0) {return of([]);}
    const params = ids.reduce((acc, id) => acc.append('ids', id), new HttpParams());
    const options = { ...this.httpOptions, params };
    return this.http.get<SupervisorResponse[]>(`${this.resourcePath()}/:batchGet`, options).pipe(
      map((responses: SupervisorResponse[]) => responses.map(r => SupervisorEntityFromResponseMapper.fromDtoToEntity(r))),
      retry(2),
      catchError(this.handleError)
    );
  }
}
