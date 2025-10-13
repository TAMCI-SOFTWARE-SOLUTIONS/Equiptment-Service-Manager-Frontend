import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PanelTypeEntity } from '../../../../entities/panel-type/model';
import { PanelTypeService } from '../../../../entities/panel-type/api';

@Component({
  selector: 'app-panel-types',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './panel-types.page.html',
  styleUrl: './panel-types.page.css'
})
export class PanelTypesPage implements OnInit {
  readonly panelTypeService = inject(PanelTypeService);

  // Signals para el estado
  readonly panelTypes = signal<PanelTypeEntity[]>([]);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadPanelTypes();
  }

  public loadPanelTypes(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.panelTypeService.getAll().subscribe({
      next: (panelTypes) => {
        this.panelTypes.set(panelTypes);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.error.set('Error al cargar los tipos de panel');
        this.isLoading.set(false);
        console.error('Error loading panel types:', error);
      }
    });
  }

  onEdit(panelType: PanelTypeEntity): void {
    // TODO: Implementar navegación a página de edición
    console.log('Edit panel type:', panelType);
  }

  onDelete(panelType: PanelTypeEntity): void {
    // TODO: Implementar eliminación
    console.log('Delete panel type:', panelType);
  }
}
