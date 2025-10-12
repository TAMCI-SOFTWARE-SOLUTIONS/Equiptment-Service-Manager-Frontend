import {Injectable} from '@angular/core';
import {BaseService} from '../../../shared/api';
import {catchError, map, Observable, retry} from 'rxjs';
import {PanelTypeEntity} from '../model';
import {PanelTypeResponseDto} from './panel-type-response.dto';
import {PanelTypeFromResponseMapper} from './panel-type-from-response.mapper';
import {CreatePanelTypeRequestFromEntityMapper} from './create-panel-type-request-from-entity.mapper';
import {CreatePanelTypeRequest} from './create-panel-type-request.type';

@Injectable({
  providedIn: 'root'
})
export class PanelTypeService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'panel-types';
  }

  public getAll(): Observable<PanelTypeEntity[]> {
    return this.http.get<PanelTypeResponseDto[]>(this.resourcePath(), this.httpOptions).pipe(
      map((types: PanelTypeResponseDto[]) => types.map(type => PanelTypeFromResponseMapper.fromDtoToEntity(type))),
      retry(2),
      catchError(this.handleError)
    );
  }

  create(entity: PanelTypeEntity): Observable<PanelTypeEntity> {
    const request: CreatePanelTypeRequest = CreatePanelTypeRequestFromEntityMapper.fromEntityToDto(entity);
    return this.http.post<PanelTypeResponseDto>(this.resourcePath(), request, this.httpOptions).pipe(
      map((response: PanelTypeResponseDto) => PanelTypeFromResponseMapper.fromDtoToEntity(response)),
      // NO retry for POST (non-idempotent)
      catchError(this.handleError)
    );
  }
}
