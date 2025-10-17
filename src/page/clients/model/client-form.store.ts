import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { ClientService } from '../../../entities/client/api';
import { ClientEntity } from '../../../entities/client/model';
import { firstValueFrom } from 'rxjs';
import {FileService} from '../../../entities/file/api/file.service';

export interface ClientFormData {
  name: string;
  logoFile: File | null;
  bannerFile: File | null;
}

export interface ClientFormState {
  formData: ClientFormData;
  existingLogoFileId: string | null;
  existingBannerFileId: string | null;
  logoPreview: string | null;
  bannerPreview: string | null;
  isLoading: boolean;
  isSubmitting: boolean;
  isUploadingLogo: boolean;
  isUploadingBanner: boolean;
  error: string | null;
  clientId: string | null;
  isEditing: boolean;
  validationErrors: {
    name?: string;
    logoFile?: string;
    bannerFile?: string;
  };
}

const initialState: ClientFormState = {
  formData: {
    name: '',
    logoFile: null,
    bannerFile: null
  },
  existingLogoFileId: null,
  existingBannerFileId: null,
  logoPreview: null,
  bannerPreview: null,
  isLoading: false,
  isSubmitting: false,
  isUploadingLogo: false,
  isUploadingBanner: false,
  error: null,
  clientId: null,
  isEditing: false,
  validationErrors: {}
};

export const ClientFormStore = signalStore(
  withState<ClientFormState>(initialState),

  withComputed((state) => ({
    isFormValid: computed(() => {
      const data = state.formData();
      const errors = state.validationErrors();

      return data.name.trim().length >= 3 &&
        Object.keys(errors).length === 0;
    }),

    canSubmit: computed(() => {
      const data = state.formData();
      const errors = state.validationErrors();

      return data.name.trim().length >= 3 &&
        Object.keys(errors).length === 0 &&
        !state.isSubmitting() &&
        !state.isUploadingLogo() &&
        !state.isUploadingBanner();
    }),

    formTitle: computed(() =>
      state.isEditing() ? 'Editar Cliente' : 'Nuevo Cliente'
    ),

    submitButtonText: computed(() =>
      state.isEditing() ? 'Actualizar' : 'Crear'
    ),

    isUploading: computed(() =>
      state.isUploadingLogo() || state.isUploadingBanner()
    )
  })),

  withMethods((store) => {
    const clientService = inject(ClientService);
    const fileService = inject(FileService);

    return {
      initializeForCreate(): void {
        patchState(store, {
          ...initialState,
          isEditing: false
        });
      },

      async initializeForEdit(clientId: string): Promise<void> {
        patchState(store, {
          isLoading: true,
          error: null,
          clientId,
          isEditing: true
        });

        try {
          const client = await firstValueFrom(clientService.getById(clientId));

          if (client) {
            patchState(store, {
              formData: {
                name: client.name,
                logoFile: null,
                bannerFile: null
              },
              existingLogoFileId: client.logoFileId,
              existingBannerFileId: client.bannerFileId,
              isLoading: false,
              error: null
            });

            // Cargar previews de imágenes existentes
            await this.loadExistingImages(client);
          }

        } catch (error: any) {
          console.error('❌ Error loading client:', error);
          patchState(store, {
            isLoading: false,
            error: error.message || 'Error al cargar el cliente'
          });
        }
      },

      async loadExistingImages(client: ClientEntity): Promise<void> {
        try {
          if (client.logoFileId) {
            const logoUrl = await firstValueFrom(
              fileService.viewFileAsUrl(client.logoFileId)
            );
            patchState(store, { logoPreview: logoUrl });
          }

          if (client.bannerFileId) {
            const bannerUrl = await firstValueFrom(
              fileService.viewFileAsUrl(client.bannerFileId)
            );
            patchState(store, { bannerPreview: bannerUrl });
          }
        } catch (error) {
          console.warn('⚠️ Error loading existing images:', error);
        }
      },

      setName(name: string): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, name }
        }));
        this.validateName(name);
      },

      setLogoFile(file: File | null): void {
        if (!file) {
          this.clearLogo();
          return;
        }

        const validation = this.validateImageFile(file);
        if (!validation.isValid) {
          patchState(store, (state) => ({
            validationErrors: { ...state.validationErrors, logoFile: validation.error }
          }));
          return;
        }

        patchState(store, (state) => {
          const errors = { ...state.validationErrors };
          delete errors.logoFile;
          return {
            formData: { ...state.formData, logoFile: file },
            validationErrors: errors
          };
        });

        this.generateLogoPreview(file);
      },

      setBannerFile(file: File | null): void {
        if (!file) {
          this.clearBanner();
          return;
        }

        const validation = this.validateImageFile(file);
        if (!validation.isValid) {
          patchState(store, (state) => ({
            validationErrors: { ...state.validationErrors, bannerFile: validation.error }
          }));
          return;
        }

        patchState(store, (state) => {
          const errors = { ...state.validationErrors };
          delete errors.bannerFile;
          return {
            formData: { ...state.formData, bannerFile: file },
            validationErrors: errors
          };
        });

        this.generateBannerPreview(file);
      },

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

      validateImageFile(file: File): { isValid: boolean; error?: string } {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          return {
            isValid: false,
            error: 'Solo se permiten archivos JPG, PNG o WebP'
          };
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          return {
            isValid: false,
            error: 'El archivo no debe superar los 5MB'
          };
        }

        return { isValid: true };
      },

      generateLogoPreview(file: File): void {
        const reader = new FileReader();
        reader.onload = (e) => {
          patchState(store, { logoPreview: e.target?.result as string });
        };
        reader.readAsDataURL(file);
      },

      generateBannerPreview(file: File): void {
        const reader = new FileReader();
        reader.onload = (e) => {
          patchState(store, { bannerPreview: e.target?.result as string });
        };
        reader.readAsDataURL(file);
      },

      clearLogo(): void {
        patchState(store, (state) => {
          const errors = { ...state.validationErrors };
          delete errors.logoFile;
          return {
            formData: { ...state.formData, logoFile: null },
            logoPreview: null,
            existingLogoFileId: null,
            validationErrors: errors
          };
        });
      },

      clearBanner(): void {
        patchState(store, (state) => {
          const errors = { ...state.validationErrors };
          delete errors.bannerFile;
          return {
            formData: { ...state.formData, bannerFile: null },
            bannerPreview: null,
            existingBannerFileId: null,
            validationErrors: errors
          };
        });
      },

      async submit(): Promise<ClientEntity | null> {
        this.validateName(store.formData().name);

        if (!store.canSubmit()) {
          return null;
        }

        patchState(store, {
          isSubmitting: true,
          error: null
        });

        try {
          let logoFileId = store.existingLogoFileId();
          let bannerFileId = store.existingBannerFileId();

          // Subir logo si hay uno nuevo
          if (store.formData().logoFile) {
            patchState(store, { isUploadingLogo: true });
            const logoEntity = await firstValueFrom(
              fileService.upload(store.formData().logoFile!)
            );
            logoFileId = logoEntity.id;
            patchState(store, { isUploadingLogo: false });
          }

          // Subir banner si hay uno nuevo
          if (store.formData().bannerFile) {
            patchState(store, { isUploadingBanner: true });
            const bannerEntity = await firstValueFrom(
              fileService.upload(store.formData().bannerFile!)
            );
            bannerFileId = bannerEntity.id;
            patchState(store, { isUploadingBanner: false });
          }

          const clientData: ClientEntity = {
            id: store.clientId() || '',
            name: store.formData().name.trim(),
            logoFileId,
            bannerFileId
          };

          let result: ClientEntity;

          if (store.isEditing()) {
            result = await firstValueFrom(
              clientService.update(clientData)
            );
          } else {
            result = await firstValueFrom(
              clientService.create(clientData)
            );
          }

          patchState(store, {
            isSubmitting: false,
            error: null
          });

          return result;

        } catch (error: any) {
          console.error('❌ Error saving client:', error);

          const errorMessage = error.message ||
            `Error al ${store.isEditing() ? 'actualizar' : 'crear'} el cliente`;

          patchState(store, {
            isSubmitting: false,
            isUploadingLogo: false,
            isUploadingBanner: false,
            error: errorMessage
          });

          return null;
        }
      },

      clearError(): void {
        patchState(store, { error: null });
      },

      reset(): void {
        const logoPreview = store.logoPreview();
        const bannerPreview = store.bannerPreview();

        if (logoPreview?.startsWith('blob:')) {
          URL.revokeObjectURL(logoPreview);
        }
        if (bannerPreview?.startsWith('blob:')) {
          URL.revokeObjectURL(bannerPreview);
        }

        patchState(store, initialState);
      }
    };
  })
);
