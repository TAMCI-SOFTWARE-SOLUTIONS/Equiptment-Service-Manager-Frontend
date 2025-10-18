import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import {
  PowerDistributionPanelTypeEnum
} from '../../../entities/power-distribution-panel/model/enums/power-distribution-panel-type.enum';
import {PowerDistributionPanelService} from '../../../entities/power-distribution-panel/api';
import {PowerDistributionPanelEntity} from '../../../entities/power-distribution-panel/model';

export interface PowerDistributionPanelFormData {
  code: string;
  type: PowerDistributionPanelTypeEnum | null;
}

export interface PowerDistributionPanelFormState {
  formData: PowerDistributionPanelFormData;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  panelId: string | null;
  isEditing: boolean;
  validationErrors: {
    code?: string;
    type?: string;
  };
}

const initialState: PowerDistributionPanelFormState = {
  formData: {
    code: '',
    type: null
  },
  isLoading: false,
  isSubmitting: false,
  error: null,
  panelId: null,
  isEditing: false,
  validationErrors: {}
};

export const PowerDistributionPanelFormStore = signalStore(
  withState<PowerDistributionPanelFormState>(initialState),

  withComputed((state) => ({
    /**
     * Indica si el formulario es válido
     */
    isFormValid: computed(() => {
      const data = state.formData();
      const errors = state.validationErrors();

      return data.code.trim().length >= 12 &&
        data.type !== null &&
        Object.keys(errors).length === 0;
    }),

    /**
     * Indica si se puede enviar el formulario
     */
    canSubmit: computed(() => {
      const data = state.formData();
      const errors = state.validationErrors();

      return data.code.trim().length >= 12 &&
        data.type !== null &&
        Object.keys(errors).length === 0 &&
        !state.isSubmitting();
    }),

    /**
     * Título del formulario
     */
    formTitle: computed(() =>
      state.isEditing() ? 'Editar Panel de Distribución' : 'Nuevo Panel de Distribución'
    ),

    /**
     * Texto del botón submit
     */
    submitButtonText: computed(() =>
      state.isEditing() ? 'Actualizar' : 'Crear'
    )
  })),

  withMethods((store) => {
    const panelService = inject(PowerDistributionPanelService);

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
      async initializeForEdit(panelId: string): Promise<void> {
        patchState(store, {
          isLoading: true,
          error: null,
          panelId,
          isEditing: true
        });

        try {
          const panel = await firstValueFrom(panelService.getById(panelId));

          if (panel) {
            patchState(store, {
              formData: {
                code: panel.code,
                type: panel.type
              },
              isLoading: false,
              error: null
            });
          }

        } catch (error: any) {
          console.error('❌ Error loading power distribution panel:', error);
          patchState(store, {
            isLoading: false,
            error: error.message || 'Error al cargar el panel de distribución'
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
       * Actualizar tipo
       */
      setType(type: PowerDistributionPanelTypeEnum | null): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, type }
        }));
        this.validateType(type);
      },

      /**
       * Validar código con patrón 0110-DPJ-0001
       */
      validateCode(code: string): void {
        const errors = { ...store.validationErrors() };
        const codePattern = /^\d{4}-[A-Z]{3}-\d{4}$/;

        if (!code.trim()) {
          errors.code = 'El código es requerido';
        } else if (!codePattern.test(code.trim())) {
          errors.code = 'Formato inválido. Use: 0110-DPJ-0001 (4 dígitos-3 letras-4 dígitos)';
        } else if (code.trim().length > 50) {
          errors.code = 'El código no puede exceder 50 caracteres';
        } else {
          delete errors.code;
        }

        patchState(store, { validationErrors: errors });
      },

      /**
       * Validar tipo
       */
      validateType(type: PowerDistributionPanelTypeEnum | null): void {
        const errors = { ...store.validationErrors() };

        if (type === null) {
          errors.type = 'El tipo es requerido';
        } else {
          delete errors.type;
        }

        patchState(store, { validationErrors: errors });
      },

      /**
       * Enviar formulario
       */
      async submit(): Promise<PowerDistributionPanelEntity | null> {
        // Validar todos los campos
        this.validateCode(store.formData().code);
        this.validateType(store.formData().type);

        if (!store.canSubmit()) {
          return null;
        }

        patchState(store, {
          isSubmitting: true,
          error: null
        });

        try {
          const panelData: PowerDistributionPanelEntity = {
            id: store.panelId() || '',
            code: store.formData().code.trim(),
            type: store.formData().type!
          };

          let result: PowerDistributionPanelEntity;

          if (store.isEditing()) {
            // Actualizar
            result = await firstValueFrom(
              panelService.update(panelData)
            );
            console.log('✅ Panel actualizado:', result);
          } else {
            // Crear
            result = await firstValueFrom(
              panelService.create(panelData)
            );
            console.log('✅ Panel creado:', result);
          }

          patchState(store, {
            isSubmitting: false,
            error: null
          });

          return result;

        } catch (error: any) {
          console.error('❌ Error saving power distribution panel:', error);

          const errorMessage = error.message ||
            `Error al ${store.isEditing() ? 'actualizar' : 'crear'} el panel de distribución`;

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
