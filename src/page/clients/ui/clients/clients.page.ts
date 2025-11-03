import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ClientsStore } from '../../model';
import { Ripple } from 'primeng/ripple';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-clients',
  imports: [CommonModule, Ripple, FormsModule],
  standalone: true,
  providers: [ClientsStore],
  templateUrl: './clients.page.html'
})
export class ClientsPage implements OnInit, OnDestroy {
  readonly store = inject(ClientsStore);
  private readonly router = inject(Router);

  // UI state - SOLO estado de UI
  readonly searchQuery = signal('');

  // Computed - Clientes filtrados (usa clientsWithImages del store)
  readonly filteredClients = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const clients = this.store.clientsWithImages();

    if (!query) return clients;

    return clients.filter(client =>
      client.name.toLowerCase().includes(query)
    );
  });

  ngOnInit(): void {
    this.loadClients();
  }

  ngOnDestroy(): void {
    // Cleanup: Liberar URLs de objetos blob
    this.store.cleanupImageUrls();
  }

  loadClients(): void {
    this.store.loadClients();
  }

  onClientSelect(clientId: string): void {
    this.store.selectClient(clientId);
    this.router.navigate(['/clients', clientId]).then(() => {});
  }

  onCreateClient(): void {
    this.router.navigate(['/clients/new']).then(() => {});
  }

  onEditClient(clientId: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/clients', clientId, 'edit']).then(() => {});
  }

  onRefresh(): void {
    this.searchQuery.set('');
    this.store.loadClients();
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }
}
