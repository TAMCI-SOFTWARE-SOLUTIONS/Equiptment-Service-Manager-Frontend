import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Ripple } from 'primeng/ripple';
import {BreadcrumbComponent, BreadcrumbItem} from '../../../../shared/ui/breadcrumb/breadcrumb.component';
import {EmptyStateComponent} from '../../../../shared/ui/empty-state/empty-state.component';
import {ConfirmationModalComponent} from '../../../../shared/ui/confirmation-modal/confirmation-modal.component';
import {PlantCardComponent} from '../plant-card/plant-card.component';
import {ClientDetailStore} from '../../model/client-detail.store';
import {PlantEntity, PlantService} from '../../../../entities/plant';
import {firstValueFrom} from 'rxjs';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbComponent,
    EmptyStateComponent,
    ConfirmationModalComponent,
    PlantCardComponent,
    Ripple
  ],
  providers: [ClientDetailStore],
  templateUrl: './client-detail.page.html'
})
export class ClientDetailPage implements OnInit, OnDestroy {
  readonly store = inject(ClientDetailStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly plantService = inject(PlantService);

  // UI State
  readonly showDeleteModal = signal(false);
  readonly plantToDelete = signal<PlantEntity | null>(null);
  readonly isDeleting = signal(false);

  clientId: string | null = null;

  ngOnInit(): void {
    this.clientId = this.route.snapshot.paramMap.get('clientId');
    if (this.clientId) {
      this.store.loadClientDetail(this.clientId);
    }
  }

  ngOnDestroy(): void {
    this.store.reset();
  }

  get breadcrumbItems(): BreadcrumbItem[] {
    return [
      { label: 'Clientes', route: '/clients' },
      { label: this.store.client()?.name || 'Cargando...', isActive: true }
    ];
  }

  onBackToClients(): void {
    this.router.navigate(['/clients']).then(() => {});
  }

  onEditClient(): void {
    if (this.clientId) {
      this.router.navigate(['/clients', this.clientId, 'edit']).then(() => {});
    }
  }

  onCreatePlant(): void {
    if (this.clientId) {
      this.router.navigate(['/clients', this.clientId, 'plants', 'new']).then(() => {});
    }
  }

  onViewPlant(plant: PlantEntity): void {
    if (this.clientId) {
      this.router.navigate(['/clients', this.clientId, 'plants', plant.id]).then(() => {});
    }
  }

  onEditPlant(plant: PlantEntity): void {
    if (this.clientId) {
      this.router.navigate(['/clients', this.clientId, 'plants', plant.id, 'edit']).then(() => {});
    }
  }

  onDeletePlantClick(plant: PlantEntity): void {
    this.plantToDelete.set(plant);
    this.showDeleteModal.set(true);
  }

  async confirmDeletePlant(): Promise<void> {
    const plant = this.plantToDelete();
    if (!plant) return;

    this.isDeleting.set(true);

    try {
      await firstValueFrom(this.plantService.delete(plant.id));

      // Remover de la lista
      this.store.removePlant(plant.id);

      // Cerrar modal
      this.closeDeleteModal();
    } catch (error: any) {
      console.error('❌ Error deleting plant:', error);
      alert('Error al eliminar la planta. Por favor intenta de nuevo.');
    } finally {
      this.isDeleting.set(false);
    }
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.plantToDelete.set(null);
    this.isDeleting.set(false);
  }

  onRefresh(): void {
    if (this.clientId) {
      this.store.loadClientDetail(this.clientId);
    }
  }
}
