import {computed, inject} from '@angular/core';
import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import {ProjectService} from '../../../entities/project/api';
import {ClientService} from '../../../entities/client/api';
import {ClientEntity} from '../../../entities/client/model';
import {EquipmentTypeEnum} from '../../../shared/model';
import {firstValueFrom} from 'rxjs';
import {ProjectEntity} from '../../../entities/project/model/project.entity';
import {ProjectStatusEnum} from '../../../entities/project/model/project-status.enum';
import {FileService} from '../../../entities/file/api/file.service';

export interface ProjectFormData {
  name: string;
  code: string;
  description: string;
  clientId: string;
  bannerFile: File | null;
  allowedEquipmentTypes: EquipmentTypeEnum[];
  startAt: Date | null;
  completionAt: Date | null;
}

export interface ProjectFormState {
  formData: ProjectFormData;
  bannerPreview: string | null;
  clients: ClientEntity[];
  isSubmitting: boolean;
  isUploadingBanner: boolean;
  error: string | null;
  validationErrors: {
    name?: string;
    code?: string;
    description?: string;
    clientId?: string;
    allowedEquipmentTypes?: string;
    banner?: string;
  };
}

const initialState: ProjectFormState = {
  formData: {
    name: '',
    code: '',
    description: '',
    clientId: '',
    bannerFile: null,
    allowedEquipmentTypes: [],
    startAt: null,
    completionAt: null
  },
  bannerPreview: null,
  clients: [],
  isSubmitting: false,
  isUploadingBanner: false,
  error: null,
  validationErrors: {}
};

export const ProjectFormStore = signalStore(
  { providedIn: 'root' },
  withState<ProjectFormState>(initialState),

  withComputed((state) => ({
    isFormValid: computed(() => {
      const errors = state.validationErrors();
      const formData = state.formData();
      return formData.name.trim().length >= 3 &&
             formData.code.trim().length >= 2 &&
             formData.description.trim().length >= 10 &&
             formData.clientId.trim().length > 0 &&
             formData.allowedEquipmentTypes.length > 0 &&
             Object.keys(errors).length === 0;
    }),

    isLoading: computed(() =>
      state.isSubmitting() || state.isUploadingBanner()
    ),

    canSubmit: computed(() => {
      const errors = state.validationErrors();
      const formData = state.formData();
      return formData.name.trim().length >= 3 &&
        formData.code.trim().length >= 2 &&
        formData.description.trim().length >= 10 &&
        formData.clientId.trim().length > 0 &&
        formData.allowedEquipmentTypes.length > 0 &&
        Object.keys(errors).length === 0 &&
        !state.isSubmitting() &&
        !state.isUploadingBanner();
    }),

    selectedClient: computed(() => {
      const clientId = state.formData().clientId;
      return clientId ? state.clients().find(client => client.id === clientId) || null : null;
    })
  })),

  withMethods((store) => {
    const projectService = inject(ProjectService);
    const clientService = inject(ClientService);
    const fileService = inject(FileService);

    return {
      /**
       * Cargar clientes disponibles
       */
      loadClients(): void {
        clientService.getAll().subscribe({
          next: (clients: ClientEntity[]) => {
            patchState(store, { clients });
          },
          error: (error: any) => {
            console.error('❌ Error al cargar clientes:', error);
            patchState(store, {
              error: 'Error al cargar la lista de clientes'
            });
          }
        });
      },

      /**
       * Actualizar nombre del proyecto
       */
      setName(name: string): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, name }
        }));
        this.validateName(name);
      },

      /**
       * Validar nombre
       */
      validateName(name: string): void {
        const errors = { ...store.validationErrors() };

        if (!name.trim()) {
          errors.name = 'El nombre es requerido';
        } else if (name.trim().length < 3) {
          errors.name = 'El nombre debe tener al menos 3 caracteres';
        } else if (name.trim().length > 100) {
          errors.name = 'El nombre no puede exceder 100 caracteres';
        } else {
          delete errors.name;
        }

        patchState(store, { validationErrors: errors });
      },

      /**
       * Actualizar código del proyecto
       */
      setCode(code: string): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, code }
        }));
        this.validateCode(code);
      },

      /**
       * Validar código
       */
      validateCode(code: string): void {
        const errors = { ...store.validationErrors() };

        if (!code.trim()) {
          errors.code = 'El código es requerido';
        } else if (code.trim().length < 2) {
          errors.code = 'El código debe tener al menos 2 caracteres';
        } else if (code.trim().length > 20) {
          errors.code = 'El código no puede exceder 20 caracteres';
        } else if (!/^[A-Z0-9-]+$/.test(code.trim())) {
          errors.code = 'El código solo puede contener letras mayúsculas, números y guiones';
        } else {
          delete errors.code;
        }

        patchState(store, { validationErrors: errors });
      },

      /**
       * Actualizar descripción del proyecto
       */
      setDescription(description: string): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, description }
        }));
        this.validateDescription(description);
      },

      /**
       * Validar descripción
       */
      validateDescription(description: string): void {
        const errors = { ...store.validationErrors() };

        if (!description.trim()) {
          errors.description = 'La descripción es requerida';
        } else if (description.trim().length < 10) {
          errors.description = 'La descripción debe tener al menos 10 caracteres';
        } else if (description.trim().length > 500) {
          errors.description = 'La descripción no puede exceder 500 caracteres';
        } else {
          delete errors.description;
        }

        patchState(store, { validationErrors: errors });
      },

      /**
       * Seleccionar cliente
       */
      setClientId(clientId: string): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, clientId }
        }));
        this.validateClientId(clientId);
      },

      /**
       * Validar cliente seleccionado
       */
      validateClientId(clientId: string): void {
        const errors = { ...store.validationErrors() };

        if (!clientId.trim()) {
          errors.clientId = 'Debe seleccionar un cliente';
        } else {
          delete errors.clientId;
        }

        patchState(store, { validationErrors: errors });
      },

      /**
       * Establecer tipos de equipo permitidos
       */
      setAllowedEquipmentTypes(equipmentTypes: EquipmentTypeEnum[]): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, allowedEquipmentTypes: equipmentTypes }
        }));
        this.validateEquipmentTypes(equipmentTypes);
      },

      /**
       * Validar tipos de equipo
       */
      validateEquipmentTypes(equipmentTypes: EquipmentTypeEnum[]): void {
        const errors = { ...store.validationErrors() };

        if (equipmentTypes.length === 0) {
          errors.allowedEquipmentTypes = 'Debe seleccionar al menos un tipo de equipo';
        } else {
          delete errors.allowedEquipmentTypes;
        }

        patchState(store, { validationErrors: errors });
      },

      /**
       * Establecer fecha de inicio
       */
      setStartAt(startAt: Date | null): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, startAt }
        }));
      },

      /**
       * Establecer fecha de finalización
       */
      setCompletionAt(completionAt: Date | null): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, completionAt }
        }));
      },

      /**
       * Seleccionar archivo de banner
       */
      setBannerFile(file: File | null): void {
        if (!file) {
          this.clearBanner();
          return;
        }

        // Validar archivo
        const validation = this.validateImageFile(file);
        if (!validation.isValid) {
          patchState(store, (state) => ({
            validationErrors: { ...state.validationErrors, banner: validation.error }
          }));
          return;
        }

        // Limpiar error previo
        patchState(store, (state) => {
          const errors = { ...state.validationErrors };
          delete errors.banner;
          return {
            formData: { ...state.formData, bannerFile: file },
            validationErrors: errors
          };
        });

        console.log(file);

        // Generar preview
        this.generatePreview(file);
      },

      /**
       * Validar archivo de imagen
       */
      validateImageFile(file: File): { isValid: boolean; error?: string } {
        // Validar tipo
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          return {
            isValid: false,
            error: 'Solo se permiten archivos JPG, PNG o WebP'
          };
        }

        // Validar tamaño (5MB máximo)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          return {
            isValid: false,
            error: 'El archivo no debe superar los 5MB'
          };
        }

        return { isValid: true };
      },

      /**
       * Generar preview de imagen
       */
      generatePreview(file: File): void {
        const reader = new FileReader();

        reader.onload = (e) => {
          const preview = e.target?.result as string;
          patchState(store, { bannerPreview: preview });
        };

        reader.onerror = () => {
          console.error('Error al leer archivo');
        };

        reader.readAsDataURL(file);
      },

      /**
       * Limpiar banner
       */
      clearBanner(): void {
        // Revocar URL de preview si existe
        if (store.bannerPreview()) {
          URL.revokeObjectURL(store.bannerPreview()!);
        }

        patchState(store, (state) => {
          const errors = { ...state.validationErrors };
          delete errors.banner;
          return {
            formData: { ...state.formData, bannerFile: null },
            bannerPreview: null,
            validationErrors: errors
          };
        });
      },

      /**
       * Actualizar proyecto existente
       */
      async updateProject(projectId: string): Promise<ProjectEntity | null> {
        // Validación final
        if (!store.canSubmit()) {
          return null;
        }

        patchState(store, {
          isSubmitting: true,
          error: null
        });

        try {
          let bannerFileId: string | null = null;

          // 1. Subir banner si existe (si hay servicio de archivos)
          if (store.formData().bannerFile) {
            // Por ahora, establecer bannerFileId como null
            // Cuando esté disponible el servicio de archivos, implementar aquí
            patchState(store, { isUploadingBanner: true });
            // bannerFileId = await this.uploadBannerFile();
            patchState(store, { isUploadingBanner: false });
          }

          const projectData: ProjectEntity = {
            id: projectId,
            name: store.formData().name.trim(),
            code: store.formData().code.trim(),
            description: store.formData().description.trim(),
            clientId: store.formData().clientId,
            bannerId: bannerFileId,
            startAt: store.formData().startAt,
            completionAt: store.formData().completionAt,
            cancelledAt: null,
            status: store.formData().startAt ? ProjectStatusEnum.IN_PROGRESS : ProjectStatusEnum.PLANNED,
            allowedEquipmentTypes: store.formData().allowedEquipmentTypes
          };

          const updatedProject = await firstValueFrom(projectService.update(projectId, projectData));

          patchState(store, {
            isSubmitting: false,
            error: null
          });

          // Limpiar formulario
          this.resetForm();

          return updatedProject!;

        } catch (error: any) {
          console.error('❌ Error al actualizar proyecto:', error);

          const errorMessage = error.message || 'Error al actualizar el proyecto. Inténtalo de nuevo.';

          patchState(store, {
            isSubmitting: false,
            isUploadingBanner: false,
            error: errorMessage
          });

          return null;
        }
      },

      /**
       * Subir proyecto (método original para crear)
       */
      async submitProject(): Promise<ProjectEntity | null> {
        // Validación final
        if (!store.canSubmit()) {
          return null;
        }

        patchState(store, {
          isSubmitting: true,
          error: null
        });

        try {
          let bannerFileId: string | null = null;

          // 1. Subir banner si existe (si hay servicio de archivos)
          if (store.formData().bannerFile) {
            // Por ahora, establecer bannerFileId como null
            // Cuando esté disponible el servicio de archivos, implementar aquí
            patchState(store, {isUploadingBanner: true});

            const bannerEntity = await firstValueFrom(fileService.upload(store.formData().bannerFile!));

            bannerFileId = bannerEntity!.id;

            patchState(store, { isUploadingBanner: false });
          }

          const projectData: ProjectEntity = {
            id: '',
            name: store.formData().name.trim(),
            code: store.formData().code.trim(),
            description: store.formData().description.trim(),
            clientId: store.formData().clientId,
            bannerId: bannerFileId,
            startAt: store.formData().startAt,
            completionAt: store.formData().completionAt,
            cancelledAt: null,
            status: store.formData().startAt ? ProjectStatusEnum.IN_PROGRESS: ProjectStatusEnum.PLANNED,
            allowedEquipmentTypes: store.formData().allowedEquipmentTypes
          };

          const newProject = await firstValueFrom(projectService.create(projectData));

          console.log(newProject);

          patchState(store, {
            isSubmitting: false,
            error: null
          });

          // Limpiar formulario
          this.resetForm();

          return newProject!;

        } catch (error: any) {
          console.error('❌ Error al crear proyecto:', error);

          const errorMessage = error.message || 'Error al crear el proyecto. Inténtalo de nuevo.';

          patchState(store, {
            isSubmitting: false,
            isUploadingBanner: false,
            error: errorMessage
          });

          return null;
        }
      },

      /**
       * Limpiar error
       */
      clearError(): void {
        patchState(store, { error: null });
      },

      /**
       * Resetear formulario
       */
      resetForm(): void {
        // Limpiar preview
        if (store.bannerPreview()) {
          URL.revokeObjectURL(store.bannerPreview()!);
        }

        patchState(store, initialState);
      }
    };
  })
);
