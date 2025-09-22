import {BaseService} from '../../../shared/api';
import {Injectable} from '@angular/core';
import {catchError, map, Observable, retry} from 'rxjs';
import {ProjectEntity} from '../model/project.entity';
import {ProjectResponseDto} from './project-response.dto';
import {ProjectEntityFromResponseMapper} from './project-entity-from-response.mapper';

@Injectable({
  providedIn: 'root'
})
export class ProjectService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'projects';
  }

  public getAllByClientId(clientId: string): Observable<ProjectEntity[]> {
    return this.http.get<ProjectResponseDto[]>(`${this.resourcePath()}?clientId=${clientId}`, this.httpOptions).pipe(
      map((projects: ProjectResponseDto[]) => projects.map(project => ProjectEntityFromResponseMapper.fromDtoToEntity(project))),
      retry(2),
      catchError(this.handleError)
    );
  }
}
