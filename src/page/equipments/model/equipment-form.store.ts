import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { CabinetService } from '../../../entities/cabinet/api';
import { PanelService } from '../../../entities/panel/api';
import { CabinetEntity } from '../../../entities/cabinet/model';
import { PanelEntity } from '../../../entities/panel/model';
import { CabinetStatusEnum } from '../../../entities/cabinet/model';
import { PanelStatusEnum } from '../../../entities/panel/model';
import { EquipmentTypeEnum } from '../../../shared/model';
import { firstValueFrom } from 'rxjs';

export interface EquipmentFormData {
  selectedType: EquipmentTypeEnum | null;
  // Campos comunes
  tag: string;
  plantId: string;
  areaId: string;
  communicationProtocol: string;
  location: string;
  status: string;
  // Campos específicos de Cabinet
  cabinetType?: string;
  // Campos específicos de Panel
  panelType?: string;
}

export interface EquipmentFormState {
  formData: EquipmentFormData;
  isSubmitting: boolean;
  error: string | null;
  validationErrors: {
    selectedType?: string;
    tag?: string;
    plantId?: string;
    areaId?: string;
    communicationProtocol?: string;
    location?: string;
    status?: string;
    cabinetType?: string;
    panelType?: string;
  };
}

const initialState: EquipmentFormState = {
  formData: {
    selectedType: null,
    tag: '',
    plantId: '',
    areaId: '',
    communicationProtocol: '',
    location: '',
    status: 'OPERATIVE'
  },
  isSubmitting: false,
  error: null,
  validationErrors: {}
};

export const EquipmentFormStore = signalStore(
  { providedIn: 'root' },
  withState<EquipmentFormState>(initialState),

  withComputed((state) => ({
    isFormValid: computed(() => {
      const errors = state.validationErrors();
      const formData = state.formData();

      // Validaciones comunes
      const hasBasicFields = formData.tag.trim().length >= 3 &&
                           formData.plantId.trim().length > 0 &&
                           formData.areaId.trim().length > 0 &&
                           formData.communicationProtocol.trim().length > 0 &&
                           formData.location.trim().length > 0;

      // Validaciones específicas por tipo
      let hasSpecificFields = true;
      if (formData.selectedType === EquipmentTypeEnum.CABINET) {
        hasSpecificFields = (formData.cabinetType?.trim().length ?? 0) > 0;
      } else if (formData.selectedType === EquipmentTypeEnum.PANEL) {
        hasSpecificFields = (formData.panelType?.trim().length ?? 0) > 0;
      }

      return hasBasicFields && hasSpecificFields && Object.keys(errors).length === 0;
    }),

    isLoading: computed(() => state.isSubmitting()),

    canSubmit: computed(() => {
      const errors = state.validationErrors();
      const formData = state.formData();

      // Validaciones comunes
      const hasBasicFields = formData.tag.trim().length >= 3 &&
                           formData.plantId.trim().length > 0 &&
                           formData.areaId.trim().length > 0 &&
                           formData.communicationProtocol.trim().length > 0 &&
                           formData.location.trim().length > 0;

      // Validaciones específicas por tipo
      let hasSpecificFields = true;
      if (formData.selectedType === EquipmentTypeEnum.CABINET) {
        hasSpecificFields = (formData.cabinetType?.trim().length ?? 0) > 0;
      } else if (formData.selectedType === EquipmentTypeEnum.PANEL) {
        hasSpecificFields = (formData.panelType?.trim().length ?? 0) > 0;
      }

      return hasBasicFields && hasSpecificFields && Object.keys(errors).length === 0 && !state.isSubmitting();
    }),

    selectedTypeLabel: computed(() => {
      const type = state.formData().selectedType;
      switch (type) {
        case EquipmentTypeEnum.CABINET:
          return 'Cabinet';
        case EquipmentTypeEnum.PANEL:
          return 'Panel';
        default:
          return 'Seleccionar tipo';
      }
    }),

    availableStatuses: computed(() => {
      const type = state.formData().selectedType;
      if (type === EquipmentTypeEnum.CABINET) {
        return Object.values(CabinetStatusEnum);
      } else if (type === EquipmentTypeEnum.PANEL) {
        return Object.values(PanelStatusEnum);
      }
      return [];
    })
  })),

  withMethods((store) => {
    const cabinetService = inject(CabinetService);
    const panelService = inject(PanelService);

    return {
      /**
       * Seleccionar tipo de equipo
       */
      setEquipmentType(equipmentType: EquipmentTypeEnum): void {
        patchState(store, (state) => ({
          formData: {
            ...state.formData,
            selectedType: equipmentType,
            // Resetear campos específicos cuando cambia el tipo
            cabinetType: equipmentType === EquipmentTypeEnum.CABINET ? state.formData.cabinetType : undefined,
            panelType: equipmentType === EquipmentTypeEnum.PANEL ? state.formData.panelType : undefined
          }
        }));

        // Validar tipo seleccionado
        this.validateEquipmentType(equipmentType);
      },

      /**
       * Validar tipo de equipo seleccionado
       */
      validateEquipmentType(equipmentType: EquipmentTypeEnum | null): void {
        const errors = { ...store.validationErrors() };

        if (!equipmentType) {
          errors.selectedType = 'Debe seleccionar un tipo de equipo';
        } else {
          delete errors.selectedType;
        }

        patchState(store, { validationErrors: errors });
      },

      /**
       * Establecer tag del equipo
       */
      setTag(tag: string): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, tag }
        }));
        this.validateTag(tag);
      },

      /**
       * Validar tag
       */
      validateTag(tag: string): void {
        const errors = { ...store.validationErrors() };

        if (!tag.trim()) {
          errors.tag = 'El tag es requerido';
        } else if (tag.trim().length < 3) {
          errors.tag = 'El tag debe tener al menos 3 caracteres';
        } else if (tag.trim().length > 50) {
          errors.tag = 'El tag no puede exceder 50 caracteres';
        } else if (!/^[A-Z0-9-]+$/.test(tag.trim())) {
          errors.tag = 'El tag solo puede contener letras mayúsculas, números y guiones';
        } else {
          delete errors.tag;
        }

        patchState(store, { validationErrors: errors });
      },

      /**
       * Establecer plantId
       */
      setPlantId(plantId: string): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, plantId }
        }));
        this.validatePlantId(plantId);
      },

      /**
       * Validar plantId
       */
      validatePlantId(plantId: string): void {
        const errors = { ...store.validationErrors() };

        if (!plantId.trim()) {
          errors.plantId = 'El ID de planta es requerido';
        } else {
          delete errors.plantId;
        }

        patchState(store, { validationErrors: errors });
      },

      /**
       * Establecer areaId
       */
      setAreaId(areaId: string): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, areaId }
        }));
        this.validateAreaId(areaId);
      },

      /**
       * Validar areaId
       */
      validateAreaId(areaId: string): void {
        const errors = { ...store.validationErrors() };

        if (!areaId.trim()) {
          errors.areaId = 'El ID de área es requerido';
        } else {
          delete errors.areaId;
        }

        patchState(store, { validationErrors: errors });
      },

      /**
       * Establecer protocolo de comunicación
       */
      setCommunicationProtocol(protocol: string): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, communicationProtocol: protocol }
        }));
        this.validateCommunicationProtocol(protocol);
      },

      /**
       * Validar protocolo de comunicación
       */
      validateCommunicationProtocol(protocol: string): void {
        const errors = { ...store.validationErrors() };

        if (!protocol.trim()) {
          errors.communicationProtocol = 'El protocolo de comunicación es requerido';
        } else if (protocol.trim().length > 100) {
          errors.communicationProtocol = 'El protocolo no puede exceder 100 caracteres';
        } else {
          delete errors.communicationProtocol;
        }

        patchState(store, { validationErrors: errors });
      },

      /**
       * Establecer ubicación
       */
      setLocation(location: string): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, location }
        }));
        this.validateLocation(location);
      },

      /**
       * Validar ubicación
       */
      validateLocation(location: string): void {
        const errors = { ...store.validationErrors() };

        if (!location.trim()) {
          errors.location = 'La ubicación es requerida';
        } else if (location.trim().length > 200) {
          errors.location = 'La ubicación no puede exceder 200 caracteres';
        } else {
          delete errors.location;
        }

        patchState(store, { validationErrors: errors });
      },

      /**
       * Establecer estado
       */
      setStatus(status: string): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, status }
        }));
        this.validateStatus(status);
      },

      /**
       * Validar estado
       */
      validateStatus(status: string): void {
        const errors = { ...store.validationErrors() };
        const selectedType = store.formData().selectedType;

        if (!status.trim()) {
          errors.status = 'El estado es requerido';
        } else {
          // Validar que el estado sea válido para el tipo seleccionado
          let validStatuses: string[] = [];
          if (selectedType === EquipmentTypeEnum.CABINET) {
            validStatuses = Object.values(CabinetStatusEnum);
          } else if (selectedType === EquipmentTypeEnum.PANEL) {
            validStatuses = Object.values(PanelStatusEnum);
          }

          if (validStatuses.length > 0 && !validStatuses.includes(status)) {
            errors.status = `Estado inválido para el tipo de equipo seleccionado`;
          } else {
            delete errors.status;
          }
        }

        patchState(store, { validationErrors: errors });
      },

      /**
       * Establecer tipo de cabinet
       */
      setCabinetType(cabinetType: string): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, cabinetType }
        }));
        this.validateCabinetType(cabinetType);
      },

      /**
       * Validar tipo de cabinet
       */
      validateCabinetType(cabinetType: string): void {
        const errors = { ...store.validationErrors() };

        if (store.formData().selectedType === EquipmentTypeEnum.CABINET) {
          if (!cabinetType.trim()) {
            errors.cabinetType = 'El tipo de cabinet es requerido';
          } else if (cabinetType.trim().length > 100) {
            errors.cabinetType = 'El tipo de cabinet no puede exceder 100 caracteres';
          } else {
            delete errors.cabinetType;
          }
        }

        patchState(store, { validationErrors: errors });
      },

      /**
       * Establecer tipo de panel
       */
      setPanelType(panelType: string): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, panelType }
        }));
        this.validatePanelType(panelType);
      },

      /**
       * Validar tipo de panel
       */
      validatePanelType(panelType: string): void {
        const errors = { ...store.validationErrors() };

        if (store.formData().selectedType === EquipmentTypeEnum.PANEL) {
          if (!panelType.trim()) {
            errors.panelType = 'El tipo de panel es requerido';
          } else if (panelType.trim().length > 100) {
            errors.panelType = 'El tipo de panel no puede exceder 100 caracteres';
          } else {
            delete errors.panelType;
          }
        }

        patchState(store, { validationErrors: errors });
      },

      /**
       * Crear cabinet
       */
      async submitCabinet(): Promise<CabinetEntity | null> {
        if (!store.canSubmit() || store.formData().selectedType !== EquipmentTypeEnum.CABINET) {
          return null;
        }

        patchState(store, {
          isSubmitting: true,
          error: null
        });

        try {
          const cabinetData: CabinetEntity = {
            id: '',
            plantId: store.formData().plantId,
            tag: store.formData().tag.trim(),
            areaId: store.formData().areaId,
            communicationProtocol: store.formData().communicationProtocol,
            communicationProtocolId: null,
            cabinetType: store.formData().cabinetType!,
            cabinetTypeId: null,
            locationId: store.formData().location,
            status: store.formData().status as CabinetStatusEnum,
            createdAt: new Date(),
            updatedAt: null,
            lastServiceAt: null
          };

          const newCabinet = await firstValueFrom(cabinetService.create(cabinetData));

          patchState(store, {
            isSubmitting: false,
            error: null
          });

          // Limpiar formulario
          this.resetForm();

          return newCabinet!;

        } catch (error: any) {
          console.error('❌ Error al crear cabinet:', error);

          const errorMessage = error.message || 'Error al crear el cabinet. Inténtalo de nuevo.';

          patchState(store, {
            isSubmitting: false,
            error: errorMessage
          });

          return null;
        }
      },

      /**
       * Crear panel
       */
      async submitPanel(): Promise<PanelEntity | null> {
        if (!store.canSubmit() || store.formData().selectedType !== EquipmentTypeEnum.PANEL) {
          return null;
        }

        patchState(store, {
          isSubmitting: true,
          error: null
        });

        try {
          const panelData: PanelEntity = {
            id: '',
            plantId: store.formData().plantId,
            tag: store.formData().tag.trim(),
            areaId: store.formData().areaId,
            communicationProtocol: store.formData().communicationProtocol,
            panelType: store.formData().panelType!,
            location: store.formData().location,
            status: store.formData().status as PanelStatusEnum,
            createdAt: new Date(),
            updatedAt: null,
            lastServiceAt: null
          };

          const newPanel = await firstValueFrom(panelService.create(panelData));

          patchState(store, {
            isSubmitting: false,
            error: null
          });

          // Limpiar formulario
          this.resetForm();

          return newPanel!;

        } catch (error: any) {
          console.error('❌ Error al crear panel:', error);

          const errorMessage = error.message || 'Error al crear el panel. Inténtalo de nuevo.';

          patchState(store, {
            isSubmitting: false,
            error: errorMessage
          });

          return null;
        }
      },

      /**
       * Crear equipo (método genérico que determina el tipo)
       */
      async submitEquipment(): Promise<CabinetEntity | PanelEntity | null> {
        const selectedType = store.formData().selectedType;

        if (selectedType === EquipmentTypeEnum.CABINET) {
          return this.submitCabinet();
        } else if (selectedType === EquipmentTypeEnum.PANEL) {
          return this.submitPanel();
        }

        return null;
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
        patchState(store, initialState);
      }
    };
  })
);
