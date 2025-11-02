import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { BaseService } from '../../../../shared/api';
import { EquipmentServiceEntity } from '../../model/entities/equipment-service.entity';
import { EquipmentServiceResponse } from '../types/equipment-service-response.type';
import { CreateEquipmentServiceRequest } from '../types/create-equipment-service-request.type';
import { EquipmentServiceEntityFromResponseMapper } from '../mappers/equipment-service-entity-from-response.mapper';
import { CreateEquipmentServiceRequestFromEntityMapper } from '../mappers/create-equipment-service-request-from-entity.mapper';
import { UpdateEquipmentServiceRequestFromEntityMapper } from '../mappers/update-equipment-service-request-from-entity.mapper';
import {ItemInspectionEntity} from '../../../item-inspection';
import {EquipmentServiceFilters} from '../filters/equipment-service.filters';
import {HttpParams} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EquipmentServiceService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'services';
  }

  getAll(filters?: EquipmentServiceFilters): Observable<EquipmentServiceEntity[]> {
    let params = new HttpParams();

    if (filters) {
      if (filters.operatorId) {
        params = params.set('operatorId', filters.operatorId);
      }
      if (filters.projectId) {
        params = params.set('projectId', filters.projectId);
      }
      if (filters.equipmentId) {
        params = params.set('equipmentId', filters.equipmentId);
      }
      if (filters.status) {
        params = params.set('status', filters.status);
      }
      if (filters.statuses && filters.statuses.length > 0) {
        filters.statuses.forEach(status => {
          params = params.append('statuses', status);
        });
      }
      if (filters.supervisorId) {
        params = params.set('supervisorId', filters.supervisorId);
      }
      if (filters.equipmentType) {
        params = params.set('equipmentType', filters.equipmentType);
      }
      if (filters.serviceTypeId) {
        params = params.set('serviceTypeId', filters.serviceTypeId);
      }
    }

    return this.http.get<EquipmentServiceResponse[]>(this.resourcePath(), { ...this.httpOptions, params }).pipe(
      map((responses: EquipmentServiceResponse[]) =>
        responses.map(r => EquipmentServiceEntityFromResponseMapper.fromDtoToEntity(r))
      ),
      retry(2),
      catchError(this.handleError)
    );
  }

  getById(id: string): Observable<EquipmentServiceEntity> {
    return this.http.get<EquipmentServiceResponse>(
      `${this.resourcePath()}/${id}`,
      this.httpOptions
    ).pipe(
      map((response: EquipmentServiceResponse) =>
        EquipmentServiceEntityFromResponseMapper.fromDtoToEntity(response)
      ),
      retry(2),
      catchError(this.handleError)
    );
  }

  create(entity: EquipmentServiceEntity): Observable<EquipmentServiceEntity> {
    const request: CreateEquipmentServiceRequest =
      CreateEquipmentServiceRequestFromEntityMapper.fromEntityToDto(entity);

    return this.http.post<EquipmentServiceResponse>(
      this.resourcePath(),
      request,
      this.httpOptions
    ).pipe(
      map((response: EquipmentServiceResponse) =>
        EquipmentServiceEntityFromResponseMapper.fromDtoToEntity(response)
      ),
      catchError(this.handleError)
    );
  }

  update(id: string, entity: Partial<EquipmentServiceEntity>): Observable<EquipmentServiceEntity> {
    const request = UpdateEquipmentServiceRequestFromEntityMapper.fromEntityToDto(
      entity as EquipmentServiceEntity
    );

    return this.http.put<EquipmentServiceResponse>(
      `${this.resourcePath()}/${id}`,
      request,
      this.httpOptions
    ).pipe(
      map((response: EquipmentServiceResponse) =>
        EquipmentServiceEntityFromResponseMapper.fromDtoToEntity(response)
      ),
      retry(2),
      catchError(this.handleError)
    );
  }

  getAllItemInspections(equipmentServiceId: string): Observable<ItemInspectionEntity[]> {
    return this.http.get<ItemInspectionEntity[]>(`${this.resourcePath()}/${equipmentServiceId}/item-inspections`, this.httpOptions).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  start(id: string): Observable<EquipmentServiceEntity> {
    return this.http.post<EquipmentServiceResponse>(
      `${this.resourcePath()}/${id}/start`,
      {},
      this.httpOptions
    ).pipe(
      map((response: EquipmentServiceResponse) =>
        EquipmentServiceEntityFromResponseMapper.fromDtoToEntity(response)
      ),
      retry(2),
    )
  }

  complete(id: string): Observable<EquipmentServiceEntity> {
    return this.http.post<EquipmentServiceResponse>(
      `${this.resourcePath()}/${id}/complete`,
      {},
      this.httpOptions
    ).pipe(
      map((response: EquipmentServiceResponse) =>
        EquipmentServiceEntityFromResponseMapper.fromDtoToEntity(response)
      ),
    )
  }

  cancel(id: string): Observable<EquipmentServiceEntity> {
    return this.http.post<EquipmentServiceResponse>(
      `${this.resourcePath()}/${id}/cancel`,
      {},
      this.httpOptions
    ).pipe(
      map((response: EquipmentServiceResponse) =>
        EquipmentServiceEntityFromResponseMapper.fromDtoToEntity(response)
      ),
    )
  }
}
