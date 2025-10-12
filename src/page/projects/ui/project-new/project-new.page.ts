import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProjectFormStore } from '../../model/project-form.store';
import { ProjectsStore } from '../../model/projects.store';
import { EquipmentTypeEnum } from '../../../../shared/model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-project-new',
  imports: [CommonModule, FormsModule],
  standalone: true,
  providers: [ProjectFormStore],
  templateUrl: './project-new.page.html'
})
export class ProjectNewPage implements OnInit, OnDestroy {
  readonly formStore = inject(ProjectFormStore);
  readonly projectsStore = inject(ProjectsStore);
  private readonly router = inject(Router);

  // Estado de UI
  readonly equipmentTypes = [
    { value: EquipmentTypeEnum.CABINET, label: 'Cabinets', icon: 'pi-box' },
    { value: EquipmentTypeEnum.PANEL, label: 'Panels', icon: 'pi-desktop' }
  ];

  ngOnInit(): void {
    this.loadClients();
  }

  ngOnDestroy(): void {
    // Cleanup si es necesario
  }

  loadClients(): void {
    this.formStore.loadClients();
  }

  onSubmit(): void {
    if (this.formStore.canSubmit()) {
      this.formStore.submitProject().then((project) => {
        if (project) {
          // Agregar al store principal
          this.projectsStore.addProject(project);
          // Navegar de vuelta a la lista
          this.router.navigate(['/projects']).then(() => {});
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/projects']).then(() => {});
  }

  onClientSelect(clientId: string): void {
    this.formStore.setClientId(clientId);
  }

  onEquipmentTypeToggle(equipmentType: EquipmentTypeEnum, isSelected: boolean): void {
    const currentTypes = this.formStore.formData().allowedEquipmentTypes;

    if (isSelected) {
      if (!currentTypes.includes(equipmentType)) {
        this.formStore.setAllowedEquipmentTypes([...currentTypes, equipmentType]);
      }
    } else {
      this.formStore.setAllowedEquipmentTypes(currentTypes.filter(type => type !== equipmentType));
    }
  }

  isEquipmentTypeSelected(equipmentType: EquipmentTypeEnum): boolean {
    return this.formStore.formData().allowedEquipmentTypes.includes(equipmentType);
  }

  onBannerFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    this.formStore.setBannerFile(file);
  }

  removeBanner(): void {
    this.formStore.clearBanner();
    // Limpiar input file
    const fileInput = document.getElementById('bannerFile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  formatDate(date: Date | null): string {
    if (!date) return '';
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  }

  onStartDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const date = input.value ? new Date(input.value) : null;
    this.formStore.setStartAt(date);
  }

  onCompletionDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const date = input.value ? new Date(input.value) : null;
    this.formStore.setCompletionAt(date);
  }
}
