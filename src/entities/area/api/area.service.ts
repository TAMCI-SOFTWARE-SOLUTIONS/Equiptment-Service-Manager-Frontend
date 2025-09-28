import {Injectable} from '@angular/core';
import {BaseService} from '../../../shared/api';
import {catchError, map, Observable, retry} from 'rxjs';
import {AreaEntity} from '../model';
import {AreaResponseDto} from './area-response.dto';
import {AreaEntityFromResponseMapper} from './area-entity-from-response.mapper';

@Injectable({
  providedIn: 'root'
})
export class AreaService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'areas';
  }

  public getAllByClientId(clientId: string): Observable<AreaEntity[]> {
    return this.http.get<AreaResponseDto[]>(`${this.resourcePath()}?clientId=${clientId}`, this.httpOptions).pipe(
      map((areas: AreaResponseDto[]) => areas.map(area => AreaEntityFromResponseMapper.fromDtoToEntity(area))),
      retry(2),
      catchError(this.handleError)
    );
  }
}
