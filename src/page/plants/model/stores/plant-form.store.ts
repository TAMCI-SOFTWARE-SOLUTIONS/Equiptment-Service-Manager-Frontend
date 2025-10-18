import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import {PlantEntity, PlantService} from '../../../../entities/plant';

export interface PlantFormData {
  name: string;
  clientId: string;
}

export interface PlantFormState {
  formData: PlantFormData;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  plantId: string | null;
  isEditing: boolean;
  validationErrors: {
    name?: string;
  };
}

const initialState: PlantFormState = {
  formData: {
    name: '',
    clientId: ''
  },
  isLoading: false,
  isSubmitting: false,
  error: null,
  plantId: null,
  isEditing: false,
  validationErrors: {}
};

export const PlantFormStore = signalStore(
  withState<PlantFormState>(initialState),

  withComputed((state) => ({
    isFormValid: computed(() => {
      const data = state.formData();
      const errors = state.validationErrors();

      return data.name.trim().length >= 3 &&
        data.clientId.trim().length > 0 &&
        Object.keys(errors).length === 0;
    }),

    canSubmit: computed(() => {
      const data = state.formData();
      const errors = state.validationErrors();

      return data.name.trim().length >= 3 &&
        data.clientId.trim().length > 0 &&
        Object.keys(errors).length === 0 &&
        !state.isSubmitting();
    }),

    formTitle: computed(() =>
      state.isEditing() ? 'Editar Planta' : 'Nueva Planta'
    ),

    submitButtonText: computed(() =>
      state.isEditing() ? 'Actualizar' : 'Crear'
    )
  })),

  withMethods((store) => {
    const plantService = inject(PlantService);

    return {
      /**
       * Inicializar para crear nueva planta
       */
      initializeForCreate(clientId: string): void {
        console.log('clientId', clientId);
        patchState(store, {
          ...initialState,
          formData: {
            name: '',
            clientId
          },
          isEditing: false
        });
      },

      /**
       * Inicializar para editar planta existente
       */
      async initializeForEdit(clientId: string, plantId: string): Promise<void> {
        patchState(store, {
          isLoading: true,
          error: null,
          plantId,
          isEditing: true,
          formData: {
            name: '',
            clientId
          }
        });

        try {
          const plant = await firstValueFrom(plantService.getById(plantId));

          if (plant) {
            patchState(store, {
              formData: {
                name: plant.name,
                clientId: plant.clientId
              },
              isLoading: false,
              error: null
            });
          }

        } catch (error: any) {
          console.error('❌ Error loading plant:', error);
          patchState(store, {
            isLoading: false,
            error: error.message || 'Error al cargar la planta'
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
       * Enviar formulario
       */
      async submit(): Promise<PlantEntity | null> {
        this.validateName(store.formData().name);

        if (!store.canSubmit()) {
          return null;
        }

        patchState(store, {
          isSubmitting: true,
          error: null
        });

        try {
          const plantData: PlantEntity = {
            id: store.plantId() || '',
            name: store.formData().name.trim(),
            clientId: store.formData().clientId
          };

          let result: PlantEntity;

          if (store.isEditing()) {
            result = await firstValueFrom(
              plantService.update(plantData.id, plantData)
            );
          } else {
            result = await firstValueFrom(
              plantService.create(plantData)
            );
          }

          patchState(store, {
            isSubmitting: false,
            error: null
          });

          return result;

        } catch (error: any) {
          console.error('❌ Error saving plant:', error);

          const errorMessage = error.message ||
            `Error al ${store.isEditing() ? 'actualizar' : 'crear'} la planta`;

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
