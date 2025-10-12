import {BaseService} from '../../../shared/api';
import {Injectable} from '@angular/core';
import {catchError, map, Observable, retry} from 'rxjs';
import {ProjectEntity} from '../model/project.entity';
import {ProjectResponseDto} from './project-response.dto';
import {ProjectEntityFromResponseMapper} from './project-entity-from-response.mapper';
import {CreateProjectRequest} from './create-project-request.type';
import {CreateProjectRequestFromEntityMapper} from './create-project-request-from-entity.mapper';
import {UpdateProjectRequest} from './update-project-request.type';
import {UpdateProjectRequestFromEntityMapper} from './update-project-request-from-entity.mapper';

@Injectable({
  providedIn: 'root'
})
export class ProjectService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'projects';
  }

  create(entity: ProjectEntity): Observable<ProjectEntity> {
    const request: CreateProjectRequest = CreateProjectRequestFromEntityMapper.fromEntityToDto(entity);
    return this.http.post<ProjectResponseDto>(this.resourcePath(), request, this.httpOptions).pipe(
      map((response: ProjectResponseDto) => ProjectEntityFromResponseMapper.fromDtoToEntity(response)),
      catchError(this.handleError)
    );
  }

  public getAll(): Observable<ProjectEntity[]> {
    return this.http.get<ProjectResponseDto[]>(this.resourcePath(), this.httpOptions).pipe(
      map((projects: ProjectResponseDto[]) => projects.map(project => ProjectEntityFromResponseMapper.fromDtoToEntity(project))),
      retry(2),
      catchError(this.handleError)
    );
  }

  public getAllByClientId(clientId: string): Observable<ProjectEntity[]> {
    return this.http.get<ProjectResponseDto[]>(`${this.resourcePath()}?clientId=${clientId}`, this.httpOptions).pipe(
      map((projects: ProjectResponseDto[]) => projects.map(project => ProjectEntityFromResponseMapper.fromDtoToEntity(project))),
      retry(2),
      catchError(this.handleError)
    );
  }

  public getById(projectId: string): Observable<ProjectEntity> {
    return this.http.get<ProjectResponseDto>(`${this.resourcePath()}/${projectId}`, this.httpOptions).pipe(
      map((project: ProjectResponseDto) => ProjectEntityFromResponseMapper.fromDtoToEntity(project)),
      retry(2),
      catchError(this.handleError)
    );
  }

  update(projectId: string, entity: ProjectEntity): Observable<ProjectEntity> {
    const request: UpdateProjectRequest = UpdateProjectRequestFromEntityMapper.fromEntityToDto(entity);
    return this.http.put<ProjectResponseDto>(`${this.resourcePath()}/${projectId}`, request, this.httpOptions).pipe(
      map((response: ProjectResponseDto) => ProjectEntityFromResponseMapper.fromDtoToEntity(response)),
      retry(2),
      catchError(this.handleError)
    );
  }

  delete(projectId: string): Observable<void> {
    return this.http.delete<void>(`${this.resourcePath()}/${projectId}`, this.httpOptions).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
}
