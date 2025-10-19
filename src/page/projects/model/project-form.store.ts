import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { ProjectService } from '../../../entities/project/api';
import { ClientService } from '../../../entities/client/api';
import { FileService } from '../../../entities/file/api/file.service';
import { ProjectEntity } from '../../../entities/project/model/project.entity';
import { ProjectStatusEnum } from '../../../entities/project/model/project-status.enum';
import { EquipmentTypeEnum } from '../../../shared/model';
import { ClientEntity } from '../../../entities/client/model';
import { firstValueFrom } from 'rxjs';

export interface ProjectFormData {
  name: string;
  code: string;
  description: string;
  clientId: string | null;
  //allowedEquipmentTypes: EquipmentTypeEnum[];
  allowedEquipmentType: EquipmentTypeEnum | null;
  startAt: Date | null;
  completionAt: Date | null;
  bannerFile: File | null;
}

export interface ProjectFormState {
  // Stepper
  currentStep: number;
  totalSteps: number;

  // Form data
  formData: ProjectFormData;

  // Clients
  clients: ClientEntity[];
  isLoadingClients: boolean;

  // Banner
  bannerId: string | null;
  bannerPreviewUrl: string | null;
  isUploadingBanner: boolean;

  // Loading & submission
  isSubmitting: boolean;

  // Validation
  validationErrors: {
    name?: string;
    code?: string;
    description?: string;
    clientId?: string;
    allowedEquipmentType?: string;
    startAt?: string;
    completionAt?: string;
    bannerFile?: string;
  };

  error: string | null;
}

const initialState: ProjectFormState = {
  currentStep: 1,
  totalSteps: 2,
  formData: {
    name: '',
    code: '',
    description: '',
    clientId: null,
    allowedEquipmentType: null,
    //allowedEquipmentTypes: [],
    startAt: null,
    completionAt: null,
    bannerFile: null
  },
  clients: [],
  isLoadingClients: false,
  bannerId: null,
  bannerPreviewUrl: null,
  isUploadingBanner: false,
  isSubmitting: false,
  validationErrors: {},
  error: null
};

export const ProjectFormStore = signalStore(
  withState<ProjectFormState>(initialState),

  withComputed((state) => ({
    /**
     * Validación Step 1
     */
    isStep1Valid: computed(() => {
      const data = state.formData();
      const errors = state.validationErrors();

      return data.name.trim().length >= 3 &&
        data.code.trim().length === 10 &&
        data.description.trim().length >= 10 &&
        data.clientId !== null &&
        !errors.name &&
        !errors.code &&
        !errors.description &&
        !errors.clientId;
    }),

    /**
     * Validación Step 2
     */
    isStep2Valid: computed(() => {
      const data = state.formData();
      const errors = state.validationErrors();

      return data.allowedEquipmentType !== null &&
        !errors.allowedEquipmentType &&
        !errors.bannerFile;
    }),

    /**
     * Puede avanzar al siguiente step
     */
    canGoNext: computed(() => {
      const currentStep = state.currentStep();
      const data = state.formData();
      const errors = state.validationErrors();

      if (currentStep === 1) {
        // Duplicar lógica de isStep1Valid
        return data.name.trim().length >= 3 &&
          data.code.trim().length === 10 &&
          data.description.trim().length >= 10 &&
          data.clientId !== null &&
          !errors.name &&
          !errors.code &&
          !errors.description &&
          !errors.clientId;
      }

      return false;
    }),

    /**
     * Puede enviar el formulario
     */
    canSubmit: computed(() => {
      const data = state.formData();
      const errors = state.validationErrors();

      // Duplicar lógica de isStep1Valid
      const step1Valid = data.name.trim().length >= 3 &&
        data.code.trim().length === 10 &&
        data.description.trim().length >= 10 &&
        data.clientId !== null &&
        !errors.name &&
        !errors.code &&
        !errors.description &&
        !errors.clientId;

      // Duplicar lógica de isStep2Valid
      const step2Valid = data.allowedEquipmentType != null &&
        !errors.allowedEquipmentType &&
        !errors.bannerFile;

      return step1Valid &&
        step2Valid &&
        !state.isSubmitting() &&
        !state.isUploadingBanner();
    }),

    /**
     * Progreso del stepper
     */
    progress: computed(() => (state.currentStep() / state.totalSteps()) * 100),

    /**
     * Título del step actual
     */
    currentStepTitle: computed(() => {
      const titles: Record<number, string> = {
        1: 'Información del Proyecto',
        2: 'Configuración'
      };
      return titles[state.currentStep()] || '';
    }),

    /**
     * Descripción del step actual
     */
    currentStepDescription: computed(() => {
      const descriptions: Record<number, string> = {
        1: 'Datos básicos y cliente asociado',
        2: 'Tipo de equipo y banner'
      };
      return descriptions[state.currentStep()] || '';
    })
  })),

  withMethods((store) => {
    const projectService = inject(ProjectService);
    const clientService = inject(ClientService);
    const fileService = inject(FileService);

    return {
      /**
       * Inicializar formulario
       */
      async initialize(): Promise<void> {
        patchState(store, initialState);
        await this.loadClients();
      },

      /**
       * Cargar clientes
       */
      async loadClients(): Promise<void> {
        patchState(store, { isLoadingClients: true });

        try {
          const clients = await firstValueFrom(clientService.getAll());

          patchState(store, {
            clients: clients.sort((a, b) => a.name.localeCompare(b.name)),
            isLoadingClients: false
          });

        } catch (error: any) {
          console.error('❌ Error loading clients:', error);
          patchState(store, {
            clients: [],
            isLoadingClients: false
          });
        }
      },

      // ==================== NAVIGATION ====================

      goToNextStep(): void {
        const currentStep = store.currentStep();

        if (currentStep < store.totalSteps() && store.canGoNext()) {
          patchState(store, {
            currentStep: currentStep + 1
          });
        }
      },

      goToPreviousStep(): void {
        const currentStep = store.currentStep();

        if (currentStep > 1) {
          patchState(store, {
            currentStep: currentStep - 1
          });
        }
      },

      goToStep(step: number): void {
        if (step >= 1 && step <= store.totalSteps()) {
          patchState(store, { currentStep: step });
        }
      },

      // ==================== SETTERS ====================

      setName(name: string): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, name }
        }));
        this.validateName(name);
      },

      setCode(code: string): void {
        // Convertir a mayúsculas y limpiar
        const cleanCode = code.toUpperCase().replace(/[^A-Z0-9-]/g, '');

        patchState(store, (state) => ({
          formData: { ...state.formData, code: cleanCode }
        }));
        this.validateCode(cleanCode);
      },

      setDescription(description: string): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, description }
        }));
        this.validateDescription(description);
      },

      setClientId(clientId: string | null): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, clientId }
        }));
        this.validateClientId(clientId);
      },

      setAllowedEquipmentType(equipmentType: EquipmentTypeEnum | null): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, allowedEquipmentType: equipmentType }
        }));
        this.validateEquipmentType(equipmentType);
      },

      setStartAt(date: Date | null): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, startAt: date }
        }));
        this.validateStartAt(date);
      },

      setCompletionAt(date: Date | null): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, completionAt: date }
        }));
        this.validateCompletionAt(date, store.formData().startAt);
      },

      async setBannerFile(file: File | null): Promise<void> {
        if (!file) {
          patchState(store, (state) => ({
            formData: { ...state.formData, bannerFile: null },
            bannerPreviewUrl: null,
            bannerId: null
          }));
          return;
        }

        // Validar tamaño (máx 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
          const errors = { ...store.validationErrors() };
          errors.bannerFile = 'El banner no puede superar 5MB';
          patchState(store, { validationErrors: errors });
          return;
        }

        // Validar tipo
        if (!file.type.startsWith('image/')) {
          const errors = { ...store.validationErrors() };
          errors.bannerFile = 'Solo se permiten imágenes';
          patchState(store, { validationErrors: errors });
          return;
        }

        // Clear error
        const errors = { ...store.validationErrors() };
        delete errors.bannerFile;

        // Preview URL
        const previewUrl = URL.createObjectURL(file);

        patchState(store, (state) => ({
          formData: { ...state.formData, bannerFile: file },
          bannerPreviewUrl: previewUrl,
          validationErrors: errors
        }));
      },

      clearBanner(): void {
        // Revoke preview URL
        if (store.bannerPreviewUrl()) {
          URL.revokeObjectURL(store.bannerPreviewUrl()!);
        }

        patchState(store, (state) => ({
          formData: { ...state.formData, bannerFile: null },
          bannerPreviewUrl: null,
          bannerId: null
        }));
      },

      // ==================== VALIDATIONS ====================

      validateName(name: string): void {
        const errors = { ...store.validationErrors() };

        if (!name.trim()) {
          errors.name = 'El nombre del proyecto es requerido';
        } else if (name.trim().length < 3) {
          errors.name = 'Debe tener al menos 3 caracteres';
        } else if (name.trim().length > 100) {
          errors.name = 'No puede exceder 100 caracteres';
        } else {
          delete errors.name;
        }

        patchState(store, { validationErrors: errors });
      },

      validateCode(code: string): void {
        const errors = { ...store.validationErrors() };

        if (!code.trim()) {
          errors.code = 'El código del proyecto es requerido';
        } else if (code.length !== 10) {
          errors.code = 'El código debe tener exactamente 10 caracteres';
        } else if (!/^[A-Z0-9-]+$/.test(code)) {
          errors.code = 'Solo se permiten letras mayúsculas, números y guiones';
        } else {
          delete errors.code;
        }

        patchState(store, { validationErrors: errors });
      },

      validateDescription(description: string): void {
        const errors = { ...store.validationErrors() };

        if (!description.trim()) {
          errors.description = 'La descripción es requerida';
        } else if (description.trim().length < 10) {
          errors.description = 'Debe tener al menos 10 caracteres';
        } else if (description.trim().length > 500) {
          errors.description = 'No puede exceder 500 caracteres';
        } else {
          delete errors.description;
        }

        patchState(store, { validationErrors: errors });
      },

      validateClientId(clientId: string | null): void {
        const errors = { ...store.validationErrors() };

        if (!clientId) {
          errors.clientId = 'Debes seleccionar un cliente';
        } else {
          delete errors.clientId;
        }

        patchState(store, { validationErrors: errors });
      },

      validateEquipmentType(equipmentType: EquipmentTypeEnum | null): void {
        const errors = { ...store.validationErrors() };

        if (!equipmentType) {
          errors.allowedEquipmentType = 'Debes seleccionar un tipo de equipo';
        } else {
          delete errors.allowedEquipmentType;
        }

        patchState(store, { validationErrors: errors });
      },

      validateStartAt(date: Date | null): void {
        const errors = { ...store.validationErrors() };

        // startAt es opcional, solo validar si existe
        if (date) {
          const now = new Date();
          now.setHours(0, 0, 0, 0);

          if (date < now) {
            errors.startAt = 'La fecha de inicio no puede ser anterior a hoy';
          } else {
            delete errors.startAt;
          }
        } else {
          delete errors.startAt;
        }

        patchState(store, { validationErrors: errors });
      },

      validateCompletionAt(completionDate: Date | null, startDate: Date | null): void {
        const errors = { ...store.validationErrors() };

        // completionAt es opcional
        if (completionDate) {
          if (startDate && completionDate < startDate) {
            errors.completionAt = 'La fecha de finalización debe ser posterior a la fecha de inicio';
          } else {
            delete errors.completionAt;
          }
        } else {
          delete errors.completionAt;
        }

        patchState(store, { validationErrors: errors });
      },

      /**
       * TODO: Verificar disponibilidad del código
       * Este método consultará al backend si el código está disponible
       */
      async checkCodeAvailability(code: string): Promise<boolean> {
        console.log('🚧 TODO: Implementar verificación de disponibilidad de código');
        console.log('Código a verificar:', code);

        // TODO: Implementar cuando el backend esté listo
        // const isAvailable = await firstValueFrom(projectService.checkCodeAvailability(code));
        // return isAvailable;

        return true; // Por ahora siempre retorna disponible
      },

      /**
       * TODO: Generar código automático
       * Este método generará un código único disponible
       */
      async generateCode(): Promise<string | null> {
        console.log('🚧 TODO: Implementar generación automática de código');

        // TODO: Implementar cuando el backend esté listo
        // const generatedCode = await firstValueFrom(projectService.generateCode());
        // this.setCode(generatedCode);
        // return generatedCode;

        return null;
      },

      // ==================== SUBMIT ====================

      async submit(): Promise<ProjectEntity | null> {
        // Validar todo
        this.validateName(store.formData().name);
        this.validateCode(store.formData().code);
        this.validateDescription(store.formData().description);
        this.validateClientId(store.formData().clientId);
        this.validateEquipmentType(store.formData().allowedEquipmentType);
        this.validateStartAt(store.formData().startAt);
        this.validateCompletionAt(store.formData().completionAt, store.formData().startAt);

        if (!store.canSubmit()) {
          return null;
        }

        patchState(store, {
          isSubmitting: true,
          error: null
        });

        try {
          let bannerId: string | null = null;

          // Upload banner if exists
          if (store.formData().bannerFile) {
            patchState(store, { isUploadingBanner: true });

            const uploadedFile = await firstValueFrom(
              fileService.upload(store.formData().bannerFile!)
            );

            bannerId = uploadedFile.id;

            patchState(store, {
              bannerId,
              isUploadingBanner: false
            });
          }

          // Create project
          const projectData: ProjectEntity = {
            id: '', // Backend generates
            name: store.formData().name.trim(),
            code: store.formData().code.trim(),
            description: store.formData().description.trim(),
            clientId: store.formData().clientId!,
            bannerId,
            allowedEquipmentTypes: [store.formData().allowedEquipmentType!],
            status: ProjectStatusEnum.PLANNED,
            startAt: store.formData().startAt,
            completionAt: store.formData().completionAt,
            cancelledAt: null
          };

          const result = await firstValueFrom(
            projectService.create(projectData)
          );

          console.log('✅ Project created:', result);

          patchState(store, {
            isSubmitting: false,
            error: null
          });

          return result;

        } catch (error: any) {
          console.error('❌ Error creating project:', error);

          patchState(store, {
            isSubmitting: false,
            isUploadingBanner: false,
            error: error.message || 'Error al crear el proyecto'
          });

          return null;
        }
      },

      clearError(): void {
        patchState(store, { error: null });
      },

      reset(): void {
        // Cleanup preview URL
        if (store.bannerPreviewUrl()) {
          URL.revokeObjectURL(store.bannerPreviewUrl()!);
        }

        patchState(store, initialState);
      }
    };
  })
);
