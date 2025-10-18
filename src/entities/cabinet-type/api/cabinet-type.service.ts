import {Injectable} from '@angular/core';
import {BaseService} from '../../../shared/api';
import {catchError, map, Observable, retry} from 'rxjs';
import {CabinetTypeEntity} from '../model';
import {CabinetTypeResponseDto} from './cabinet-type-response.dto';
import {CabinetTypeFromResponseMapper} from './cabinet-type-from-response.mapper';
import {CreateCabinetTypeRequest} from './create-cabinet-type-request.type';
import {CreateCabinetTypeRequestFromEntityMapper} from './create-cabinet-type-request-from-entity.mapper';
import {UpdateCabinetTypeRequestFromEntityMapper} from './update-cabinet-type-request-from-entity.mapper';
import {UpdateCabinetTypeRequest} from './update-cabinet-type-request.type';

@Injectable({
  providedIn: 'root'
})
export class CabinetTypeService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'cabinet-types';
  }

  create(entity: CabinetTypeEntity): Observable<CabinetTypeEntity> {
    const request: CreateCabinetTypeRequest = CreateCabinetTypeRequestFromEntityMapper.fromEntityToDto(entity);
    return this.http.post<CabinetTypeResponseDto>(this.resourcePath(), request, this.httpOptions).pipe(
      map((response: CabinetTypeResponseDto) => CabinetTypeFromResponseMapper.fromDtoToEntity(response)),
      catchError(this.handleError)
    );
  }

  public getAll(): Observable<CabinetTypeEntity[]> {
    return this.http.get<CabinetTypeResponseDto[]>(this.resourcePath(), this.httpOptions).pipe(
      map((types: CabinetTypeResponseDto[]) => types.map(type => CabinetTypeFromResponseMapper.fromDtoToEntity(type))),
      retry(2),
      catchError(this.handleError)
    );
  }

  getById(id: string): Observable<CabinetTypeEntity> {
    return this.http.get<CabinetTypeResponseDto>(`${this.resourcePath()}/${id}`, this.httpOptions).pipe(
      map((response: CabinetTypeResponseDto) => CabinetTypeFromResponseMapper.fromDtoToEntity(response)),
      retry(2),
      catchError(this.handleError)
    );
  }

  update(id: string, entity: CabinetTypeEntity): Observable<CabinetTypeEntity> {
    const request: UpdateCabinetTypeRequest = UpdateCabinetTypeRequestFromEntityMapper.fromEntityToDto(entity);
    return this.http.put<CabinetTypeResponseDto>(`${this.resourcePath()}/${id}`, request, this.httpOptions).pipe(
      map((response: CabinetTypeResponseDto) => CabinetTypeFromResponseMapper.fromDtoToEntity(response)),
      retry(2),
      catchError(this.handleError)
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.resourcePath()}/${id}`, this.httpOptions).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
}
