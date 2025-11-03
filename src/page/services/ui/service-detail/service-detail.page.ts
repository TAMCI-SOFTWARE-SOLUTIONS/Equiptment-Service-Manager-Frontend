// src/app/pages/service-details/ui/service-details/service-details.page.ts

import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import {DetailsHeroCardComponent} from '../details-hero-card/details-hero-card.component';
import {DetailsStatsCardsComponent} from '../details-stats-cards/details-stats-cards.component';
import {InspectionsAccordionComponent} from '../inspections-accordion/inspections-accordion.component';
import {EvidenceAccordionComponent} from '../evidence-accordion/evidence-accordion.component';
import {LocationAccordionComponent} from '../location-accordion/location-accordion.component';
import {EmptyStateComponent} from '../../../../shared/ui/empty-state/empty-state.component';
import {ServiceDetailsStore} from '../../model/store/service-details.store';
import {InspectableItemTypeEnum} from '../../../../shared/model/enums';
import {FileEntity} from '../../../../entities/file/model/file.entity';

@Component({
  selector: 'app-service-details',
  standalone: true,
  imports: [
    CommonModule,
    DetailsHeroCardComponent,
    DetailsStatsCardsComponent,
    InspectionsAccordionComponent,
    EvidenceAccordionComponent,
    LocationAccordionComponent,
    EmptyStateComponent,
    Toast
  ],
  providers: [
    ServiceDetailsStore,
    MessageService
  ],
  templateUrl: './service-detail.page.html',
  styleUrls: ['./service-detail.page.css']
})
export class ServiceDetailPage implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  readonly store = inject(ServiceDetailsStore);

  // Signal para user role (aquí debes obtenerlo de tu AuthService)
  readonly userRole = signal<string>('OPERATOR'); // TODO: Get from AuthService

  ngOnInit(): void {
    const serviceId = this.route.snapshot.paramMap.get('id');

    if (!serviceId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'ID de servicio no encontrado'
      });
      this.router.navigate(['/services']);
      return;
    }

    this.loadServiceDetails(serviceId);
  }

  ngOnDestroy(): void {
    this.store.reset();
  }

  private async loadServiceDetails(serviceId: string): Promise<void> {
    try {
      await this.store.loadService(serviceId);
    } catch (error: any) {
      console.error('❌ Error loading service details:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Error al cargar los detalles del servicio'
      });
    }
  }

  // ============================================
  // INSPECTIONS HANDLERS
  // ============================================

  onFilterChange(filter: 'all' | 'changes-only'): void {
    this.store.setFilter(filter);
  }

  onCategoryToggle(category: InspectableItemTypeEnum): void {
    this.store.toggleCategory(category);
  }

  onToggleAllCategories(): void {
    const allCategories = Array.from(this.store.itemsByCategory().keys());
    const allOpen = allCategories.every(cat => this.store.isCategoryOpen(cat));

    if (allOpen) {
      // Cerrar todos
      allCategories.forEach(cat => {
        if (this.store.isCategoryOpen(cat)) {
          this.store.toggleCategory(cat);
        }
      });
    } else {
      // Abrir todos
      allCategories.forEach(cat => {
        if (!this.store.isCategoryOpen(cat)) {
          this.store.toggleCategory(cat);
        }
      });
    }
  }

  // ============================================
  // EVIDENCE HANDLERS
  // ============================================

  onVideoPreview(video: FileEntity): void {
    // TODO: Implementar modal de preview de video
    console.log('Preview video:', video);
    this.messageService.add({
      severity: 'info',
      summary: 'Video Preview',
      detail: 'Abriendo video en nueva pestaña...'
    });
    // Aquí puedes abrir un modal o nueva pestaña
  }

  onPhotoClick(photo: FileEntity): void {
    // TODO: Implementar modal de preview de foto
    console.log('Preview photo:', photo);
    this.messageService.add({
      severity: 'info',
      summary: 'Photo Preview',
      detail: 'Abriendo foto en modal...'
    });
    // Aquí puedes abrir un modal con la imagen
  }

  async onReportUpload(file: File): Promise<void> {
    const success = await this.store.uploadReport(file);

    if (success) {
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Reporte cargado correctamente'
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: this.store.error() || 'Error al cargar el reporte'
      });
    }
  }

  async onReportRemove(): Promise<void> {
    // Confirmación
    const confirmed = confirm('¿Estás seguro de eliminar el reporte?');
    if (!confirmed) return;

    const success = await this.store.removeReport();

    if (success) {
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Reporte eliminado correctamente'
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: this.store.error() || 'Error al eliminar el reporte'
      });
    }
  }

  // ============================================
  // NAVIGATION
  // ============================================

  onBack(): void {
    this.router.navigate(['/services/active']).then();
  }
}
