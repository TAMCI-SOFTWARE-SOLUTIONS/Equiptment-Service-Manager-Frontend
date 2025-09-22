import {Component, Input} from '@angular/core';
import {ClientEntity} from '../../../../entities/client/model';

@Component({
  selector: 'app-client-with-banner-item',
  imports: [],
  templateUrl: './client-with-banner-item.component.html',
  standalone: true,
  styleUrl: './client-with-banner-item.component.css'
})
export class ClientWithBannerItemComponent {
  @Input() client!: ClientEntity;
}
