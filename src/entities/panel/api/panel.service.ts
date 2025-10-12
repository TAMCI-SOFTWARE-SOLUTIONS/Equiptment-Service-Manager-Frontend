import {Injectable} from '@angular/core';
import {BaseService} from '../../../shared/api';
import {catchError, map, Observable, retry} from 'rxjs';
import {PanelEntity} from '../model';
import {PanelResponseDto} from './panel-response.dto';
import {PanelEntityFromResponseMapper} from './panel-entity-from-response.mapper';
import {CreatePanelRequest} from './create-panel-request.type';
import {CreatePanelRequestFromEntityMapper} from './create-panel-request-from-entity.mapper';

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
}
