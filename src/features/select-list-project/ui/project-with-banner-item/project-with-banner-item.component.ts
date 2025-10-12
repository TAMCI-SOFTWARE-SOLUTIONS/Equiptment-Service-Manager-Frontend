import {Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FileService} from '../../../../entities/file/api/file.service';
import {ProjectEntity} from '../../../../entities/project/model/project.entity';

@Component({
  selector: 'app-project-with-banner-item',
  imports: [],
  templateUrl: './project-with-banner-item.component.html',
  standalone: true,
  styleUrl: './project-with-banner-item.component.css'
})
export class ProjectWithBannerItemComponent implements OnInit, OnDestroy {
  readonly fileService = inject(FileService);

  @Input() project!: ProjectEntity;
  imageUrl: string | null = null;
  isLoading = false;

  @Output() selectProject: EventEmitter<ProjectEntity> = new EventEmitter();

  ngOnInit(): void {
    console.log(this.project);
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

  protected onSelectProject() {
    this.selectProject.emit(this.project);
  }
}
