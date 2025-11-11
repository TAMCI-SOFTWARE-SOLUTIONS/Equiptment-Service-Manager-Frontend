import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {Ripple} from 'primeng/ripple';
import {BreadcrumbComponent, BreadcrumbItem} from '../../../../shared/ui/breadcrumb/breadcrumb.component';
import {EmptyStateComponent} from '../../../../shared/ui/empty-state/empty-state.component';
import {PlantCardComponent} from '../plant-card/plant-card.component';
import {ClientDetailStore} from '../../model/client-detail.store';
import {PlantEntity} from '../../../../entities/plant';
import {
  PageHeaderAction,
  PageHeaderComponent,
  PageHeaderMoreAction
} from '../../../../shared/ui/page-header/page-header.component';
import {AuthStore} from '../../../../shared/stores';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbComponent,
    EmptyStateComponent,
    PlantCardComponent,
    Ripple,
    PageHeaderComponent
  ],
  providers: [ClientDetailStore],
  templateUrl: './client-detail.page.html'
})
export class ClientDetailPage implements OnInit, OnDestroy {
  readonly authStore = inject(AuthStore);
  readonly store = inject(ClientDetailStore);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly showDeleteModal = signal(false);
  readonly plantToDelete = signal<PlantEntity | null>(null);
  readonly isDeleting = signal(false);

  clientId: string | null = null;

  headerActions: PageHeaderAction[] = [
    {
      id: 'edit',
      label: 'Editar Cliente',
      mobileLabel: 'Editar',
      icon: 'pi-pencil',
      variant: 'primary',
      visible: this.canEditClient(),
      showInMobile: true,
      onClick: () => this.onEditClient()
    }
  ];

  moreActions: PageHeaderMoreAction[] = [
    {
      label: 'Desactivar Cliente',
      icon: 'pi pi-ban',
      visible: this.canDeactivate(),
      styleClass: 'text-orange-600',
      command: () => this.onDeactivate()
    }
  ];

  ngOnInit(): void {
    this.clientId = this.route.snapshot.paramMap.get('clientId');
    if (this.clientId) {
      this.store.loadClientDetail(this.clientId);
    }
  }

  ngOnDestroy(): void {
    this.store.reset();
  }

  private canEditClient(): boolean {
    return this.authStore.isAdmin();
  }

  private canDeactivate(): boolean {
    // TODO: Implement logic to check if client can be deactivated
    return false;
  }

  onDeactivate(): void {
    // TODO: Implement logic to deactivate client
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

  onRefresh(): void {
    if (this.clientId) {
      this.store.loadClientDetail(this.clientId);
    }
  }
}
