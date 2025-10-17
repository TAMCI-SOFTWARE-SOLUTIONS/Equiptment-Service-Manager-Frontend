import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { CabinetService } from '../../../entities/cabinet/api';
import { PanelService } from '../../../entities/panel/api';
import { ClientService } from '../../../entities/client/api';
import { PlantService } from '../../../entities/plant';
import { LocationService } from '../../../entities/location';
import { CabinetTypeService } from '../../../entities/cabinet-type/api';
import { CommunicationProtocolService } from '../../../entities/communication-protocol/api';
import { CabinetEntity } from '../../../entities/cabinet/model';
import { PanelEntity } from '../../../entities/panel/model';
import { ClientEntity } from '../../../entities/client/model';
import { PlantEntity } from '../../../entities/plant';
import { AreaEntity } from '../../../entities/area/model';
import { LocationEntity } from '../../../entities/location';
import { CabinetTypeEntity } from '../../../entities/cabinet-type/model';
import { CommunicationProtocolEntity } from '../../../entities/communication-protocol/model';
import { EquipmentTypeEnum } from '../../../entities/equipment/model/equipment-type.enum';
import { EquipmentStatusEnum } from '../../../entities/equipment/model/equipment-status.enum';
import { firstValueFrom } from 'rxjs';
import {PanelTypeEntity} from '../../../entities/panel-type/model/panel-type.entity';
import {PanelTypeService} from '../../../entities/panel-type/api/panel-type.service';

export interface EquipmentFormData {
  type: EquipmentTypeEnum;
  tag: string;
  clientId: string;
  plantId: string;
  areaId: string;
  locationId: string;
  communicationProtocolId: string | null;
  equipmentTypeId: string | null;
  status: EquipmentStatusEnum;
}

export interface EquipmentFormState {
  // Stepper
  currentStep: number;
  totalSteps: number;
  completedSteps: Set<number>;

  // Form data
  formData: EquipmentFormData;

  // Dropdown options
  clients: ClientEntity[];
  plants: PlantEntity[];
  areas: AreaEntity[];
  locations: LocationEntity[];
  cabinetTypes: CabinetTypeEntity[];
  panelTypes: PanelTypeEntity[];
  communicationProtocols: CommunicationProtocolEntity[];

  // Loading states
  isLoadingClients: boolean;
  isLoadingPlants: boolean;
  isLoadingAreas: boolean;
  isLoadingLocations: boolean;
  isLoadingTypes: boolean;
  isLoadingProtocols: boolean;
  isLoadingEquipment: boolean;
  isSubmitting: boolean;

  // Edit mode
  equipmentId: string | null;
  isEditing: boolean;
  originalType: EquipmentTypeEnum | null;

  // Validation
  validationErrors: {
    tag?: string;
    clientId?: string;
    plantId?: string;
    areaId?: string;
    locationId?: string;
    equipmentTypeId?: string;
  };

  error: string | null;
}

const initialState: EquipmentFormState = {
  currentStep: 1,
  totalSteps: 4,
  completedSteps: new Set<number>(),
  formData: {
    type: EquipmentTypeEnum.CABINET,
    tag: '',
    clientId: '',
    plantId: '',
    areaId: '',
    locationId: '',
    communicationProtocolId: null,
    equipmentTypeId: null,
    status: EquipmentStatusEnum.OPERATIVE
  },
  clients: [],
  plants: [],
  areas: [],
  locations: [],
  cabinetTypes: [],
  panelTypes: [],
  communicationProtocols: [],
  isLoadingClients: false,
  isLoadingPlants: false,
  isLoadingAreas: false,
  isLoadingLocations: false,
  isLoadingTypes: false,
  isLoadingProtocols: false,
  isLoadingEquipment: false,
  isSubmitting: false,
  equipmentId: null,
  isEditing: false,
  originalType: null,
  validationErrors: {},
  error: null
};

export const EquipmentFormStore = signalStore(
  withState<EquipmentFormState>(initialState),

  withComputed((state) => ({
    /**
     * Validación del Step 1: Tipo de equipo
     */
    isStep1Valid: computed(() => {
      return true; // Siempre hay un tipo seleccionado por defecto
    }),

    /**
     * Validación del Step 2: Tag
     */
    isStep2Valid: computed(() => {
      const tag = state.formData().tag;
      return tag.trim().length > 0 && !state.validationErrors().tag;
    }),

    /**
     * Validación del Step 3: Ubicación
     */
    isStep3Valid: computed(() => {
      const data = state.formData();
      const errors = state.validationErrors();

      return data.clientId.length > 0 &&
        data.plantId.length > 0 &&
        data.areaId.length > 0 &&
        data.locationId.length > 0 &&
        !errors.clientId &&
        !errors.plantId &&
        !errors.areaId &&
        !errors.locationId;
    }),

    /**
     * Validación del Step 4: Especificaciones
     */
    isStep4Valid: computed(() => {
      const data = state.formData();
      const errors = state.validationErrors();

      return data.equipmentTypeId !== null &&
        data.equipmentTypeId.length > 0 &&
        !errors.equipmentTypeId;
    }),

    /**
     * Puede avanzar al siguiente step
     */
    canGoNext: computed(() => {
      const currentStep = state.currentStep();

      switch (currentStep) {
        case 1:
          return true; // Step 1: siempre puede avanzar
        case 2:
          return state.formData().tag.trim().length > 0;
        case 3:
          const data = state.formData();
          return data.clientId.length > 0 &&
            data.plantId.length > 0 &&
            data.areaId.length > 0 &&
            data.locationId.length > 0;
        case 4:
          return state.formData().equipmentTypeId !== null &&
            state.formData().equipmentTypeId!.length > 0;
        default:
          return false;
      }
    }),

    /**
     * Puede enviar el formulario (todos los steps completados)
     */
    canSubmit: computed(() => {
      const data = state.formData();
      const errors = state.validationErrors();

      return data.tag.trim().length > 0 &&
        data.clientId.length > 0 &&
        data.plantId.length > 0 &&
        data.areaId.length > 0 &&
        data.locationId.length > 0 &&
        data.equipmentTypeId !== null &&
        data.equipmentTypeId.length > 0 &&
        Object.keys(errors).length === 0 &&
        !state.isSubmitting();
    }),

    /**
     * Título del formulario
     */
    formTitle: computed(() => {
      const type = state.formData().type;
      const isEditing = state.isEditing();
      const typeLabel = type === EquipmentTypeEnum.CABINET ? 'Gabinete' : 'Panel';

      return isEditing ? `Editar ${typeLabel}` : `Nuevo ${typeLabel}`;
    }),

    /**
     * Tipos de equipo según el tipo seleccionado
     */
    availableEquipmentTypes: computed(() => {
      const type = state.formData().type;
      return type === EquipmentTypeEnum.CABINET
        ? state.cabinetTypes()
        : state.panelTypes();
    }),

    /**
     * Indica si cambió el tipo (solo en edición)
     */
    hasTypeChanged: computed(() => {
      const originalType = state.originalType();
      const currentType = state.formData().type;
      return state.isEditing() && originalType !== null && originalType !== currentType;
    }),

    /**
     * Progreso del formulario (%)
     */
    progress: computed(() => {
      return (state.currentStep() / state.totalSteps()) * 100;
    }),

    /**
     * Título del step actual
     */
    currentStepTitle: computed(() => {
      const step = state.currentStep();
      const titles: Record<number, string> = {
        1: 'Tipo de Equipo',
        2: 'Identificación',
        3: 'Ubicación',
        4: 'Especificaciones'
      };
      return titles[step] || '';
    }),

    /**
     * Descripción del step actual
     */
    currentStepDescription: computed(() => {
      const step = state.currentStep();
      const type = state.formData().type === EquipmentTypeEnum.CABINET ? 'gabinete' : 'panel';

      const descriptions: Record<number, string> = {
        1: 'Selecciona si es un gabinete o panel',
        2: `Ingresa el identificador único del ${type}`,
        3: `Indica dónde se encuentra el ${type}`,
        4: `Define las características técnicas del ${type}`
      };
      return descriptions[step] || '';
    })
  })),

  withMethods((store) => {
    const cabinetService = inject(CabinetService);
    const panelService = inject(PanelService);
    const clientService = inject(ClientService);
    const plantService = inject(PlantService);
    const locationService = inject(LocationService);
    const cabinetTypeService = inject(CabinetTypeService);
    const panelTypeService = inject(PanelTypeService);
    const communicationProtocolService = inject(CommunicationProtocolService);

    return {
      /**
       * Inicializar para crear
       */
      async initializeForCreate(type: EquipmentTypeEnum = EquipmentTypeEnum.CABINET): Promise<void> {
        patchState(store, {
          ...initialState,
          formData: {
            ...initialState.formData,
            type
          },
          isEditing: false
        });

        // Cargar datos iniciales necesarios
        await Promise.all([
          this.loadClients(),
          this.loadEquipmentTypes(type),
          this.loadCommunicationProtocols()
        ]);
      },

      /**
       * Inicializar para editar
       */
      async initializeForEdit(equipmentId: string, type: EquipmentTypeEnum): Promise<void> {
        patchState(store, {
          isLoadingEquipment: true,
          error: null,
          equipmentId,
          isEditing: true,
          originalType: type,
          currentStep: 1,
          totalSteps: 4,
          completedSteps: new Set([1, 2, 3, 4]) // Todos completados en edición
        });

        try {
          let equipment: CabinetEntity | PanelEntity;

          if (type === EquipmentTypeEnum.CABINET) {
            equipment = await firstValueFrom(cabinetService.getById(equipmentId));
          } else {
            equipment = await firstValueFrom(panelService.getById(equipmentId));
          }

          await Promise.all([
            this.loadClients(),
            this.loadEquipmentTypes(type),
            this.loadCommunicationProtocols()
          ]);

          await this.loadPlants(equipment.clientId);
          await this.loadAreas(equipment.plantId);
          await this.loadLocations(equipment.areaId);

          patchState(store, {
            formData: {
              type,
              tag: equipment.tag,
              clientId: equipment.clientId,
              plantId: equipment.plantId,
              areaId: equipment.areaId,
              locationId: equipment.locationId,
              communicationProtocolId: equipment.communicationProtocolId,
              equipmentTypeId: type === EquipmentTypeEnum.CABINET
                ? (equipment as CabinetEntity).cabinetTypeId
                : (equipment as PanelEntity).panelTypeId,
              status: equipment.status as unknown as EquipmentStatusEnum
            },
            isLoadingEquipment: false,
            error: null
          });

        } catch (error: any) {
          console.error('❌ Error loading equipment:', error);
          patchState(store, {
            isLoadingEquipment: false,
            error: error.message || 'Error al cargar el equipo'
          });
        }
      },

      // ==================== STEPPER NAVIGATION ====================

      /**
       * Ir al siguiente step
       */
      goToNextStep(): void {
        const currentStep = store.currentStep();
        const totalSteps = store.totalSteps();

        if (currentStep < totalSteps && store.canGoNext()) {
          // Marcar step actual como completado
          const completed = new Set(store.completedSteps());
          completed.add(currentStep);

          patchState(store, {
            currentStep: currentStep + 1,
            completedSteps: completed
          });
        }
      },

      /**
       * Ir al step anterior
       */
      goToPreviousStep(): void {
        const currentStep = store.currentStep();

        if (currentStep > 1) {
          patchState(store, {
            currentStep: currentStep - 1
          });
        }
      },

      /**
       * Ir a un step específico
       */
      goToStep(step: number): void {
        const totalSteps = store.totalSteps();

        if (step >= 1 && step <= totalSteps) {
          patchState(store, {
            currentStep: step
          });
        }
      },

      // ==================== DATA LOADING ====================

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
          patchState(store, { isLoadingClients: false });
        }
      },

      async loadPlants(clientId: string): Promise<void> {
        if (!clientId) {
          patchState(store, { plants: [] });
          return;
        }

        patchState(store, { isLoadingPlants: true });

        try {
          const plants = await firstValueFrom(
            plantService.getAllByClientId(clientId)
          );

          patchState(store, {
            plants: plants.sort((a, b) => a.name.localeCompare(b.name)),
            isLoadingPlants: false
          });

        } catch (error: any) {
          console.error('❌ Error loading plants:', error);
          patchState(store, {
            plants: [],
            isLoadingPlants: false
          });
        }
      },

      async loadAreas(plantId: string): Promise<void> {
        if (!plantId) {
          patchState(store, { areas: [] });
          return;
        }

        patchState(store, { isLoadingAreas: true });

        try {
          const areas = await firstValueFrom(
            plantService.getAllAreasByPlantId(plantId)
          );

          patchState(store, {
            areas: areas.sort((a, b) => a.name.localeCompare(b.name)),
            isLoadingAreas: false
          });

        } catch (error: any) {
          console.error('❌ Error loading areas:', error);
          patchState(store, {
            areas: [],
            isLoadingAreas: false
          });
        }
      },

      async loadLocations(areaId: string): Promise<void> {
        if (!areaId) {
          patchState(store, { locations: [] });
          return;
        }

        patchState(store, { isLoadingLocations: true });

        try {
          const locations = await firstValueFrom(
            locationService.getAllByAreaId(areaId)
          );

          patchState(store, {
            locations: locations.sort((a, b) => a.name.localeCompare(b.name)),
            isLoadingLocations: false
          });

        } catch (error: any) {
          console.error('❌ Error loading locations:', error);
          patchState(store, {
            locations: [],
            isLoadingLocations: false
          });
        }
      },

      async loadEquipmentTypes(type: EquipmentTypeEnum): Promise<void> {
        patchState(store, { isLoadingTypes: true });

        try {
          if (type === EquipmentTypeEnum.CABINET) {
            const types = await firstValueFrom(cabinetTypeService.getAll());
            patchState(store, {
              cabinetTypes: types.sort((a, b) => a.name.localeCompare(b.name)),
              isLoadingTypes: false
            });
          } else {
            const types = await firstValueFrom(panelTypeService.getAll());
            patchState(store, {
              panelTypes: types.sort((a, b) => a.name.localeCompare(b.name)),
              isLoadingTypes: false
            });
          }

        } catch (error: any) {
          console.error('❌ Error loading equipment types:', error);
          patchState(store, { isLoadingTypes: false });
        }
      },

      async loadCommunicationProtocols(): Promise<void> {
        patchState(store, { isLoadingProtocols: true });

        try {
          const protocols = await firstValueFrom(
            communicationProtocolService.getAll()
          );

          patchState(store, {
            communicationProtocols: protocols.sort((a, b) => a.name.localeCompare(b.name)),
            isLoadingProtocols: false
          });

        } catch (error: any) {
          console.error('❌ Error loading protocols:', error);
          patchState(store, { isLoadingProtocols: false });
        }
      },

      // ==================== SETTERS ====================

      async setType(type: EquipmentTypeEnum): Promise<void> {
        patchState(store, (state) => ({
          formData: {
            ...state.formData,
            type,
            equipmentTypeId: null
          }
        }));

        await this.loadEquipmentTypes(type);
      },

      setTag(tag: string): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, tag }
        }));
        this.validateTag(tag);
      },

      async setClient(clientId: string): Promise<void> {
        patchState(store, (state) => ({
          formData: {
            ...state.formData,
            clientId,
            plantId: '',
            areaId: '',
            locationId: ''
          },
          plants: [],
          areas: [],
          locations: []
        }));

        if (clientId) {
          await this.loadPlants(clientId);
        }

        this.validateClient(clientId);
      },

      async setPlant(plantId: string): Promise<void> {
        patchState(store, (state) => ({
          formData: {
            ...state.formData,
            plantId,
            areaId: '',
            locationId: ''
          },
          areas: [],
          locations: []
        }));

        if (plantId) {
          await this.loadAreas(plantId);
        }

        this.validatePlant(plantId);
      },

      async setArea(areaId: string): Promise<void> {
        patchState(store, (state) => ({
          formData: {
            ...state.formData,
            areaId,
            locationId: ''
          },
          locations: []
        }));

        if (areaId) {
          await this.loadLocations(areaId);
        }

        this.validateArea(areaId);
      },

      setLocation(locationId: string): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, locationId }
        }));
        this.validateLocation(locationId);
      },

      setEquipmentType(equipmentTypeId: string): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, equipmentTypeId }
        }));
        this.validateEquipmentType(equipmentTypeId);
      },

      setCommunicationProtocol(communicationProtocolId: string | null): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, communicationProtocolId }
        }));
      },

      setStatus(status: EquipmentStatusEnum): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, status }
        }));
      },

      // ==================== VALIDATIONS ====================

      validateTag(tag: string): void {
        const errors = { ...store.validationErrors() };

        if (!tag.trim()) {
          errors.tag = 'El tag es requerido';
        } else {
          delete errors.tag;
        }

        patchState(store, { validationErrors: errors });
      },

      validateClient(clientId: string): void {
        const errors = { ...store.validationErrors() };

        if (!clientId) {
          errors.clientId = 'Debes seleccionar un cliente';
        } else {
          delete errors.clientId;
        }

        patchState(store, { validationErrors: errors });
      },

      validatePlant(plantId: string): void {
        const errors = { ...store.validationErrors() };

        if (!plantId) {
          errors.plantId = 'Debes seleccionar una planta';
        } else {
          delete errors.plantId;
        }

        patchState(store, { validationErrors: errors });
      },

      validateArea(areaId: string): void {
        const errors = { ...store.validationErrors() };

        if (!areaId) {
          errors.areaId = 'Debes seleccionar un área';
        } else {
          delete errors.areaId;
        }

        patchState(store, { validationErrors: errors });
      },

      validateLocation(locationId: string): void {
        const errors = { ...store.validationErrors() };

        if (!locationId) {
          errors.locationId = 'Debes seleccionar una ubicación';
        } else {
          delete errors.locationId;
        }

        patchState(store, { validationErrors: errors });
      },

      validateEquipmentType(equipmentTypeId: string | null): void {
        const errors = { ...store.validationErrors() };

        if (!equipmentTypeId) {
          errors.equipmentTypeId = 'Debes seleccionar un tipo';
        } else {
          delete errors.equipmentTypeId;
        }

        patchState(store, { validationErrors: errors });
      },

      // ==================== SUBMIT ====================

      async submit(): Promise<CabinetEntity | PanelEntity | null> {
        this.validateTag(store.formData().tag);
        this.validateClient(store.formData().clientId);
        this.validatePlant(store.formData().plantId);
        this.validateArea(store.formData().areaId);
        this.validateLocation(store.formData().locationId);
        this.validateEquipmentType(store.formData().equipmentTypeId);

        if (!store.canSubmit()) {
          return null;
        }

        patchState(store, {
          isSubmitting: true,
          error: null
        });

        try {
          const formData = store.formData();
          let result: CabinetEntity | PanelEntity;

          if (formData.type === EquipmentTypeEnum.CABINET) {
            const cabinetData: CabinetEntity = {
              id: store.equipmentId() || '',
              tag: formData.tag.trim(),
              clientId: formData.clientId,
              plantId: formData.plantId,
              areaId: formData.areaId,
              locationId: formData.locationId,
              communicationProtocolId: formData.communicationProtocolId,
              communicationProtocol: '',
              cabinetTypeId: formData.equipmentTypeId,
              cabinetType: '',
              status: formData.status as any,
              createdAt: new Date(),
              updatedAt: null,
              lastServiceAt: null
            };

            if (store.isEditing()) {
              result = await firstValueFrom(cabinetService.update(cabinetData));
            } else {
              result = await firstValueFrom(cabinetService.create(cabinetData));
            }
          } else {
            const panelData: PanelEntity = {
              id: store.equipmentId() || '',
              tag: formData.tag.trim(),
              clientId: formData.clientId,
              plantId: formData.plantId,
              areaId: formData.areaId,
              locationId: formData.locationId,
              communicationProtocolId: formData.communicationProtocolId,
              communicationProtocol: '',
              panelTypeId: formData.equipmentTypeId,
              panelType: '',
              status: formData.status as any,
              createdAt: new Date(),
              updatedAt: null,
              lastServiceAt: null
            };

            if (store.isEditing()) {
              result = await firstValueFrom(panelService.update(panelData));
            } else {
              result = await firstValueFrom(panelService.create(panelData));
            }
          }

          patchState(store, {
            isSubmitting: false,
            error: null
          });

          return result;

        } catch (error: any) {
          console.error('❌ Error saving equipment:', error);

          const errorMessage = error.message ||
            `Error al ${store.isEditing() ? 'actualizar' : 'crear'} el equipo`;

          patchState(store, {
            isSubmitting: false,
            error: errorMessage
          });

          return null;
        }
      },

      clearError(): void {
        patchState(store, { error: null });
      },

      reset(): void {
        patchState(store, initialState);
      }
    };
  })
);
