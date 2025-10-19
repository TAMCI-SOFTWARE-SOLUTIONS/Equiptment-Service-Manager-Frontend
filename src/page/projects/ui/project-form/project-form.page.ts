import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import { Ripple } from 'primeng/ripple';
import { Select } from 'primeng/select';
import {ProjectFormStore} from '../../model/project-form.store';
import {ProjectsStore} from '../../model/projects.store';
import {EquipmentTypeEnum} from '../../../../shared/model';

interface ClientOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, FormsModule, Ripple, Select],
  providers: [ProjectFormStore],
  templateUrl: './project-form.page.html'
})
export class ProjectFormPage implements OnInit, OnDestroy {
  readonly store = inject(ProjectFormStore);
  readonly projectsStore = inject(ProjectsStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Expose enum
  readonly EquipmentTypeEnum = EquipmentTypeEnum;

  projectId: string | null = null;
  isEditMode = false;

  // Opciones de tipo de equipo
  readonly equipmentTypes = [
    {
      value: EquipmentTypeEnum.CABINET,
      label: 'Gabinetes',
      icon: '📦',
      description: 'Proyectos con gabinetes de control'
    },
    {
      value: EquipmentTypeEnum.PANEL,
      label: 'Paneles',
      icon: '📋',
      description: 'Proyectos con paneles eléctricos'
    }
  ];

  ngOnInit(): void {
    this.store.initialize();

    // Detectar si es modo edición
    this.projectId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.projectId;

    // Sí es edición, cargar datos del proyecto
    if (this.isEditMode && this.projectId) {
      this.store.loadProjectForEdit(this.projectId);
    }
  }

  ngOnDestroy(): void {
    this.store.reset();
  }

  // ==================== NAVIGATION ====================

  onNext(): void {
    this.store.goToNextStep();
  }

  onPrevious(): void {
    this.store.goToPreviousStep();
  }

  onGoToStep(step: number): void {
    this.store.goToStep(step);
  }

  // ==================== FORM HANDLERS (STEP 1) ====================

  onNameChange(value: string): void {
    this.store.setName(value);
  }

  onCodeChange(value: string): void {
    this.store.setCode(value);
  }

  onDescriptionChange(value: string): void {
    this.store.setDescription(value);
  }

  onClientChange(value: string | null): void {
    this.store.setClientId(value);
  }

  // ==================== FORM HANDLERS (STEP 2) ====================

  async onBannerSelect(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      await this.store.setBannerFile(input.files[0]);
    }
  }

  onClearBanner(): void {
    this.store.clearBanner();
  }

  onStartDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const date = input.value ? new Date(input.value) : null;
    this.store.setStartAt(date);
  }

  onCompletionDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const date = input.value ? new Date(input.value) : null;
    this.store.setCompletionAt(date);
  }

  // ==================== TODO METHODS ====================

  /**
   * TODO: Verificar disponibilidad del código
   */
  async onCheckCodeAvailability(): Promise<void> {
    const code = this.store.formData().code;
    if (code.length === 10) {
      const isAvailable = await this.store.checkCodeAvailability(code);
      console.log('Código disponible:', isAvailable);
    }
  }

  /**
   * TODO: Generar código automático
   */
  async onGenerateCode(): Promise<void> {
    const generatedCode = await this.store.generateCode();
    if (generatedCode) {
      console.log('Código generado:', generatedCode);
    }
  }

  // ==================== SUBMIT ====================

  async onSubmit(): Promise<void> {
    let result: any = null;

    if (this.isEditMode && this.projectId) {
      // Modo edición: actualizar
      result = await this.store.update(this.projectId);

      if (result) {
        // Actualizar en el store principal
        this.projectsStore.updateProject(result);
      }
    } else {
      // Modo creación: crear nuevo
      result = await this.store.submit();

      if (result) {
        // Agregar al store principal
        this.projectsStore.addProject(result);
      }
    }

    // Navegar al detalle si fue exitoso
    if (result) {
      this.router.navigate(['/projects', result.id]).then(() => {});
    }
  }

  onCancel(): void {
    this.store.reset();
    this.router.navigate(['/projects']).then(() => {});
  }

  // ==================== HELPERS ====================

  get clientOptions(): ClientOption[] {
    return this.store.clients().map(client => ({
      label: client.name,
      value: client.id
    }));
  }

  getStepIcon(step: number): string {
    const icons: Record<number, string> = {
      1: 'pi-info-circle',
      2: 'pi-cog'
    };
    return icons[step] || 'pi-circle';
  }

  getStepTitle(step: number): string {
    const titles: Record<number, string> = {
      1: 'Información',
      2: 'Configuración'
    };
    return titles[step] || '';
  }

  isStepCompleted(step: number): boolean {
    if (step === 1) {
      return this.store.isStep1Valid();
    }
    return false;
  }

  isStepActive(step: number): boolean {
    return this.store.currentStep() === step;
  }

  formatDate(date: Date | null): string {
    if (!date) return '';
    return date.toISOString().split('T')[0]; // YYYY-MM-DD para input type="date"
  }

  formatFileSize(bytes: number): string {
    return (bytes / 1024 / 1024).toFixed(2);
  }

  onEquipmentTypeChange(value: EquipmentTypeEnum) {
    this.store.setAllowedEquipmentType(value);
  }
}
