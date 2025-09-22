import {Component, inject, OnInit} from '@angular/core';
import {SelectListClientStore} from '../../model';
import {ClientService} from '../../../../entities/client/api/client.service';
import {ClientWithBannerItemComponent} from '../client-with-banner-item/client-with-banner-item.component';
import {Button} from 'primeng/button';

@Component({
  selector: 'app-select-list-client',
  imports: [
    ClientWithBannerItemComponent,
    Button
  ],
  providers: [SelectListClientStore],
  templateUrl: './select-list-client.component.html',
  standalone: true,
  styleUrl: './select-list-client.component.css'
})
export class SelectListClientComponent implements OnInit{
  readonly selectListClientStore = inject(SelectListClientStore);
  readonly clientService = inject(ClientService);

  ngOnInit(): void {
    this.getAllClients();
  }

  private getAllClients() {
    this.selectListClientStore.activateLoading();
    this.selectListClientStore.setError(null);

    this.clientService.getAll().subscribe({
      next: (clients) => {
        console.log('SelectListClientComponent: fetched clients', clients);
        this.selectListClientStore.setClients(clients);
      },
      error: (error) => {
        this.selectListClientStore.setError('Error loading clients');
        console.error('SelectListClientComponent: error fetching clients', error);
      }
    });
  }
}
