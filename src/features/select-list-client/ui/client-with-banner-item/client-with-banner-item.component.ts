import {Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ClientEntity} from '../../../../entities/client/model';
import {FileService} from '../../../../entities/file/api/file.service';

@Component({
  selector: 'app-client-with-banner-item',
  imports: [],
  templateUrl: './client-with-banner-item.component.html',
  standalone: true,
  styleUrl: './client-with-banner-item.component.css'
})
export class ClientWithBannerItemComponent implements OnInit, OnDestroy {
  readonly fileService = inject(FileService);

  @Input() client!: ClientEntity;
  imageUrl: string | null = null;
  isLoading = false;

  @Output() selectClient: EventEmitter<ClientEntity> = new EventEmitter();

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
    if (!this.client.bannerFileId) {
      console.warn('No bannerFileId for client:', this.client);
      this.imageUrl = null;
      return;
    }

    this.isLoading = true;
    this.fileService.viewFileAsUrl(this.client.bannerFileId).subscribe({
      next: (url: string) => {
        // Liberar la URL anterior si existe
        if (this.imageUrl) {
          URL.revokeObjectURL(this.imageUrl);
        }
        this.imageUrl = url;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error cargando imagen del cliente:', error);
        this.imageUrl = null;
        this.isLoading = false;
      }
    });
  }

  protected onSelectClient() {
    this.selectClient.emit(this.client);
  }
}
