import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Ripple } from 'primeng/ripple';
import {BreadcrumbComponent, BreadcrumbItem} from '../../../../shared/ui/breadcrumb/breadcrumb.component';
import {ConfirmationModalComponent} from '../../../../shared/ui/confirmation-modal/confirmation-modal.component';
import {LocationDetailStore} from '../../model/store/location-detail.store';
import {LocationService} from '../../../../entities/location';
import {firstValueFrom} from 'rxjs';

@Component({
  selector: 'app-location-detail',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbComponent,
    ConfirmationModalComponent,
    Ripple
  ],
  providers: [LocationDetailStore],
  templateUrl: './location-detail.page.html'
})
export class LocationDetailPage implements OnInit, OnDestroy {
  readonly store = inject(LocationDetailStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly locationService = inject(LocationService);

  // UI State
  readonly showDeleteModal = signal(false);
  readonly isDeleting = signal(false);

  clientId: string | null = null;
  plantId: string | null = null;
  areaId: string | null = null;
  locationId: string | null = null;

  ngOnInit(): void {
    this.clientId = this.route.snapshot.paramMap.get('clientId');
    this.plantId = this.route.snapshot.paramMap.get('plantId');
    this.areaId = this.route.snapshot.paramMap.get('areaId');
    this.locationId = this.route.snapshot.paramMap.get('locationId');

    if (this.clientId && this.plantId && this.areaId && this.locationId) {
      this.store.loadLocationDetail(this.clientId, this.plantId, this.areaId, this.locationId);
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
      {
        label: this.store.area()?.name || 'Área',
        route: `/clients/${this.clientId}/plants/${this.plantId}/areas/${this.areaId}`
      },
      { label: this.store.location()?.name || 'Ubicación', isActive: true }
    ];
  }

  onBackToArea(): void {
    if (this.clientId && this.plantId && this.areaId) {
      this.router.navigate(['/clients', this.clientId, 'plants', this.plantId, 'areas', this.areaId]).then();
    }
  }

  onEditLocation(): void {
    if (this.clientId && this.plantId && this.areaId && this.locationId) {
      this.router.navigate([
        '/clients', this.clientId,
        'plants', this.plantId,
        'areas', this.areaId,
        'locations', this.locationId,
        'edit'
      ]).then();
    }
  }

  onDeleteLocationClick(): void {
    this.showDeleteModal.set(true);
  }

  async confirmDeleteLocation(): Promise<void> {
    const location = this.store.location();
    if (!location) return;

    this.isDeleting.set(true);

    try {
      await firstValueFrom(this.locationService.delete(location.id));

      // Navegar de vuelta al área
      this.closeDeleteModal();
      this.router.navigate(['/clients', this.clientId, 'plants', this.plantId, 'areas', this.areaId]).then();
    } catch (error: any) {
      console.error('❌ Error deleting location:', error);
      alert('Error al eliminar la ubicación. Por favor intenta de nuevo.');
    } finally {
      this.isDeleting.set(false);
    }
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.isDeleting.set(false);
  }

  onRefresh(): void {
    if (this.clientId && this.plantId && this.areaId && this.locationId) {
      this.store.loadLocationDetail(this.clientId, this.plantId, this.areaId, this.locationId);
    }
  }
}
