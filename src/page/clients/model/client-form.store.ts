import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import {ClientService} from '../../../entities/client/api';
import {FileService} from '../../../entities/file/api/file.service';
import {ClientEntity} from '../../../entities/client/model';
import {firstValueFrom} from 'rxjs';

export interface ClientFormData {
  name: string;
  logoFile: File | null;
  bannerFile: File | null;
}

export interface ClientFormState {
  formData: ClientFormData;
  logoPreview: string | null;
  bannerPreview: string | null;
  isSubmitting: boolean;
  isUploadingLogo: boolean;
  isUploadingBanner: boolean;
  error: string | null;
  validationErrors: {
    name?: string;
    logo?: string;
    banner?: string;
  };
}

const initialState: ClientFormState = {
  formData: {
    name: '',
    logoFile: null,
    bannerFile: null
  },
  logoPreview: null,
  bannerPreview: null,
  isSubmitting: false,
  isUploadingLogo: false,
  isUploadingBanner: false,
  error: null,
  validationErrors: {}
};

export const ClientFormStore = signalStore(
  withState<ClientFormState>(initialState),

  withComputed((state) => ({
    isFormValid: computed(() => {
      const errors = state.validationErrors();
      return state.formData().name.trim().length >= 3 &&
        Object.keys(errors).length === 0;
    }),

    isLoading: computed(() =>
      state.isSubmitting() ||
      state.isUploadingLogo() ||
      state.isUploadingBanner()
    ),

    canSubmit: computed(() => {
      const errors = state.validationErrors();
      return state.formData().name.trim().length >= 3 &&
        Object.keys(errors).length === 0 &&
        !state.isSubmitting() &&
        !state.isUploadingLogo() &&
        !state.isUploadingBanner();
    })
  })),

  withMethods((store) => {
    const clientService = inject(ClientService);
    const fileService = inject(FileService);

    return {
      /**
       * Actualizar nombre del cliente
       */
      setName(name: string): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, name }
        }));

        // Validar nombre
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
       * Seleccionar archivo de logo
       */
      setLogoFile(file: File | null): void {
        if (!file) {
          this.clearLogo();
          return;
        }

        // Validar archivo
        const validation = this.validateImageFile(file, 'logo');
        if (!validation.isValid) {
          patchState(store, (state) => ({
            validationErrors: { ...state.validationErrors, logo: validation.error }
          }));
          return;
        }

        // Limpiar error previo
        patchState(store, (state) => {
          const errors = { ...state.validationErrors };
          delete errors.logo;
          return {
            formData: { ...state.formData, logoFile: file },
            validationErrors: errors
          };
        });

        // Generar preview
        this.generatePreview(file, 'logo');
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
        const validation = this.validateImageFile(file, 'banner');
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

        // Generar preview
        this.generatePreview(file, 'banner');
      },

      /**
       * Validar archivo de imagen
       */
      validateImageFile(file: File, type: 'logo' | 'banner'): { isValid: boolean; error?: string } {
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
      generatePreview(file: File, type: 'logo' | 'banner'): void {
        const reader = new FileReader();

        reader.onload = (e) => {
          const preview = e.target?.result as string;

          if (type === 'logo') {
            patchState(store, { logoPreview: preview });
          } else {
            patchState(store, { bannerPreview: preview });
          }
        };

        reader.onerror = () => {
          console.error('Error al leer archivo');
        };

        reader.readAsDataURL(file);
      },

      /**
       * Limpiar logo
       */
      clearLogo(): void {
        // Revocar URL de preview si existe
        if (store.logoPreview()) {
          URL.revokeObjectURL(store.logoPreview()!);
        }

        patchState(store, (state) => {
          const errors = { ...state.validationErrors };
          delete errors.logo;
          return {
            formData: { ...state.formData, logoFile: null },
            logoPreview: null,
            validationErrors: errors
          };
        });
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
       * Subir cliente (con archivos)
       */
      async submitClient(): Promise<ClientEntity | null> {
        // Validación final
        if (!store.canSubmit()) {
          return null;
        }

        patchState(store, {
          isSubmitting: true,
          error: null
        });

        try {
          let logoFileId: string | null = null;
          let bannerFileId: string | null = null;

          // 1. Subir logo si existe
          if (store.formData().logoFile) {
            patchState(store, { isUploadingLogo: true });

            const logoEntity = await fileService
              .upload(store.formData().logoFile!)
              .toPromise();

            logoFileId = logoEntity!.id;

            patchState(store, { isUploadingLogo: false });
          }

          // 2. Subir banner si existe
          if (store.formData().bannerFile) {
            patchState(store, { isUploadingBanner: true });

            const bannerEntity = await fileService
              .upload(store.formData().bannerFile!)
              .toPromise();

            bannerFileId = bannerEntity!.id;

            patchState(store, { isUploadingBanner: false });
          }

          const clientData: ClientEntity = {
              id: '',
              name: store.formData().name.trim(),
              logoFileId,
              bannerFileId
          }



          const newClient = await firstValueFrom(clientService.create(clientData));

          patchState(store, {
            isSubmitting: false,
            error: null
          });

          // Limpiar formulario
          this.resetForm();

          return newClient!;

        } catch (error: any) {
          console.error('❌ Error al crear cliente:', error);

          const errorMessage = error.message || 'Error al crear el cliente. Inténtalo de nuevo.';

          patchState(store, {
            isSubmitting: false,
            isUploadingLogo: false,
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
        // Limpiar previews
        if (store.logoPreview()) {
          URL.revokeObjectURL(store.logoPreview()!);
        }
        if (store.bannerPreview()) {
          URL.revokeObjectURL(store.bannerPreview()!);
        }

        patchState(store, initialState);
      }
    };
  })
);
