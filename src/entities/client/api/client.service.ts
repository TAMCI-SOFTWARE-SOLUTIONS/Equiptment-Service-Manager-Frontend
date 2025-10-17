import {BaseService} from '../../../shared/api';
import {Injectable} from '@angular/core';
import {catchError, map, Observable, retry, of} from 'rxjs';
import {ClientEntity} from '../model';
import {ClientEntityFromResponseMapper} from './client-entity-from-response.mapper';
import {CreateClientRequest} from './create-client-request.type';
import {CreateClientRequestFromEntityMapper} from './create-client-request-from-entity.mapper';
import {ClientResponse} from './client-response.type';
import {UpdateClientRequestFromEntityMapper} from './update-client-request-from-entity.mapper';
import {HttpParams} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ClientService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'clients';
  }

  create(entity: ClientEntity): Observable<ClientEntity> {
    const request: CreateClientRequest =
      CreateClientRequestFromEntityMapper.fromEntityToDto(entity);

    return this.http.post<ClientResponse>(
      this.resourcePath(),
      request,
      this.httpOptions
    ).pipe(
      map((response: ClientResponse) =>
        ClientEntityFromResponseMapper.fromDtoToEntity(response)
      ),
      // NO retry for POST (non-idempotent)
      catchError(this.handleError)
    );
  }

  update(entity: ClientEntity): Observable<ClientEntity> {
    const request: CreateClientRequest =
      UpdateClientRequestFromEntityMapper.fromEntityToDto(entity);
    return this.http.put<ClientResponse>(
      `${this.resourcePath()}/${entity.id}`,
      request,
      this.httpOptions
    ).pipe(
      map((response: ClientResponse) =>
        ClientEntityFromResponseMapper.fromDtoToEntity(response)
      ),
      // NO retry for POST (non-idempotent)
      catchError(this.handleError)
    );
  }

  getAll(): Observable<ClientEntity[]> {
    return this.http.get<ClientResponse[]>(`${this.resourcePath()}`, this.httpOptions).pipe(
      map((clients: ClientResponse[]) => clients.map(client => ClientEntityFromResponseMapper.fromDtoToEntity(client))),
      retry(2),
      catchError(this.handleError)
    );
  }

  getAllByIds(ids: string[]): Observable<ClientEntity[]> {
    if (!ids || ids.length === 0) {return of([]);}
    const params = ids.reduce((acc, id) => acc.append('ids', id), new HttpParams());
    const options = { ...this.httpOptions, params };
    return this.http.get<ClientResponse[]>(`${this.resourcePath()}/batchGet`, options).pipe(
      map((clients: ClientResponse[]) => clients.map(client => ClientEntityFromResponseMapper.fromDtoToEntity(client))),
      retry(2),
      catchError(this.handleError)
    );
  }

  getById(id: string): Observable<ClientEntity> {
    return this.http.get<ClientEntity>(`${this.resourcePath()}/${id}`, this.httpOptions).pipe(
      map((client: ClientEntity) => ClientEntityFromResponseMapper.fromDtoToEntity(client)),
      retry(2),
      catchError(this.handleError)
    );
  }
}
