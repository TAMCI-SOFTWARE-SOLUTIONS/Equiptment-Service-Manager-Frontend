import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {catchError, map, retry} from 'rxjs/operators';
import {BaseService} from '../../../../shared/api';
import {InspectableItemEntity} from '../../model';
import {CreateInspectableItemRequest, InspectableItemResponse, UpdateInspectableItemRequest} from '../types';
import {
  CreateInspectableItemRequestFromEntityMapper,
  InspectableItemEntityFromResponseMapper,
  UpdateInspectableItemRequestFromEntityMapper
} from '../mappers';

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

  getByCabinetId(cabinetId: string): Observable<InspectableItemEntity[]> {
    return this.http.get<InspectableItemResponse[]>(
      `cabinets/${cabinetId}/inspectable-items`,
      this.httpOptions
    ).pipe(
      map((responses: InspectableItemResponse[]) =>
        responses.map(r => InspectableItemEntityFromResponseMapper.fromDtoToEntity(r))
      ),
      retry(2),
      catchError(this.handleError)
    );
  }


  getByPanelId(panelId: string): Observable<InspectableItemEntity[]> {
    return this.http.get<InspectableItemResponse[]>(
      `panels/${panelId}/inspectable-items`,
      this.httpOptions
    ).pipe(
      map((responses: InspectableItemResponse[]) =>
        responses.map(r => InspectableItemEntityFromResponseMapper.fromDtoToEntity(r))
      ),
      retry(2),
      catchError(this.handleError)
    );
  }
}
