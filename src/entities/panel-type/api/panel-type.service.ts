import {Injectable} from '@angular/core';
import {BaseService} from '../../../shared/api';
import {catchError, map, Observable, retry} from 'rxjs';
import {PanelTypeEntity} from '../model';
import {PanelTypeResponseDto} from './panel-type-response.dto';
import {PanelTypeFromResponseMapper} from './panel-type-from-response.mapper';

@Injectable({
  providedIn: 'root'
})
export class PanelTypeService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'panel-types';
  }
  
  public getAll(): Observable<PanelTypeEntity[]> {
    return this.http.get<PanelTypeResponseDto[]>(this.resourcePath(), this.httpOptions).pipe(
      map((types: PanelTypeResponseDto[]) => types.map(type => PanelTypeFromResponseMapper.fromDtoToEntity(type))),
      retry(2),
      catchError(this.handleError)
    );
  }
}
