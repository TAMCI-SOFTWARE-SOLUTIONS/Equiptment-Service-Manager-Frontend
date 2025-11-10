import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, retry, catchError } from 'rxjs/operators';
import {BaseService} from '../../../../shared/api/services/base.service';
import { ItemInspectionEntity } from '../../model';
import { ItemInspectionResponse } from '../types/item-inspection-response.type';
import { CreateItemInspectionRequest } from '../types/create-item-inspection-request.type';
import { UpdateItemInspectionRequest } from '../types/update-item-inspection-request.type';
import { ItemInspectionEntityFromResponseMapper } from '../mappers/item-inspection-entity-from-response.mapper';
import { CreateItemInspectionRequestFromEntityMapper } from '../mappers/create-item-inspection-request-from-entity.mapper';
import { UpdateItemInspectionRequestFromEntityMapper } from '../mappers/update-item-inspection-request-from-entity.mapper';

@Injectable({
  providedIn: 'root'
})
export class ItemInspectionService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'item-inspections'; // Matches backend @RequestMapping
  }

  /**
   * GET /api/v1/item-inspections
   * Get all item inspections
   */
  getAll(): Observable<ItemInspectionEntity[]> {
    return this.http.get<ItemInspectionResponse[]>(this.resourcePath(), this.httpOptions).pipe(
      map((responses: ItemInspectionResponse[]) =>
        responses.map(r => ItemInspectionEntityFromResponseMapper.fromDtoToEntity(r))
      ),
      retry(2), // Retry GET requests
      catchError(this.handleError)
    );
  }

  /**
   * GET /api/v1/item-inspections/{id}
   * Get item inspection by ID
   */
  getById(id: string): Observable<ItemInspectionEntity> {
    return this.http.get<ItemInspectionResponse>(
      `${this.resourcePath()}/${id}`,
      this.httpOptions
    ).pipe(
      map((response: ItemInspectionResponse) =>
        ItemInspectionEntityFromResponseMapper.fromDtoToEntity(response)
      ),
      retry(2),
      catchError(this.handleError)
    );
  }

  /**
   * POST /api/v1/item-inspections
   * Create new item inspection
   */
  create(entity: ItemInspectionEntity, serviceId: string): Observable<ItemInspectionEntity> {
    const request: CreateItemInspectionRequest =
      CreateItemInspectionRequestFromEntityMapper.fromEntityToDto(entity);
    request.serviceId = serviceId; // Set serviceId from context

    return this.http.post<ItemInspectionResponse>(
      this.resourcePath(),
      request,
      this.httpOptions
    ).pipe(
      map((response: ItemInspectionResponse) =>
        ItemInspectionEntityFromResponseMapper.fromDtoToEntity(response)
      ),
      // NO retry for POST (non-idempotent)
      catchError(this.handleError)
    );
  }

  /**
   * PUT /api/v1/item-inspections/{id}
   * Update existing item inspection
   */
  update(id: string, entity: Partial<ItemInspectionEntity>): Observable<ItemInspectionEntity> {
    const request: UpdateItemInspectionRequest = UpdateItemInspectionRequestFromEntityMapper.fromEntityToDto(
      entity as ItemInspectionEntity
    );

    return this.http.put<ItemInspectionResponse>(
      `${this.resourcePath()}/${id}`,
      request,
      this.httpOptions
    ).pipe(
      map((response: ItemInspectionResponse) =>
        ItemInspectionEntityFromResponseMapper.fromDtoToEntity(response)
      ),
      retry(2), // Retry PUT (idempotent)
      catchError(this.handleError)
    );
  }
}
