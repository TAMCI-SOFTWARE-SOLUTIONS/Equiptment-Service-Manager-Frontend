import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { EvidenceFile } from '../../model/interfaces/evidence-file.interface';
import { FileEntity } from '../../../../entities/file/model/file.entity';

@Component({
  selector: 'app-report-uploader',
  standalone: true,
  imports: [CommonModule, ButtonModule, ProgressSpinnerModule, TooltipModule],
  templateUrl: './report-uploader.component.html'
})
export class ReportUploaderComponent {
  @Input() label: string = 'Reporte PDF';
  @Input() file: EvidenceFile | null = null;
  @Input() isLoading: boolean = false;
  @Input() uploadType!: 'report';

  @Output() onUpload = new EventEmitter<File>();
  @Output() onRemove = new EventEmitter<void>();
  @Output() onPreview = new EventEmitter<FileEntity>();
  // Sin @Output() onOpenCamera

  get canShowUpload(): boolean {
    return !this.file;
  }

  onFileSelect(event: any): void {
    const file = event.target.files[0] as File;
    if (file) {
      this.onUpload.emit(file);
    }
    event.target.value = null;
  }

  preview(): void {
    if (this.file) {
      this.onPreview.emit(this.file.fileEntity);
    }
  }

  remove(): void {
    this.onRemove.emit();
  }

  formatSize(bytes: number): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
