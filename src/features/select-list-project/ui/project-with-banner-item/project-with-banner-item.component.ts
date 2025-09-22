import {Component, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import {FileService} from '../../../../entities/file/api/file.service';
import {ProjectEntity} from '../../../../entities/project/model/project.entity';
import {Card} from 'primeng/card';

@Component({
  selector: 'app-project-with-banner-item',
  imports: [
    Card
  ],
  templateUrl: './project-with-banner-item.component.html',
  standalone: true,
  styleUrl: './project-with-banner-item.component.css'
})
export class ProjectWithBannerItemComponent implements OnInit{
  readonly fileService = inject(FileService);

  @Input() project!: ProjectEntity;
  imageUrl: string | null = null;

  @Output() selectProject: EventEmitter<ProjectEntity> = new EventEmitter();

  ngOnInit(): void {
    this.loadImage();
  }

  private loadImage() {
    if (!this.project.bannerId) {
      console.warn('No bannerFileId for client:', this.project);
      this.imageUrl = null;
      return;
    }
    this.fileService.viewFileAsUrl(this.project.bannerId).subscribe({
      next: (url: string) => {
        this.imageUrl = url;
      },
      error: (error: any) => {
        console.error('Error cargando imagen:', error);
        this.imageUrl = null;
      }
    });
  }

  protected onSelectProject() {
    this.selectProject.emit(this.project);
  }
}
