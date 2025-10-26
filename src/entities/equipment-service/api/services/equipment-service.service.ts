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

@Injectable({
  providedIn: 'root'
})
export class EquipmentServiceService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'services';
  }

  getAll(): Observable<EquipmentServiceEntity[]> {
    return this.http.get<EquipmentServiceResponse[]>(this.resourcePath(), this.httpOptions).pipe(
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
}
