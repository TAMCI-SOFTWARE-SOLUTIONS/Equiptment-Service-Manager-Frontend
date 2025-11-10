import { Injectable } from '@angular/core';
import {Observable, map, retry} from 'rxjs';
import { RoleEntity } from '../../model';
import { RoleResponse } from '../types/role-response.type';
import { RoleEntityFromResponseMapper } from '../mappers/role-entity-from-response.mapper';
import {catchError} from 'rxjs/operators';
import {BaseService} from '../../../../shared/api/services/base.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'roles';
  }

  getAll(): Observable<RoleEntity[]> {
    return this.http.get<RoleResponse[]>(this.resourcePath(), this.httpOptions).pipe(
      map((responses: RoleResponse[]) => responses.map(r => RoleEntityFromResponseMapper.fromDtoToEntity(r))),
      retry(2),
      catchError(this.handleError)
    );
  }
}
