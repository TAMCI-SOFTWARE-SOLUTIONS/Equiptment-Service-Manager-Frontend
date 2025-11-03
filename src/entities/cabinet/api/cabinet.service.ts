import {BaseService} from '../../../shared/api';
import {Injectable} from '@angular/core';
import {catchError, map, Observable, of, retry} from 'rxjs';
import {CabinetEntity} from '../model';
import {CabinetResponseDto} from './cabinet-response.dto';
import {CabinetEntityFromResponseMapper} from './cabinet-entity-from-response.mapper';
import {CreateCabinetRequest} from './create-cabinet-request.type';
import {CreateCabinetRequestFromEntityMapper} from './create-cabinet-request-from-entity.mapper';
import {UpdateCabinetRequestFromEntityMapper} from './update-cabinet-request-from-entity.mapper';
import {UpdateCabinetRequest} from './update-cabinet-request.type';
import {InspectableItemEntity} from '../../inspectable-item';
import {HttpParams} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CabinetService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'cabinets';
  }

  public getAll(): Observable<CabinetEntity[]> {
    return this.http.get<CabinetResponseDto[]>(this.resourcePath(), this.httpOptions).pipe(
      map((cabinets: CabinetResponseDto[]) => cabinets.map(cabinet => CabinetEntityFromResponseMapper.fromDtoToEntity(cabinet))),
      retry(2),
      catchError(this.handleError)
    );
  }

  public getById(id: string): Observable<CabinetEntity> {
    return this.http.get<CabinetResponseDto>(`${this.resourcePath()}/${id}`, this.httpOptions).pipe(
      map((cabinet: CabinetResponseDto) => CabinetEntityFromResponseMapper.fromDtoToEntity(cabinet)),
      retry(2),
      catchError(this.handleError)
    );
  }

  create(entity: CabinetEntity): Observable<CabinetEntity> {
    const request: CreateCabinetRequest = CreateCabinetRequestFromEntityMapper.fromEntityToDto(entity);
    return this.http.post<CabinetResponseDto>(this.resourcePath(), request, this.httpOptions).pipe(
      map((response: CabinetResponseDto) => CabinetEntityFromResponseMapper.fromDtoToEntity(response)),
      catchError(this.handleError)
    );
  }

  update(entity: CabinetEntity): Observable<CabinetEntity> {
    const request: UpdateCabinetRequest = UpdateCabinetRequestFromEntityMapper.fromEntityToDto(entity);
    return this.http.put<CabinetResponseDto>(`${this.resourcePath()}/${entity.id}`, request, this.httpOptions).pipe(
      map((response: CabinetResponseDto) => CabinetEntityFromResponseMapper.fromDtoToEntity(response)),
      catchError(this.handleError)
    )
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.resourcePath()}/${id}`, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  getAllInspectableItems(cabinetId: string): Observable<InspectableItemEntity[]> {
    return this.http.get<InspectableItemEntity[]>(`${this.resourcePath()}/${cabinetId}/inspectable-items`, this.httpOptions).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  getAllByIds(ids: string[]): Observable<CabinetEntity[]> {
    if (!ids || ids.length === 0) {return of([]);}
    const params = ids.reduce((acc, id) => acc.append('ids', id), new HttpParams());
    const options = { ...this.httpOptions, params };
    return this.http.get<CabinetResponseDto[]>(`${this.resourcePath()}/:batchGet`, options).pipe(
      map((responses: CabinetResponseDto[]) => responses.map(response => CabinetEntityFromResponseMapper.fromDtoToEntity(response))),
      retry(2),
      catchError(this.handleError)
    );
  }
}
