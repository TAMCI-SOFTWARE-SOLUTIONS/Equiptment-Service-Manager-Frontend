import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import {LocationEntity, LocationService} from '../../../../entities/location';

export interface LocationFormData {
  name: string;
  code: string;
  areaId: string;
}

export interface LocationFormState {
  formData: LocationFormData;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  locationId: string | null;
  isEditing: boolean;
  validationErrors: {
    name?: string;
    code?: string;
  };
}

const initialState: LocationFormState = {
  formData: {
    name: '',
    code: '',
    areaId: ''
  },
  isLoading: false,
  isSubmitting: false,
  error: null,
  locationId: null,
  isEditing: false,
  validationErrors: {}
};

export const LocationFormStore = signalStore(
  withState<LocationFormState>(initialState),

  withComputed((state) => ({
    isFormValid: computed(() => {
      const data = state.formData();
      const errors = state.validationErrors();

      return data.name.trim().length >= 3 &&
        data.code.trim().length >= 2 &&
        data.areaId.trim().length > 0 &&
        Object.keys(errors).length === 0;
    }),

    canSubmit: computed(() => {
      const data = state.formData();
      const errors = state.validationErrors();

      return data.name.trim().length >= 3 &&
        data.code.trim().length >= 2 &&
        data.areaId.trim().length > 0 &&
        Object.keys(errors).length === 0 &&
        !state.isSubmitting();
    }),

    formTitle: computed(() =>
      state.isEditing() ? 'Editar Ubicación' : 'Nueva Ubicación'
    ),

    submitButtonText: computed(() =>
      state.isEditing() ? 'Actualizar' : 'Crear'
    )
  })),

  withMethods((store) => {
    const locationService = inject(LocationService);

    return {
      /**
       * Inicializar para crear nueva ubicación
       */
      initializeForCreate(areaId: string): void {
        patchState(store, {
          ...initialState,
          formData: {
            name: '',
            code: '',
            areaId
          },
          isEditing: false
        });
      },

      /**
       * Inicializar para editar ubicación existente
       */
      async initializeForEdit(areaId: string, locationId: string): Promise<void> {
        patchState(store, {
          isLoading: true,
          error: null,
          locationId,
          isEditing: true,
          formData: {
            name: '',
            code: '',
            areaId
          }
        });

        try {
          const location = await firstValueFrom(locationService.getById(locationId));

          if (location) {
            patchState(store, {
              formData: {
                name: location.name,
                code: location.code,
                areaId: store.formData.areaId()
              },
              isLoading: false,
              error: null
            });

            // ✅ Validar después de cargar los datos
            this.validateName(location.name);
            this.validateCode(location.code);
          }

        } catch (error: any) {
          console.error('❌ Error loading location:', error);
          patchState(store, {
            isLoading: false,
            error: error.message || 'Error al cargar la ubicación'
          });
        }
      },

      /**
       * Actualizar nombre
       */
      setName(name: string): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, name }
        }));
        this.validateName(name);
      },

      /**
       * Actualizar código
       */
      setCode(code: string): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, code: code.toUpperCase() }
        }));
        this.validateCode(code);
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
        } else if (!/^[A-Z0-9-]+$/.test(code.toUpperCase())) {
          errors.code = 'Solo letras mayúsculas, números y guiones';
        } else {
          delete errors.code;
        }

        patchState(store, { validationErrors: errors });
      },

      /**
       * Enviar formulario
       */
      async submit(): Promise<LocationEntity | null> {
        this.validateName(store.formData().name);
        this.validateCode(store.formData().code);

        if (!store.canSubmit()) {
          return null;
        }

        patchState(store, {
          isSubmitting: true,
          error: null
        });

        try {
          const locationData: LocationEntity = {
            id: store.locationId() || '',
            name: store.formData().name.trim(),
            code: store.formData().code.trim().toUpperCase(),
            areaId: store.formData().areaId
          };

          let result: LocationEntity;

          if (store.isEditing()) {
            result = await firstValueFrom(
              locationService.update(locationData.id, locationData)
            );
          } else {
            result = await firstValueFrom(
              locationService.create(locationData)
            );
          }

          patchState(store, {
            isSubmitting: false,
            error: null
          });

          return result;

        } catch (error: any) {
          console.error('❌ Error saving location:', error);

          const errorMessage = error.message ||
            `Error al ${store.isEditing() ? 'actualizar' : 'crear'} la ubicación`;

          patchState(store, {
            isSubmitting: false,
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
       * Reset del store
       */
      reset(): void {
        patchState(store, initialState);
      }
    };
  })
);
