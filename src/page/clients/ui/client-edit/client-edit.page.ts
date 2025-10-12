import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Ripple } from 'primeng/ripple';
import {ClientFormStore, ClientsStore} from '../../model';

@Component({
  selector: 'app-client-edit',
  imports: [CommonModule, FormsModule, Ripple],
  standalone: true,
  providers: [ClientFormStore],
  templateUrl: './client-edit.page.html'
})
export class ClientEditPage implements OnInit, OnDestroy {
  readonly formStore = inject(ClientFormStore);
  readonly clientsStore = inject(ClientsStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly clientId = signal<string | null>(null);
  readonly isLoadingClient = signal(false);
  readonly loadError = signal<string | null>(null);

  readonly pageTitle = computed(() => {
    const client = this.clientsStore.selectedClient();
    return client ? `Editar ${client.name}` : 'Editar Cliente';
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('clientId');

    if (!id) {
      this.router.navigate(['/clients']).then(() => {});
      return;
    }

    this.clientId.set(id);
    this.loadClient(id).then(() => {});
  }

  ngOnDestroy(): void {
    this.formStore.resetForm();
    this.clientsStore.clearSelection();
  }

  /**
   * Cargar datos del cliente
   */
  private async loadClient(id: string): Promise<void> {
    this.isLoadingClient.set(true);
    this.loadError.set(null);

    // Seleccionar cliente en el store
    this.clientsStore.selectClient(id);

    // Esperar a que el cliente esté disponible
    const client = this.clientsStore.selectedClient();

    if (!client) {
      this.loadError.set('Cliente no encontrado');
      this.isLoadingClient.set(false);
      return;
    }

    // Cargar datos en el formulario
    await this.formStore.loadClientData({
      id: client.id,
      name: client.name,
      logoFileId: client.logoFileId,
      bannerFileId: client.bannerFileId,
      logoUrl: client.logoUrl,
      bannerUrl: client.bannerUrl
    });

    this.isLoadingClient.set(false);
  }

  onNameChange(value: string): void {
    this.formStore.setName(value);
  }

  onLogoSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    this.formStore.setLogoFile(file);
  }

  onBannerSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    this.formStore.setBannerFile(file);
  }

  onClearLogo(): void {
    if (confirm('¿Estás seguro de que deseas eliminar el logo?')) {
      this.formStore.clearLogo();
    }
  }

  onClearBanner(): void {
    if (confirm('¿Estás seguro de que deseas eliminar el banner?')) {
      this.formStore.clearBanner();
    }
  }

  async onSubmit(): Promise<void> {
    const clientId = this.clientId();
    if (!clientId) return;

    const updatedClient = await this.formStore.updateClient(clientId);

    if (updatedClient) {
      // Actualizar cliente en el store global
      this.clientsStore.updateClient(updatedClient);

      // Navegar a la lista de clientes
      this.router.navigate(['/clients']).then(() => {});
    }
  }

  onCancel(): void {
    this.formStore.resetForm();
    this.router.navigate(['/clients']).then(() => {});
  }

  onDelete(): void {
    const client = this.clientsStore.selectedClient();
    if (!client) return;

    const confirmed = confirm(
      `¿Estás seguro de que deseas eliminar el cliente "${client.name}"?\n\nEsta acción no se puede deshacer.`
    );

    if (confirmed) {
      this.deleteClient().then(() => {});
    }
  }

  private async deleteClient(): Promise<void> {
    const clientId = this.clientId();
    if (!clientId) return;

    // TODO: Implementar método delete en el store
    // await this.clientsStore.deleteClient(clientId);

    console.log('Delete client:', clientId);
    this.router.navigate(['/clients']).then(() => {});
  }
}
