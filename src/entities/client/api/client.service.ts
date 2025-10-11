import {BaseService} from '../../../shared/api';
import {Injectable} from '@angular/core';
import {catchError, map, Observable, retry} from 'rxjs';
import {ClientEntity} from '../model';
import {ClientResponseDto} from './client-response.dto';
import {ClientEntityFromResponseMapper} from './client-entity-from-response.mapper';

@Injectable({
  providedIn: 'root'
})
export class ClientService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'clients';
  }

  getAll(): Observable<ClientEntity[]> {
    return this.http.get<ClientResponseDto[]>(`${this.resourcePath()}`, this.httpOptions).pipe(
      map((clients: ClientResponseDto[]) => clients.map(client => ClientEntityFromResponseMapper.fromDtoToEntity(client))),
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
