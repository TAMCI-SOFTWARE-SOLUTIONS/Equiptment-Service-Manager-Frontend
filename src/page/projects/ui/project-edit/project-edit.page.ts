import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectFormStore } from '../../model/project-form.store';
import { ProjectsStore } from '../../model/projects.store';
import { EquipmentTypeEnum } from '../../../../shared/model';
import { FormsModule } from '@angular/forms';
import {ProjectEntity} from '../../../../entities/project/model/project.entity';

@Component({
  selector: 'app-project-edit',
  imports: [CommonModule, FormsModule],
  standalone: true,
  providers: [ProjectFormStore],
  templateUrl: './project-edit.page.html'
})
export class ProjectEditPage implements OnInit, OnDestroy {
  readonly formStore = inject(ProjectFormStore);
  readonly projectsStore = inject(ProjectsStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Estado de UI
  readonly equipmentTypes = [
    { value: EquipmentTypeEnum.CABINET, label: 'Cabinets', icon: 'pi-box' },
    { value: EquipmentTypeEnum.PANEL, label: 'Panels', icon: 'pi-desktop' }
  ];

  projectId: string | null = null;
  isLoadingProject = true;

  ngOnInit(): void {
    this.loadClients();
    this.loadProject();
  }

  ngOnDestroy(): void {
    // Cleanup si es necesario
  }

  loadClients(): void {
    this.formStore.loadClients();
  }

  loadProject(): void {
    this.route.params.subscribe(params => {
      this.projectId = params['projectId'];
      if (this.projectId) {
        this.loadProjectData(this.projectId);
      }
    });
  }

  loadProjectData(projectId: string): void {
    this.isLoadingProject = true;

    // Buscar el proyecto en el store principal primero
    const existingProject = this.projectsStore.projectsWithClients().find(p => p.id === projectId);

    if (existingProject) {
      this.populateForm(existingProject);
      this.isLoadingProject = false;
    } else {
      // Si no está en el store, cargar desde el servicio
      this.loadProjectFromService(projectId);
    }
  }

  loadProjectFromService(projectId: string): void {
    // Aquí podrías cargar desde el servicio si no está en el store
    // Por ahora, asumir que viene del store
    console.warn('Proyecto no encontrado en store, debería cargar desde servicio');
    this.isLoadingProject = false;
  }

  populateForm(project: ProjectEntity & { clientName?: string }): void {
    // Llenar el formulario con los datos existentes
    this.formStore.setName(project.name);
    this.formStore.setCode(project.code);
    this.formStore.setDescription(project.description);
    this.formStore.setClientId(project.clientId);
    this.formStore.setAllowedEquipmentTypes(project.allowedEquipmentTypes);
    this.formStore.setStartAt(project.startAt);
    this.formStore.setCompletionAt(project.completionAt);

    // Limpiar cualquier error previo
    this.formStore.clearError();
  }

  onSubmit(): void {
    if (this.formStore.canSubmit() && this.projectId) {
      this.formStore.updateProject(this.projectId).then((project) => {
        if (project) {
          // Actualizar en el store principal
          this.projectsStore.updateProject(project);
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
