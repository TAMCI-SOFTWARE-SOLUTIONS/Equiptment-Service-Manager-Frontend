import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Ripple } from 'primeng/ripple';
import {EmptyStateComponent} from '../../../../shared/ui/empty-state/empty-state.component';
import {BreadcrumbComponent, BreadcrumbItem} from '../../../../shared/ui/breadcrumb/breadcrumb.component';
import {ConfirmationModalComponent} from '../../../../shared/ui/confirmation-modal/confirmation-modal.component';
import {LocationCardComponent} from '../location-card/location-card.component';
import {AreaDetailStore} from '../../model/stores/area-detail.store';
import {LocationEntity, LocationService} from '../../../../entities/location';
import {EquipmentTypeEnum} from '../../../../shared/model';
import {firstValueFrom} from 'rxjs';

@Component({
  selector: 'app-area-detail',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbComponent,
    EmptyStateComponent,
    ConfirmationModalComponent,
    LocationCardComponent,
    Ripple
  ],
  providers: [AreaDetailStore],
  templateUrl: './area-detail.page.html'
})
export class AreaDetailPage implements OnInit, OnDestroy {
  readonly store = inject(AreaDetailStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly locationService = inject(LocationService);

  // UI State
  readonly showDeleteModal = signal(false);
  readonly locationToDelete = signal<LocationEntity | null>(null);
  readonly isDeleting = signal(false);

  clientId: string | null = null;
  plantId: string | null = null;
  areaId: string | null = null;

  ngOnInit(): void {
    this.clientId = this.route.snapshot.paramMap.get('clientId');
    this.plantId = this.route.snapshot.paramMap.get('plantId');
    this.areaId = this.route.snapshot.paramMap.get('areaId');

    if (this.clientId && this.plantId && this.areaId) {
      this.store.loadAreaDetail(this.clientId, this.plantId, this.areaId);
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
      {
        label: this.store.plant()?.name || 'Planta',
        route: `/clients/${this.clientId}/plants/${this.plantId}`
      },
      { label: this.store.area()?.name || 'Área', isActive: true }
    ];
  }

  getEquipmentLabel(type: EquipmentTypeEnum): string {
    const labels: Record<EquipmentTypeEnum, string> = {
      [EquipmentTypeEnum.CABINET]: 'Gabinete',
      [EquipmentTypeEnum.PANEL]: 'Panel'
    };
    return labels[type] || type;
  }

  onBackToPlant(): void {
    if (this.clientId && this.plantId) {
      this.router.navigate(['/clients', this.clientId, 'plants', this.plantId]).then(() => {});
    }
  }

  onEditArea(): void {
    if (this.clientId && this.plantId && this.areaId) {
      this.router.navigate(['/clients', this.clientId, 'plants', this.plantId, 'areas', this.areaId, 'edit']).then(() => {});
    }
  }

  onCreateLocation(): void {
    if (this.clientId && this.plantId && this.areaId) {
      this.router.navigate(['/clients', this.clientId, 'plants', this.plantId, 'areas', this.areaId, 'locations', 'new']).then(() => {});
    }
  }

  onViewLocation(location: LocationEntity): void {
    if (this.clientId && this.plantId && this.areaId) {
      this.router.navigate(['/clients', this.clientId, 'plants', this.plantId, 'areas', this.areaId, 'locations', location.id]).then(() => {});
    }
  }

  onEditLocation(location: LocationEntity): void {
    if (this.clientId && this.plantId && this.areaId) {
      this.router.navigate(['/clients', this.clientId, 'plants', this.plantId, 'areas', this.areaId, 'locations', location.id, 'edit']).then(() => {});
    }
  }

  onDeleteLocationClick(location: LocationEntity): void {
    this.locationToDelete.set(location);
    this.showDeleteModal.set(true);
  }

  async confirmDeleteLocation(): Promise<void> {
    const location = this.locationToDelete();
    if (!location) return;

    this.isDeleting.set(true);

    try {
      await firstValueFrom(this.locationService.delete(location.id));

      // Remover de la lista
      this.store.removeLocation(location.id);

      // Cerrar modal
      this.closeDeleteModal();
    } catch (error: any) {
      console.error('❌ Error deleting location:', error);
      alert('Error al eliminar la ubicación. Por favor intenta de nuevo.');
    } finally {
      this.isDeleting.set(false);
    }
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.locationToDelete.set(null);
    this.isDeleting.set(false);
  }

  onRefresh(): void {
    if (this.clientId && this.plantId && this.areaId) {
      this.store.loadAreaDetail(this.clientId, this.plantId, this.areaId);
    }
  }
}
