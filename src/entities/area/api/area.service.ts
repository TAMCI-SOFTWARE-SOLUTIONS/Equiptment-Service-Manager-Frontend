import {Injectable} from '@angular/core';
import {BaseService} from '../../../shared/api';
import {catchError, map, Observable, of, retry} from 'rxjs';
import {AreaEntity} from '../model';
import {AreaResponseDto} from './area-response.dto';
import {AreaEntityFromResponseMapper} from './area-entity-from-response.mapper';
import {CreateAreaRequestFromEntityMapper} from './create-area-request-from-entity.mapper';
import {CreateAreaRequest} from './create-area-request.type';
import {UpdateAreaRequestFromEntityMapper} from './update-area-request-from-entity.mapper';
import {UpdateAreaRequest} from './update-area-request.type';
import {HttpParams} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AreaService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'areas';
  }
  /**
   * POST /api/v1/areas
   * Create new area
   */
  create(entity: AreaEntity): Observable<AreaEntity> {
    const request: CreateAreaRequest = CreateAreaRequestFromEntityMapper.fromEntityToDto(entity);
    return this.http.post<AreaResponseDto>(this.resourcePath(), request, this.httpOptions).pipe(
      map((response: AreaResponseDto) => AreaEntityFromResponseMapper.fromDtoToEntity(response)),
      catchError(this.handleError)
    );
  }

  /**
   * GET /api/v1/areas/{areaId}
   * Get area by ID
   */
  getById(areaId: string): Observable<AreaEntity> {
    return this.http.get<AreaResponseDto>(`${this.resourcePath()}/${areaId}`, this.httpOptions).pipe(
      map((response: AreaResponseDto) => AreaEntityFromResponseMapper.fromDtoToEntity(response)),
      retry(2),
      catchError(this.handleError)
    );
  }

  /**
   * GET /api/v1/areas?clientId={clientId}
   * Get all areas by client ID
   */
  public getAllByClientId(clientId: string): Observable<AreaEntity[]> {
    return this.http.get<AreaResponseDto[]>(`${this.resourcePath()}?clientId=${clientId}`, this.httpOptions).pipe(
      map((areas: AreaResponseDto[]) => areas.map(area => AreaEntityFromResponseMapper.fromDtoToEntity(area))),
      retry(2),
      catchError(this.handleError)
    );
  }

  /**
   * GET /api/v1/areas/batchGet
   * Get all areas by IDs
   * @param ids
   */
  getAllByIds(ids: string[]): Observable<AreaEntity[]> {
    if (!ids || ids.length === 0) {return of([]);}
    const params = ids.reduce((acc, id) => acc.append('ids', id), new HttpParams());
    const options = { ...this.httpOptions, params };
    return this.http.get<AreaResponseDto[]>(`${this.resourcePath()}/:batchGet`, options).pipe(
      map((areas: AreaResponseDto[]) => areas.map(area => AreaEntityFromResponseMapper.fromDtoToEntity(area))),
      retry(2),
      catchError(this.handleError)
    );
  }

  /**
   * PUT /api/v1/areas/{areaId}
   * Update area
   */
  update(areaId: string, entity: AreaEntity): Observable<AreaEntity> {
    const request: UpdateAreaRequest = UpdateAreaRequestFromEntityMapper.fromEntityToDto(entity);
    return this.http.put<AreaResponseDto>(`${this.resourcePath()}/${areaId}`, request, this.httpOptions).pipe(
      map((response: AreaResponseDto) => AreaEntityFromResponseMapper.fromDtoToEntity(response)),
      retry(2),
      catchError(this.handleError)
    );
  }

  /**
   * DELETE /api/v1/areas/{areaId}
   * Delete area
   */
  delete(areaId: string): Observable<void> {
    return this.http.delete<void>(`${this.resourcePath()}/${areaId}`, this.httpOptions).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
}
