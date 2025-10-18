import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import {CabinetTypeService} from '../../../../entities/cabinet-type/api';
import {CabinetTypeEntity} from '../../../../entities/cabinet-type/model';
import {firstValueFrom} from 'rxjs';

export interface CabinetTypeFormData {
  code: string;
  name: string;
}

export interface CabinetTypeFormState {
  formData: CabinetTypeFormData;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  cabinetTypeId: string | null;
  isEditing: boolean;
  validationErrors: {
    code?: string;
    name?: string;
  };
}

const initialState: CabinetTypeFormState = {
  formData: {
    code: '',
    name: ''
  },
  isLoading: false,
  isSubmitting: false,
  error: null,
  cabinetTypeId: null,
  isEditing: false,
  validationErrors: {}
};

export const CabinetTypeFormStore = signalStore(
  withState<CabinetTypeFormState>(initialState),

  withComputed((state) => ({
    /**
     * Indica si el formulario es válido
     */
    isFormValid: computed(() => {
      const data = state.formData();
      const errors = state.validationErrors();

      return data.code.trim().length >= 2 &&
        data.name.trim().length >= 3 &&
        Object.keys(errors).length === 0;
    }),

    /**
     * Indica si se puede enviar el formulario
     */
    canSubmit: computed(() => {
      const data = state.formData();
      const errors = state.validationErrors();

      return data.code.trim().length >= 2 &&
        data.name.trim().length >= 3 &&
        Object.keys(errors).length === 0 &&
        !state.isSubmitting();
    }),

    /**
     * Título del formulario
     */
    formTitle: computed(() =>
      state.isEditing() ? 'Editar Tipo de Gabinete' : 'Nuevo Tipo de Gabinete'
    ),

    /**
     * Texto del botón submit
     */
    submitButtonText: computed(() =>
      state.isEditing() ? 'Actualizar' : 'Crear'
    )
  })),

  withMethods((store) => {
    const cabinetTypeService = inject(CabinetTypeService);

    return {
      /**
       * Inicializar formulario para creación
       */
      initializeForCreate(): void {
        patchState(store, {
          ...initialState,
          isEditing: false
        });
      },

      /**
       * Inicializar formulario para edición
       */
      async initializeForEdit(cabinetTypeId: string): Promise<void> {
        patchState(store, {
          isLoading: true,
          error: null,
          cabinetTypeId,
          isEditing: true
        });

        try {
          const cabinetType = await firstValueFrom(cabinetTypeService.getById(cabinetTypeId));

          if (cabinetType) {
            patchState(store, {
              formData: {
                code: cabinetType.code,
                name: cabinetType.name
              },
              isLoading: false,
              error: null
            });
          }

        } catch (error: any) {
          console.error('❌ Error loading cabinet type:', error);
          patchState(store, {
            isLoading: false,
            error: error.message || 'Error al cargar el tipo de gabinete'
          });
        }
      },

      /**
       * Actualizar código
       */
      setCode(code: string): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, code }
        }));
        this.validateCode(code);
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
       * Validar código
       */
      validateCode(code: string): void {
        const errors = { ...store.validationErrors() };

        if (!code.trim()) {
          errors.code = 'El código es requerido';
        } else if (code.trim().length < 2) {
          errors.code = 'El código debe tener al menos 2 caracteres';
        } else if (code.trim().length > 50) {
          errors.code = 'El código no puede exceder 50 caracteres';
        } else {
          delete errors.code;
        }

        patchState(store, { validationErrors: errors });
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
      async submit(): Promise<CabinetTypeEntity | null> {
        this.validateCode(store.formData().code);
        this.validateName(store.formData().name);

        if (!store.canSubmit()) {
          return null;
        }

        patchState(store, {
          isSubmitting: true,
          error: null
        });

        try {
          const cabinetTypeData: CabinetTypeEntity = {
            id: store.cabinetTypeId() || '',
            code: store.formData().code.trim(),
            name: store.formData().name.trim()
          };

          let result: CabinetTypeEntity;

          if (store.isEditing()) {
            // Actualizar
            result = await firstValueFrom(cabinetTypeService.update(store.cabinetTypeId()!, cabinetTypeData)) as CabinetTypeEntity;
          } else {
            // Crear
            result = await firstValueFrom(cabinetTypeService.create(cabinetTypeData)) as CabinetTypeEntity;
          }

          patchState(store, {
            isSubmitting: false,
            error: null
          });

          return result;

        } catch (error: any) {
          console.error('❌ Error saving cabinet type:', error);

          const errorMessage = error.message ||
            `Error al ${store.isEditing() ? 'actualizar' : 'crear'} el tipo de gabinete`;

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
       * Reset del formulario
       */
      reset(): void {
        patchState(store, initialState);
      }
    };
  })
);
