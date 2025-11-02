import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { EvidenceFile } from '../../model/interfaces/evidence-file.interface';
import { FileEntity } from '../../../../entities/file/model/file.entity';

@Component({
  selector: 'app-photo-uploader',
  standalone: true,
  imports: [CommonModule, ButtonModule, ProgressSpinnerModule, TooltipModule],
  templateUrl: './photo-uploader.component.html'
})
export class PhotoUploaderComponent {
  @Input() label: string = 'Fotos';
  @Input() files: EvidenceFile[] = [];
  @Input() isLoading: boolean = false;
  @Input() maxFiles: number = 3;
  @Input() uploadType!: 'startPhoto' | 'midPhoto' | 'endPhoto';

  @Output() onUpload = new EventEmitter<File>();
  @Output() onRemove = new EventEmitter<string>(); // Emite fileId
  @Output() onPreview = new EventEmitter<FileEntity>();
  @Output() onOpenCamera = new EventEmitter<string>(); // Emite uploadType

  get canShowUpload(): boolean {
    return this.files.length < this.maxFiles;
  }

  onFileSelect(event: any): void {
    const files = event.target.files as FileList;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        if (this.files.length + i < this.maxFiles) {
          this.onUpload.emit(files[i]);
        }
      }
    }
    event.target.value = null;
  }

  preview(file: FileEntity): void {
    this.onPreview.emit(file);
  }

  remove(fileId: string): void {
    this.onRemove.emit(fileId);
  }

  formatSize(bytes: number): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
