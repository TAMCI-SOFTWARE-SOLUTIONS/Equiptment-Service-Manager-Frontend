import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Ripple } from 'primeng/ripple';
import {ClientFormStore} from '../../modal/client-form.store';
import {ClientsStore} from '../../../clients/ui/clients/model/clients.store';

@Component({
  selector: 'app-client-new',
  imports: [CommonModule, FormsModule, Ripple],
  standalone: true,
  providers: [ClientFormStore],
  templateUrl: './client-new.page.html'
})
export class ClientNewPage implements OnDestroy {
  readonly formStore = inject(ClientFormStore);
  readonly clientsStore = inject(ClientsStore);
  private readonly router = inject(Router);

  ngOnDestroy(): void {
    // Cleanup: resetear formulario al salir
    this.formStore.resetForm();
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
    this.formStore.clearLogo();
  }

  onClearBanner(): void {
    this.formStore.clearBanner();
  }

  async onSubmit(): Promise<void> {
    const newClient = await this.formStore.submitClient();

    if (newClient) {
      // Agregar cliente al store global
      this.clientsStore.addClient(newClient);

      // Navegar a la lista de clientes
      this.router.navigate(['/clients']);
    }
  }

  onCancel(): void {
    this.formStore.resetForm();
    this.router.navigate(['/clients']);
  }
}
