import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FileService} from '../../../../entities/file/api/file.service';
import {ProjectWithClient} from '../../model/projects.store';

@Component({
  selector: 'app-project-banner',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './project-banner.html',
  styleUrl: './project-banner.css'
})
export class ProjectBanner implements OnInit, OnDestroy {
  readonly fileService = inject(FileService);

  @Input() project!: ProjectWithClient;
  imageUrl: string | null = null;
  isLoading = false;

  ngOnInit(): void {
    this.loadImage();
  }

  ngOnDestroy(): void {
    // Liberar la URL del blob para evitar memory leaks
    if (this.imageUrl) {
      URL.revokeObjectURL(this.imageUrl);
    }
  }

  private loadImage() {
    if (!this.project.bannerId) {
      console.warn('No bannerId for project:', this.project);
      this.imageUrl = null;
      return;
    }

    this.isLoading = true;
    this.fileService.viewFileAsUrl(this.project.bannerId).subscribe({
      next: (url: string) => {
        // Liberar la URL anterior si existe
        if (this.imageUrl) {
          URL.revokeObjectURL(this.imageUrl);
        }
        this.imageUrl = url;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error cargando imagen del proyecto:', error);
        this.imageUrl = null;
        this.isLoading = false;
      }
    });
  }
}
