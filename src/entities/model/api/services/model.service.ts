import { Injectable } from '@angular/core';
import {Observable, of} from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { BaseService } from '../../../../shared/api';
import { ModelEntity } from '../../model/entities/model.entity';
import { ModelResponse } from '../types/model-response.type';
import { CreateModelRequest } from '../types/create-model-request.type';
import { ModelEntityFromResponseMapper } from '../mappers/model-entity-from-response.mapper';
import { CreateModelRequestFromEntityMapper } from '../mappers/create-model-request-from-entity.mapper';
import { UpdateModelRequestFromEntityMapper } from '../mappers/update-model-request-from-entity.mapper';
import {HttpParams} from '@angular/common/http';
import {DescriptionEntity} from '../../../description/model/entities/description.entity';
import {DescriptionResponse} from '../../../description/api/types/description-response.type';
import {
  DescriptionEntityFromResponseMapper
} from '../../../description/api/mappers/description-entity-from-response.mapper';

@Injectable({
  providedIn: 'root'
})
export class ModelService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'models';
  }

  getAll(): Observable<ModelEntity[]> {
    return this.http.get<ModelResponse[]>(this.resourcePath(), this.httpOptions).pipe(
      map((responses: ModelResponse[]) =>
        responses.map(r => ModelEntityFromResponseMapper.fromDtoToEntity(r))
      ),
      retry(2),
      catchError(this.handleError)
    );
  }

  getById(id: string): Observable<ModelEntity> {
    return this.http.get<ModelResponse>(
      `${this.resourcePath()}/${id}`,
      this.httpOptions
    ).pipe(
      map((response: ModelResponse) =>
        ModelEntityFromResponseMapper.fromDtoToEntity(response)
      ),
      retry(2),
      catchError(this.handleError)
    );
  }

  create(entity: ModelEntity): Observable<ModelEntity> {
    const request: CreateModelRequest =
      CreateModelRequestFromEntityMapper.fromEntityToDto(entity);

    return this.http.post<ModelResponse>(
      this.resourcePath(),
      request,
      this.httpOptions
    ).pipe(
      map((response: ModelResponse) =>
        ModelEntityFromResponseMapper.fromDtoToEntity(response)
      ),
      catchError(this.handleError)
    );
  }

  update(id: string, entity: Partial<ModelEntity>): Observable<ModelEntity> {
    const request = UpdateModelRequestFromEntityMapper.fromEntityToDto(
      entity as ModelEntity
    );

    return this.http.put<ModelResponse>(
      `${this.resourcePath()}/${id}`,
      request,
      this.httpOptions
    ).pipe(
      map((response: ModelResponse) =>
        ModelEntityFromResponseMapper.fromDtoToEntity(response)
      ),
      retry(2),
      catchError(this.handleError)
    );
  }

  batchGetByIds(ids: string[]): Observable<ModelEntity[]> {
    if (!ids || ids.length === 0) {return of([]);}
    const params = ids.reduce((acc, id) => acc.append('ids', id), new HttpParams());
    const options = { ...this.httpOptions, params };
    return this.http.get<ModelResponse[]>(`${this.resourcePath()}/:batchGet`, options).pipe(
      map((responses: ModelResponse[]) => responses.map(r => ModelEntityFromResponseMapper.fromDtoToEntity(r))),
      retry(2),
      catchError(this.handleError)
    );
  }

  getAllDescriptionsByModelId(modelId: string): Observable<DescriptionEntity[]> {
    return this.http.get<DescriptionResponse[]>(`${this.resourcePath()}/${modelId}/descriptions`, this.httpOptions).pipe(
      map((responses: DescriptionResponse[]) => responses.map(r => DescriptionEntityFromResponseMapper.fromDtoToEntity(r))),
      retry(2),
      catchError(this.handleError)
    )
  }
}
