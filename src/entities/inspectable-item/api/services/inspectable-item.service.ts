import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {catchError, map, retry} from 'rxjs/operators';
import {BaseService} from '../../../../shared/api/services/base.service';
import {InspectableItemEntity} from '../../model';
import {CreateInspectableItemRequest, InspectableItemResponse, UpdateInspectableItemRequest} from '../types';
import {
  CreateInspectableItemRequestFromEntityMapper,
  InspectableItemEntityFromResponseMapper,
  UpdateInspectableItemRequestFromEntityMapper
} from '../mappers';
import {HttpParams} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class InspectableItemService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'inspectable-items';
  }

  create(entity: InspectableItemEntity, equipmentId: string): Observable<InspectableItemEntity> {
    const request: CreateInspectableItemRequest = CreateInspectableItemRequestFromEntityMapper.fromEntityToDto(entity, equipmentId);

    return this.http.post<InspectableItemResponse>(
      this.resourcePath(),
      request,
      this.httpOptions
    ).pipe(
      map((response: InspectableItemResponse) =>
        InspectableItemEntityFromResponseMapper.fromDtoToEntity(response)
      ),
      catchError(this.handleError)
    );
  }

  getById(id: string): Observable<InspectableItemEntity> {
    return this.http.get<InspectableItemResponse>(
      `${this.resourcePath()}/${id}`,
      this.httpOptions
    ).pipe(
      map((response: InspectableItemResponse) =>
        InspectableItemEntityFromResponseMapper.fromDtoToEntity(response)
      ),
      retry(2),
      catchError(this.handleError)
    );
  }

  getAllByIds(ids: string[]): Observable<InspectableItemEntity[]> {
    if (!ids || ids.length === 0) {return of([]);}
    const params = ids.reduce((acc, id) => acc.append('ids', id), new HttpParams());
    const options = { ...this.httpOptions, params };
    return this.http.get<InspectableItemResponse[]>(`${this.resourcePath()}/:batchGet`, options).pipe(
      map((responses: InspectableItemResponse[]) => responses.map(response => InspectableItemEntityFromResponseMapper.fromDtoToEntity(response))),
      retry(2),
      catchError(this.handleError)
    );
  }

  update(id: string, entity: InspectableItemEntity): Observable<InspectableItemEntity> {
    const request: UpdateInspectableItemRequest = UpdateInspectableItemRequestFromEntityMapper.fromEntityToDto(entity);

    return this.http.put<InspectableItemResponse>(
      `${this.resourcePath()}/${id}`,
      request,
      this.httpOptions
    ).pipe(
      map((response: InspectableItemResponse) =>
        InspectableItemEntityFromResponseMapper.fromDtoToEntity(response)
      ),
      retry(2),
      catchError(this.handleError)
    );
  }

  delete(id: string): Observable<InspectableItemEntity> {
    return this.http.delete<InspectableItemResponse>(
      `${this.resourcePath()}/${id}`,
      this.httpOptions
    ).pipe(
      map((response: InspectableItemResponse) =>
        InspectableItemEntityFromResponseMapper.fromDtoToEntity(response)
      ),
      retry(2),
      catchError(this.handleError)
    );
  }
}
