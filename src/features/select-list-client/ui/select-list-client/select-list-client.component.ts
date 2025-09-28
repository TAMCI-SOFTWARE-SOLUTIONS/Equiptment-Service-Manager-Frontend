import {Component, inject, OnInit} from '@angular/core';
import {SelectListClientStore} from '../../model';
import {ClientService} from '../../../../entities/client/api/client.service';
import {ClientWithBannerItemComponent} from '../client-with-banner-item/client-with-banner-item.component';
import {Button} from 'primeng/button';
import {Router} from '@angular/router';
import {ClientEntity} from '../../../../entities/client/model';
import {Location, NgClass} from '@angular/common';

@Component({
  selector: 'app-select-list-client',
  imports: [
    ClientWithBannerItemComponent,
    Button,
    NgClass
  ],
  providers: [SelectListClientStore],
  templateUrl: './select-list-client.component.html',
  standalone: true,
  styleUrl: './select-list-client.component.css'
})
export class SelectListClientComponent implements OnInit{
  readonly selectListClientStore = inject(SelectListClientStore);
  readonly clientService = inject(ClientService);
  readonly router = inject(Router);
  private location = inject(Location);

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

  protected onSelectClient($event: ClientEntity) {
    console.log('SelectListClientComponent: client selected', $event);
    this.selectListClientStore.setClientSelected($event);
  }

  protected navigateToProjectList() {
    const clientId = this.selectListClientStore.clientSelectedId();
    if (clientId) {
      this.router.navigate(['/clients', clientId, 'projects']).then(() => {});
    }
  }

  protected goBack() {
    this.location.back();
  }
}
