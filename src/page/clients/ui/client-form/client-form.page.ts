import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Ripple } from 'primeng/ripple';
import {ClientFormStore, ClientsStore} from '../../model';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, FormsModule, Ripple],
  providers: [ClientFormStore],
  templateUrl: './client-form.page.html'
})
export class ClientFormPage implements OnInit, OnDestroy {
  readonly store = inject(ClientFormStore);
  readonly clientsStore = inject(ClientsStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('clientId');

    if (id && id !== 'new') {
      this.store.initializeForEdit(id);
    } else {
      this.store.initializeForCreate();
    }
  }

  ngOnDestroy(): void {
    this.store.reset();
  }

  onNameChange(value: string): void {
    this.store.setName(value);
  }

  onLogoSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    this.store.setLogoFile(file);
  }

  onBannerSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    this.store.setBannerFile(file);
  }

  onClearLogo(): void {
    if (confirm('¿Eliminar el logo actual?')) {
      this.store.clearLogo();
    }
  }

  onClearBanner(): void {
    if (confirm('¿Eliminar el banner actual?')) {
      this.store.clearBanner();
    }
  }

  async onSubmit(): Promise<void> {
    const result = await this.store.submit();

    if (result) {
      if (this.store.isEditing()) {
        this.clientsStore.updateClient(result);
      } else {
        this.clientsStore.addClient(result);
      }

      this.router.navigate(['/clients']).then(() => {});
    }
  }

  onCancel(): void {
    this.store.reset();
    this.router.navigate(['/clients']).then(() => {});
  }
}
