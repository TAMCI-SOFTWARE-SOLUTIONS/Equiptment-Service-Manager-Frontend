import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filePreview',
  standalone: true
})
export class FilePreviewPipe implements PipeTransform {
  transform(file: File | null): string {
    if (!file) {
      return '';
    }
    return URL.createObjectURL(file);
  }
}
