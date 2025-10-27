import {Injectable} from '@angular/core';
import {BaseService} from '../../../shared/api';
import {catchError, map, Observable, of, retry} from 'rxjs';
import {PanelEntity} from '../model';
import {PanelResponseDto} from './panel-response.dto';
import {PanelEntityFromResponseMapper} from './panel-entity-from-response.mapper';
import {CreatePanelRequest} from './create-panel-request.type';
import {CreatePanelRequestFromEntityMapper} from './create-panel-request-from-entity.mapper';
import {UpdatePanelRequestFromEntityMapper} from './update-panel-request-from-entity.mapper';
import {UpdatePanelRequest} from './update-panel-request.type';
import {InspectableItemEntity} from '../../inspectable-item';
import {HttpParams} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PanelService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'panels';
  }

  public getAll(): Observable<PanelEntity[]> {
    return this.http.get<PanelResponseDto[]>(this.resourcePath(), this.httpOptions).pipe(
      map((panels: PanelResponseDto[]) => panels.map(panel => PanelEntityFromResponseMapper.fromDtoToEntity(panel))),
      retry(2),
      catchError(this.handleError)
    );
  }

  public getById(id: string): Observable<PanelEntity> {
    return this.http.get<PanelResponseDto>(`${this.resourcePath()}/${id}`, this.httpOptions).pipe(
      map((panel: PanelResponseDto) => PanelEntityFromResponseMapper.fromDtoToEntity(panel)),
      retry(2),
      catchError(this.handleError)
    );
  }

  create(entity: PanelEntity): Observable<PanelEntity> {
    const request: CreatePanelRequest = CreatePanelRequestFromEntityMapper.fromEntityToDto(entity);
    return this.http.post<PanelResponseDto>(this.resourcePath(), request, this.httpOptions).pipe(
      map((response: PanelResponseDto) => PanelEntityFromResponseMapper.fromDtoToEntity(response)),
      catchError(this.handleError)
    );
  }

  update(entity: PanelEntity): Observable<PanelEntity> {
    const request: UpdatePanelRequest = UpdatePanelRequestFromEntityMapper.fromEntityToDto(entity);
    return this.http.put<PanelResponseDto>(`${this.resourcePath()}/${entity.id}`, request, this.httpOptions).pipe(
      map((response: PanelResponseDto) => PanelEntityFromResponseMapper.fromDtoToEntity(response)),
      catchError(this.handleError)
    )
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.resourcePath()}/${id}`, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  getAllInspectableItems(panelId: string): Observable<InspectableItemEntity[]> {
    return this.http.get<InspectableItemEntity[]>(`${this.resourcePath()}/${panelId}/inspectable-items`, this.httpOptions).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  getAllByIds(ids: string[]): Observable<PanelEntity[]> {
    if (!ids || ids.length === 0) {return of([]);}
    const params = ids.reduce((acc, id) => acc.append('ids', id), new HttpParams());
    const options = { ...this.httpOptions, params };
    return this.http.get<PanelResponseDto[]>(`${this.resourcePath()}/:batchGet`, options).pipe(
      map((panels: PanelResponseDto[]) => panels.map(panel => PanelEntityFromResponseMapper.fromDtoToEntity(panel))),
      retry(2),
      catchError(this.handleError)
    );
  }
}
