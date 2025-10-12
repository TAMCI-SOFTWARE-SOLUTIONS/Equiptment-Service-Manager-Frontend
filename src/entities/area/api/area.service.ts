import {Injectable} from '@angular/core';
import {BaseService} from '../../../shared/api';
import {catchError, map, Observable, retry} from 'rxjs';
import {AreaEntity} from '../model';
import {AreaResponseDto} from './area-response.dto';
import {AreaEntityFromResponseMapper} from './area-entity-from-response.mapper';
import {CreateAreaRequestFromEntityMapper} from './create-area-request-from-entity.mapper';
import {CreateAreaRequest} from './create-area-request.type';

@Injectable({
  providedIn: 'root'
})
export class AreaService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'areas';
  }

  create(entity: AreaEntity): Observable<AreaEntity> {
    const request: CreateAreaRequest = CreateAreaRequestFromEntityMapper.fromEntityToDto(entity);
    return this.http.post<AreaResponseDto>(this.resourcePath(), request, this.httpOptions).pipe(
      map((response: AreaResponseDto) => AreaEntityFromResponseMapper.fromDtoToEntity(response)),
      catchError(this.handleError)
    );
  }

  getById(areaId: string): Observable<AreaEntity> {
    return this.http.get<AreaResponseDto>(`${this.resourcePath()}/${areaId}`, this.httpOptions).pipe(
      map((response: AreaResponseDto) => AreaEntityFromResponseMapper.fromDtoToEntity(response)),
      retry(2),
      catchError(this.handleError)
    );
  }

  public getAllByClientId(clientId: string): Observable<AreaEntity[]> {
    return this.http.get<AreaResponseDto[]>(`${this.resourcePath()}?clientId=${clientId}`, this.httpOptions).pipe(
      map((areas: AreaResponseDto[]) => areas.map(area => AreaEntityFromResponseMapper.fromDtoToEntity(area))),
      retry(2),
      catchError(this.handleError)
    );
  }
}
