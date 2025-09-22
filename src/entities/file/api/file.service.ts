import { Injectable } from '@angular/core';
import { Observable, map, retry, catchError, throwError, of } from 'rxjs';
import { BaseService } from '../../../shared/api';
import {FileEntity} from '../model/file.entity';
import {FileResponseDto} from './file-response.dto';
import {FileEntityFromResponseMapper} from './file-entity-from-response.mapper';

@Injectable({
  providedIn: 'root'
})
export class FileService extends BaseService {
  constructor() {
    super();
    this.resourceEndpoint = 'files';
  }

  upload(file: File): Observable<FileEntity> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<FileResponseDto>(`${this.resourcePath()}/upload`, formData).pipe(
      map(response => FileEntityFromResponseMapper.fromDtoToEntity(response)),
      retry(1),
      catchError(this.handleFileError.bind(this))
    );
  }

  viewFile(fileId: string): Observable<Blob> {
    return this.http.get(`${this.resourcePath()}/view/${fileId}`, {
      responseType: 'blob'
    }).pipe(
      retry(2),
      catchError(this.handleFileError.bind(this))
    );
  }

  viewFileAsUrl(fileId: string): Observable<string> {
    return this.viewFile(fileId).pipe(
      map(blob => URL.createObjectURL(blob))
    );
  }

  downloadFile(fileId: string): Observable<Blob> {
    return this.http.get(`${this.resourcePath()}/download/${fileId}`, {
      responseType: 'blob'
    }).pipe(
      retry(2),
      catchError(this.handleFileError.bind(this))
    );
  }

  downloadAndSaveFile(fileId: string, customFilename?: string): Observable<void> {
    return this.downloadFile(fileId).pipe(
      map((blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = customFilename || `file-${fileId}`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
    );
  }

  fileExists(fileId: string): Observable<boolean> {
    return this.http.head(`${this.resourcePath()}/view/${fileId}`, {
      observe: 'response',
      responseType: 'blob'
    }).pipe(
      map(response => response.status === 200),
      catchError(() => of(false))
    );
  }

  private handleFileError(error: any): Observable<never> {
    let errorMessage = 'Error desconocido con el archivo';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400:
          errorMessage = 'Archivo inválido o datos incorrectos';
          break;
        case 404:
          errorMessage = 'Archivo no encontrado';
          break;
        case 413:
          errorMessage = 'El archivo es demasiado grande';
          break;
        case 415:
          errorMessage = 'Tipo de archivo no soportado';
          break;
        case 422:
          errorMessage = 'El archivo no cumple con los requisitos';
          break;
        case 507:
          errorMessage = 'No hay suficiente espacio de almacenamiento';
          break;
        default:
          // Usar el manejo de errores del BaseService para otros casos
          return this.handleError(error);
      }
    }

    console.error('FileService Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
