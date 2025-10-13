import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CabinetTypeEntity } from '../../../../entities/cabinet-type/model';
import { CabinetTypeService } from '../../../../entities/cabinet-type/api';

@Component({
  selector: 'app-cabinet-types',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cabinet-types.page.html',
  styleUrl: './cabinet-types.page.css'
})
export class CabinetTypesPage implements OnInit {
  readonly cabinetTypeService = inject(CabinetTypeService);

  // Signals para el estado
  readonly cabinetTypes = signal<CabinetTypeEntity[]>([]);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadCabinetTypes();
  }

  public loadCabinetTypes(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.cabinetTypeService.getAll().subscribe({
      next: (cabinetTypes) => {
        this.cabinetTypes.set(cabinetTypes);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.error.set('Error al cargar los tipos de gabinete');
        this.isLoading.set(false);
        console.error('Error loading cabinet types:', error);
      }
    });
  }

  onEdit(cabinetType: CabinetTypeEntity): void {
    // TODO: Implementar navegación a página de edición
    console.log('Edit cabinet type:', cabinetType);
  }

  onDelete(cabinetType: CabinetTypeEntity): void {
    // TODO: Implementar eliminación
    console.log('Delete cabinet type:', cabinetType);
  }
}
