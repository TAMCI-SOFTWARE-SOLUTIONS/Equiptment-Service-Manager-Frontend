import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Ripple } from 'primeng/ripple';
import {EmptyStateComponent} from '../../../../shared/ui/empty-state/empty-state.component';
import {BreadcrumbComponent, BreadcrumbItem} from '../../../../shared/ui/breadcrumb/breadcrumb.component';
import {ConfirmationModalComponent} from '../../../../shared/ui/confirmation-modal/confirmation-modal.component';
import {AreaCardComponent} from '../area-card/area-card.component';
import {PlantDetailStore} from '../../model/stores/plant-detail.store';
import {AreaService} from '../../../../entities/area/api';
import {AreaEntity} from '../../../../entities/area/model';
import {firstValueFrom} from 'rxjs';

@Component({
  selector: 'app-plant-detail',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbComponent,
    EmptyStateComponent,
    ConfirmationModalComponent,
    AreaCardComponent,
    Ripple
  ],
  providers: [PlantDetailStore],
  templateUrl: './plant-detail.page.html'
})
export class PlantDetailPage implements OnInit, OnDestroy {
  readonly store = inject(PlantDetailStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly areaService = inject(AreaService);

  // UI State
  readonly showDeleteModal = signal(false);
  readonly areaToDelete = signal<AreaEntity | null>(null);
  readonly isDeleting = signal(false);

  clientId: string | null = null;
  plantId: string | null = null;

  ngOnInit(): void {
    this.clientId = this.route.snapshot.paramMap.get('clientId');
    this.plantId = this.route.snapshot.paramMap.get('plantId');

    if (this.clientId && this.plantId) {
      this.store.loadPlantDetail(this.clientId, this.plantId);
    }
  }

  ngOnDestroy(): void {
    this.store.reset();
  }

  get breadcrumbItems(): BreadcrumbItem[] {
    return [
      { label: 'Clientes', route: '/clients' },
      {
        label: this.store.client()?.name || 'Cliente',
        route: `/clients/${this.clientId}`
      },
      { label: this.store.plant()?.name || 'Planta', isActive: true }
    ];
  }

  onBackToClient(): void {
    if (this.clientId) {
      this.router.navigate(['/clients', this.clientId]).then(() => {});
    }
  }

  onEditPlant(): void {
    if (this.clientId && this.plantId) {
      this.router.navigate(['/clients', this.clientId, 'plants', this.plantId, 'edit']).then(() => {});
    }
  }

  onCreateArea(): void {
    if (this.clientId && this.plantId) {
      this.router.navigate(['/clients', this.clientId, 'plants', this.plantId, 'areas', 'new']).then(() => {});
    }
  }

  onViewArea(area: AreaEntity): void {
    if (this.clientId && this.plantId) {
      this.router.navigate(['/clients', this.clientId, 'plants', this.plantId, 'areas', area.id]).then(() => {});
    }
  }

  onEditArea(area: AreaEntity): void {
    if (this.clientId && this.plantId) {
      this.router.navigate(['/clients', this.clientId, 'plants', this.plantId, 'areas', area.id, 'edit']).then(() => {});
    }
  }

  onDeleteAreaClick(area: AreaEntity): void {
    this.areaToDelete.set(area);
    this.showDeleteModal.set(true);
  }

  async confirmDeleteArea(): Promise<void> {
    const area = this.areaToDelete();
    if (!area) return;

    this.isDeleting.set(true);

    try {
      await firstValueFrom(this.areaService.delete(area.id));

      // Remover de la lista
      this.store.removeArea(area.id);

      // Cerrar modal
      this.closeDeleteModal();
    } catch (error: any) {
      console.error('❌ Error deleting area:', error);
      alert('Error al eliminar el área. Por favor intenta de nuevo.');
    } finally {
      this.isDeleting.set(false);
    }
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.areaToDelete.set(null);
    this.isDeleting.set(false);
  }

  onRefresh(): void {
    if (this.clientId && this.plantId) {
      this.store.loadPlantDetail(this.clientId, this.plantId);
    }
  }
}
