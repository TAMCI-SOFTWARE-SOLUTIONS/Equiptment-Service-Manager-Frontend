import {BaseService} from '../../../shared/api';
import {Injectable} from '@angular/core';
import {catchError, map, Observable, retry} from 'rxjs';
import {CabinetEntity} from '../model';
import {CabinetResponseDto} from './cabinet-response.dto';
import {CabinetEntityFromResponseMapper} from './cabinet-entity-from-response.mapper';

@Injectable({
  providedIn: 'root'
})
export class CabinetService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'cabinets';
  }

  public getAll(): Observable<CabinetEntity[]> {
    return this.http.get<CabinetResponseDto[]>(this.resourcePath(), this.httpOptions).pipe(
      map((cabinets: CabinetResponseDto[]) => cabinets.map(cabinet => CabinetEntityFromResponseMapper.fromDtoToEntity(cabinet))),
      retry(2),
      catchError(this.handleError)
    );
  }
}
