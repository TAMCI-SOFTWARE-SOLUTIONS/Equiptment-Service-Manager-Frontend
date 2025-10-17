import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Ripple } from 'primeng/ripple';
import {ConfirmationModalComponent} from '../../../../shared/ui/confirmation-modal/confirmation-modal.component';
import {EquipmentDetailStore} from '../../model/equipment-detail.store';
import {
  EquipmentTypeEnum,
  getEquipmentTypeEmoji,
  getEquipmentTypeLabel
} from '../../../../entities/equipment/model/equipment-type.enum';
import {
  getEquipmentStatusColor,
  getEquipmentStatusLabel
} from '../../../../entities/equipment/model/equipment-status.enum';

@Component({
  selector: 'app-equipment-detail',
  standalone: true,
  imports: [
    CommonModule,
    ConfirmationModalComponent,
    Ripple
  ],
  providers: [EquipmentDetailStore],
  templateUrl: './equipment-detail.page.html'
})
export class EquipmentDetailPage implements OnInit, OnDestroy {
  readonly store = inject(EquipmentDetailStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // UI State
  readonly showDeleteModal = signal(false);

  // Expose enums and helpers to the template
  readonly EquipmentTypeEnum = EquipmentTypeEnum;
  //readonly EquipmentStatusEnum = EquipmentStatusEnum;

  ngOnInit(): void {
    const equipmentId = this.route.snapshot.paramMap.get('id');
    const urlPath = this.route.snapshot.url.map(segment => segment.path);
    let type: EquipmentTypeEnum;
    if (urlPath.includes('panel')) {
      type = EquipmentTypeEnum.PANEL;
    } else if (urlPath.includes('cabinet')) {
      type = EquipmentTypeEnum.CABINET;
    } else {
      this.router.navigate(['/equipments']).then();
      return;
    }

    if (equipmentId) {
      this.store.loadEquipment(equipmentId, type);
    } else {
      this.router.navigate(['/equipments']).then();
    }
  }

  ngOnDestroy(): void {
    this.store.reset();
  }

  // ==================== ACTIONS ====================

  onBack(): void {
    this.router.navigate(['/equipments']).then();
  }

  onEdit(): void {
    const equipment = this.store.equipment();
    if (!equipment) return;

    const type = equipment.type === EquipmentTypeEnum.CABINET ? 'cabinet' : 'panel';
    this.router.navigate(['/equipments', type, equipment.id, 'edit']).then();
  }

  onDeleteClick(): void {
    this.showDeleteModal.set(true);
  }

  async confirmDelete(): Promise<void> {
    const success = await this.store.deleteEquipment();

    if (success) {
      this.closeDeleteModal();
      this.router.navigate(['/equipments']).then();
    }
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
  }

  onRefresh(): void {
    const equipment = this.store.equipment();
    if (!equipment) return;

    this.store.loadEquipment(equipment.id, equipment.type);
  }

  // ==================== HELPERS ====================

  //getEquipmentTypeLabel = getEquipmentTypeLabel;
  getEquipmentTypeEmoji = getEquipmentTypeEmoji;
  getEquipmentStatusLabel = getEquipmentStatusLabel;
  getEquipmentStatusColor = getEquipmentStatusColor;

  getDeleteModalMessage(): string {
    const equipment = this.store.equipment();
    if (!equipment) return '';

    const typeLabel = getEquipmentTypeLabel(equipment.type);
    return `${typeLabel}: ${equipment.tag}`;
  }

  formatDate(date: Date | null): string {
    if (!date) return 'Sin registro';

    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTimeSince(date: Date | null): string {
    if (!date) return '';

    const now = new Date();
    const dateObj = new Date(date);
    const diffMs = now.getTime() - dateObj.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Hace 1 día';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
    return `Hace ${Math.floor(diffDays / 365)} años`;
  }
}
