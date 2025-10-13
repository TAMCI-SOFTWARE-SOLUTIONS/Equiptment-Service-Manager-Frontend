import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Ripple } from 'primeng/ripple';
import {CabinetTypesStore} from '../../modal/stores/cabinet-types.store';
import {CabinetTypeEntity} from '../../../../entities/cabinet-type/model';

@Component({
  selector: 'app-cabinet-types',
  standalone: true,
  imports: [CommonModule, FormsModule, Ripple],
  templateUrl: './cabinet-types.page.html'
})
export class CabinetTypesPage implements OnInit {
  readonly store = inject(CabinetTypesStore);
  private readonly router = inject(Router);

  // UI state para modal de confirmación
  readonly showDeleteModal = signal(false);
  readonly cabinetTypeToDelete = signal<CabinetTypeEntity | null>(null);

  ngOnInit(): void {
    this.store.loadCabinetTypes();
  }

  onSearchChange(value: string): void {
    this.store.setSearchQuery(value);
  }

  clearSearch(): void {
    this.store.clearSearch();
  }

  onRefresh(): void {
    this.store.loadCabinetTypes();
  }

  onEdit(cabinetType: CabinetTypeEntity): void {
    this.router.navigate(['/cabinet-types', cabinetType.id, 'edit']).then(() => {});
  }

  onDeleteClick(cabinetType: CabinetTypeEntity): void {
    this.cabinetTypeToDelete.set(cabinetType);
    this.showDeleteModal.set(true);
  }

  confirmDelete(): void {
    const cabinetType = this.cabinetTypeToDelete();
    if (!cabinetType) return;

    // TODO: Llamar al servicio para eliminar
    console.log('Delete confirmed:', cabinetType);

    // Por ahora, solo removemos de la lista
    this.store.removeCabinetType(cabinetType.id);

    // Cerrar modal
    this.closeDeleteModal();
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.cabinetTypeToDelete.set(null);
  }

  onCreateNew(): void {
    this.router.navigate(['/cabinet-types/new']).then(() => {});
  }
}
