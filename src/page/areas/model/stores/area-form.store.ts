import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import {EquipmentTypeEnum} from '../../../../shared/model';
import {AreaService} from '../../../../entities/area/api';
import {AreaEntity} from '../../../../entities/area/model';

export interface AreaFormData {
  name: string;
  code: string;
  plantId: string;
  allowedEquipmentTypes: EquipmentTypeEnum[];
}

export interface AreaFormState {
  formData: AreaFormData;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  areaId: string | null;
  isEditing: boolean;
  validationErrors: {
    name?: string;
    code?: string;
    allowedEquipmentTypes?: string;
  };
}

const initialState: AreaFormState = {
  formData: {
    name: '',
    code: '',
    plantId: '',
    allowedEquipmentTypes: []
  },
  isLoading: false,
  isSubmitting: false,
  error: null,
  areaId: null,
  isEditing: false,
  validationErrors: {}
};

export const AreaFormStore = signalStore(
  withState<AreaFormState>(initialState),

  withComputed((state) => ({
    isFormValid: computed(() => {
      const data = state.formData();
      const errors = state.validationErrors();

      return data.name.trim().length >= 3 &&
        data.code.trim().length >= 2 &&
        data.plantId.trim().length > 0 &&
        data.allowedEquipmentTypes.length > 0 &&
        Object.keys(errors).length === 0;
    }),

    canSubmit: computed(() => {
      const data = state.formData();
      const errors = state.validationErrors();
      const isPlantIdValidForCreation = !state.isEditing() ? data.plantId.trim().length > 0 : true;

      return data.name.trim().length >= 3 &&
        data.code.trim().length >= 2 &&
        isPlantIdValidForCreation &&
        data.allowedEquipmentTypes.length > 0 &&
        Object.keys(errors).length === 0 &&
        !state.isSubmitting();
    }),

    formTitle: computed(() =>
      state.isEditing() ? 'Editar Área' : 'Nueva Área'
    ),

    submitButtonText: computed(() =>
      state.isEditing() ? 'Actualizar' : 'Crear'
    )
  })),

  withMethods((store) => {
    const areaService = inject(AreaService);

    return {
      /**
       * Inicializar para crear nueva área
       */
      initializeForCreate(plantId: string): void {
        patchState(store, {
          ...initialState,
          formData: {
            name: '',
            code: '',
            plantId,
            allowedEquipmentTypes: []
          },
          isEditing: false
        });
      },

      /**
       * Inicializar para editar área existente
       */
      async initializeForEdit(plantId: string, areaId: string): Promise<void> {
        patchState(store, {
          isLoading: true,
          error: null,
          areaId,
          isEditing: true,
          formData: {
            name: '',
            code: '',
            plantId,
            allowedEquipmentTypes: []
          }
        });

        try {
          const area = await firstValueFrom(areaService.getById(areaId));

          if (area) {
            patchState(store, {
              formData: {
                name: area.name,
                code: area.code,
                plantId: store.formData().plantId,
                allowedEquipmentTypes: [...area.allowedEquipmentTypes]
              },
              isLoading: false,
              error: null
            });
          }

        } catch (error: any) {
          console.error('❌ Error loading area:', error);
          patchState(store, {
            isLoading: false,
            error: error.message || 'Error al cargar el área'
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
       * Toggle tipo de equipo
       */
      toggleEquipmentType(type: EquipmentTypeEnum): void {
        patchState(store, (state) => {
          const current = state.formData.allowedEquipmentTypes;
          const updated = current.includes(type)
            ? current.filter(t => t !== type)
            : [...current, type];

          return {
            formData: { ...state.formData, allowedEquipmentTypes: updated }
          };
        });
        this.validateEquipmentTypes();
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
       * Validar tipos de equipo
       */
      validateEquipmentTypes(): void {
        const errors = { ...store.validationErrors() };
        const types = store.formData().allowedEquipmentTypes;

        if (types.length === 0) {
          errors.allowedEquipmentTypes = 'Debes seleccionar al menos un tipo de equipo';
        } else {
          delete errors.allowedEquipmentTypes;
        }

        patchState(store, { validationErrors: errors });
      },

      /**
       * Enviar formulario
       */
      async submit(): Promise<AreaEntity | null> {
        this.validateName(store.formData().name);
        this.validateCode(store.formData().code);
        this.validateEquipmentTypes();

        if (!store.canSubmit()) {
          return null;
        }

        patchState(store, {
          isSubmitting: true,
          error: null
        });

        try {
          const areaData: AreaEntity = {
            id: store.areaId() || '',
            name: store.formData().name.trim(),
            code: store.formData().code.trim().toUpperCase(),
            plantId: store.formData().plantId,
            allowedEquipmentTypes: [...store.formData().allowedEquipmentTypes]
          };

          let result: AreaEntity;

          if (store.isEditing()) {
            result = await firstValueFrom(
              areaService.update(areaData.id, areaData)
            );
          } else {
            result = await firstValueFrom(
              areaService.create(areaData)
            );
          }

          patchState(store, {
            isSubmitting: false,
            error: null
          });

          return result;

        } catch (error: any) {
          console.error('❌ Error saving area:', error);

          const errorMessage = error.message ||
            `Error al ${store.isEditing() ? 'actualizar' : 'crear'} el área`;

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
