import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { BaseService } from '../../../../shared/api';
import { BrandEntity } from '../../model/entities/brand.entity';
import { BrandResponse } from '../types/brand-response.type';
import { CreateBrandRequest } from '../types/create-brand-request.type';
import { BrandEntityFromResponseMapper } from '../mappers/brand-entity-from-response.mapper';
import { CreateBrandRequestFromEntityMapper } from '../mappers/create-brand-request-from-entity.mapper';
import { UpdateBrandRequestFromEntityMapper } from '../mappers/update-brand-request-from-entity.mapper';
import {ModelEntity, ModelEntityFromResponseMapper, ModelResponse} from '../../../model';

@Injectable({
  providedIn: 'root'
})
export class BrandService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'brands';
  }

  getAll(): Observable<BrandEntity[]> {
    return this.http.get<BrandResponse[]>(this.resourcePath(), this.httpOptions).pipe(
      map((responses: BrandResponse[]) =>
        responses.map(r => BrandEntityFromResponseMapper.fromDtoToEntity(r))
      ),
      retry(2),
      catchError(this.handleError)
    );
  }

  getById(id: string): Observable<BrandEntity> {
    return this.http.get<BrandResponse>(
      `${this.resourcePath()}/${id}`,
      this.httpOptions
    ).pipe(
      map((response: BrandResponse) =>
        BrandEntityFromResponseMapper.fromDtoToEntity(response)
      ),
      retry(2),
      catchError(this.handleError)
    );
  }

  create(entity: BrandEntity): Observable<BrandEntity> {
    const request: CreateBrandRequest =
      CreateBrandRequestFromEntityMapper.fromEntityToDto(entity);

    return this.http.post<BrandResponse>(
      this.resourcePath(),
      request,
      this.httpOptions
    ).pipe(
      map((response: BrandResponse) =>
        BrandEntityFromResponseMapper.fromDtoToEntity(response)
      ),
      catchError(this.handleError)
    );
  }

  update(id: string, entity: Partial<BrandEntity>): Observable<BrandEntity> {
    const request = UpdateBrandRequestFromEntityMapper.fromEntityToDto(
      entity as BrandEntity
    );

    return this.http.put<BrandResponse>(
      `${this.resourcePath()}/${id}`,
      request,
      this.httpOptions
    ).pipe(
      map((response: BrandResponse) =>
        BrandEntityFromResponseMapper.fromDtoToEntity(response)
      ),
      retry(2),
      catchError(this.handleError)
    );
  }

  batchGetByIds(ids: string[]): Observable<BrandEntity[]> {
    const params = ids.join(',');
    return this.http.get<BrandResponse[]>(
      `${this.resourcePath()}/batch?ids=${params}`,
      this.httpOptions
    ).pipe(
      map((responses: BrandResponse[]) =>
        responses.map(r => BrandEntityFromResponseMapper.fromDtoToEntity(r))
      ),
      retry(2),
      catchError(this.handleError)
    );
  }

  getAllModelsByBrandId(brandId: string): Observable<ModelEntity[]> {
    return this.http.get<ModelResponse[]>(
      `${this.resourcePath()}/${brandId}/models`,
      this.httpOptions
    ).pipe(
      map((responses: ModelResponse[]) =>
        responses.map(r => ModelEntityFromResponseMapper.fromDtoToEntity(r))
      ),
      retry(2),
      catchError(this.handleError)
    );
  }
}
