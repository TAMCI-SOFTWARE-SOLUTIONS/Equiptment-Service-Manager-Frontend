import {Injectable} from '@angular/core';
import {BaseService} from '../../../shared/api';
import {catchError, map, Observable, retry} from 'rxjs';
import {CabinetTypeEntity} from '../model';
import {CabinetTypeResponseDto} from './cabinet-type-response.dto';
import {CabinetTypeFromResponseMapper} from './cabinet-type-from-response.mapper';

@Injectable({
  providedIn: 'root'
})
export class CabinetTypeService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'cabinet-types';
  }

  public getAll(): Observable<CabinetTypeEntity[]> {
    return this.http.get<CabinetTypeResponseDto[]>(this.resourcePath(), this.httpOptions).pipe(
      map((types: CabinetTypeResponseDto[]) => types.map(type => CabinetTypeFromResponseMapper.fromDtoToEntity(type))),
      retry(2),
      catchError(this.handleError)
    );
  }
}
