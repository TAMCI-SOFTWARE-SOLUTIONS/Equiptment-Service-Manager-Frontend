import {Component, EventEmitter, inject, Input, OnInit, Output} from '@angular/core';
import {ClientEntity} from '../../../../entities/client/model';
import {FileService} from '../../../../entities/file/api/file.service';
import {Card} from 'primeng/card';

@Component({
  selector: 'app-client-with-banner-item',
  imports: [
    Card
  ],
  templateUrl: './client-with-banner-item.component.html',
  standalone: true,
  styleUrl: './client-with-banner-item.component.css'
})
export class ClientWithBannerItemComponent implements OnInit{
  readonly fileService = inject(FileService);

  @Input() client!: ClientEntity;
  imageUrl: string | null = null;

  @Output() selectClient: EventEmitter<ClientEntity> = new EventEmitter();

  ngOnInit(): void {
    this.loadImage();
  }

  private loadImage() {
    if (!this.client.bannerFileId) {
      console.warn('No bannerFileId for client:', this.client);
      this.imageUrl = null;
      return;
    }
    this.fileService.viewFileAsUrl(this.client.bannerFileId).subscribe({
      next: (url: string) => {
        this.imageUrl = url;
      },
      error: (error: any) => {
        console.error('Error cargando imagen:', error);
        this.imageUrl = null;
      }
    });
  }

  protected onSelectClient() {
    this.selectClient.emit(this.client);
  }
}
