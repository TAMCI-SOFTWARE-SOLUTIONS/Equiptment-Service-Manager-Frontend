import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import {EquipmentTypeEnum, ServiceTypeEnum} from '../../../../shared/model';
import {CabinetEntity} from '../../../../entities/cabinet/model';
import {PanelEntity} from '../../../../entities/panel/model';
import {CabinetTypeEntity} from '../../../../entities/cabinet-type/model';
import {PanelTypeEntity} from '../../../../entities/panel-type/model/panel-type.entity';
import {AreaEntity} from '../../../../entities/area/model';
import {ContextStore} from '../../../../shared/model/context.store';
import {CabinetService} from '../../../../entities/cabinet/api';
import {PanelService} from '../../../../entities/panel/api';
import {CabinetTypeService} from '../../../../entities/cabinet-type/api';
import {PanelTypeService} from '../../../../entities/panel-type/api/panel-type.service';
import {AreaService} from '../../../../entities/area/api';
import {
  EquipmentPowerDistributionAssignmentEntity
} from '../../../../entities/equipment-power-distribution-assignment/model/entities/equipment-power-distribution-assignment.entity';
import {PowerDistributionPanelEntity} from '../../../../entities/power-distribution-panel/model';
import {
  EquipmentPowerDistributionAssignmentService
} from '../../../../entities/equipment-power-distribution-assignment/api';
import {PowerDistributionPanelService} from '../../../../entities/power-distribution-panel/api';

export interface CreateServiceFormData {
  // Step 1
  serviceType: ServiceTypeEnum | null;

  // Step 2
  selectedEquipmentId: string | null;
  selectedEquipmentType: EquipmentTypeEnum | null;

  // Step 3
  supervisorName: string;
}

export interface PowerAssignmentWithPanel {
  assignment: EquipmentPowerDistributionAssignmentEntity;
  panel: PowerDistributionPanelEntity | null;
  isLoadingPanel: boolean;
}

export interface CreateServiceState {
  // Current step (1, 2, 3)
  currentStep: number;
  totalSteps: number;

  // Form data
  formData: CreateServiceFormData;

  // Equipment data (Step 2)
  cabinets: CabinetEntity[];
  panels: PanelEntity[];
  cabinetTypes: CabinetTypeEntity[];
  panelTypes: PanelTypeEntity[];
  areas: AreaEntity[];

  // Search & Filters
  searchTerm: string;
  filterByAreas: AreaEntity[];
  filterByCabinetTypes: CabinetTypeEntity[];
  filterByPanelTypes: PanelTypeEntity[];

  // Loading states
  isLoadingEquipments: boolean;
  isLoadingTypes: boolean;
  isLoadingAreas: boolean;
  isSubmitting: boolean;

  // Power assignments (NEW)
  powerAssignments: PowerAssignmentWithPanel[];
  isLoadingPowerAssignments: boolean;
  powerAssignmentsError: string | null;

  // Validation
  validationErrors: {
    serviceType?: string;
    equipment?: string;
    supervisorName?: string;
  };

  error: string | null;
}

const initialState: CreateServiceState = {
  currentStep: 1,
  totalSteps: 3,
  formData: {
    serviceType: null,
    selectedEquipmentId: null,
    selectedEquipmentType: null,
    supervisorName: ''
  },
  cabinets: [],
  panels: [],
  cabinetTypes: [],
  panelTypes: [],
  areas: [],
  searchTerm: '',
  filterByAreas: [],
  filterByCabinetTypes: [],
  filterByPanelTypes: [],
  isLoadingEquipments: false,
  isLoadingTypes: false,
  isLoadingAreas: false,
  isSubmitting: false,
  powerAssignments: [],
  isLoadingPowerAssignments: false,
  powerAssignmentsError: null,
  validationErrors: {},
  error: null
};

export const CreateServiceStore = signalStore(
  withState<CreateServiceState>(initialState),

  withComputed((state) => {
    const contextStore = inject(ContextStore);

    return {
      /**
       * Step validation
       */
      isStep1Valid: computed(() => state.formData().serviceType !== null),

      isStep2Valid: computed(() => {
        const data = state.formData();
        return data.selectedEquipmentId !== null && data.selectedEquipmentType !== null;
      }),

      isStep3Valid: computed(() => {
        const name = state.formData().supervisorName.trim();
        return name.length >= 3 && Object.keys(state.validationErrors()).length === 0;
      }),

      /**
       * Navigation
       */
      canGoNext: computed(() => {
        const currentStep = state.currentStep();

        switch (currentStep) {
          case 1:
            return state.formData().serviceType !== null;
          case 2:
            return state.formData().selectedEquipmentId !== null;
          case 3:
            return state.formData().supervisorName.trim().length >= 3;
          default:
            return false;
        }
      }),

      canGoBack: computed(() => state.currentStep() > 1),

      canSubmit: computed(() => {
        const data = state.formData();
        const errors = state.validationErrors();

        return data.serviceType !== null &&
          data.selectedEquipmentId !== null &&
          data.selectedEquipmentType !== null &&
          data.supervisorName.trim().length >= 3 &&
          Object.keys(errors).length === 0 &&
          !state.isSubmitting();
      }),

      /**
       * Progress
       */
      progress: computed(() => (state.currentStep() / state.totalSteps()) * 100),

      /**
       * Equipment type from project
       */
      projectAllowedEquipmentType: computed(() => {
        const project = contextStore.project();
        if (!project) return null;

        // Retorna el primer (y único) tipo permitido
        return project.allowedEquipmentTypes[0] || null;
      }),

      showCabinets: computed(() => {
        const project = contextStore.project();
        return project?.allowedEquipmentTypes.includes(EquipmentTypeEnum.CABINET) ?? false;
      }),

      showPanels: computed(() => {
        const project = contextStore.project();
        return project?.allowedEquipmentTypes.includes(EquipmentTypeEnum.PANEL) ?? false;
      }),

      /**
       * Equipment type from project to string
       */
      projectAllowedEquipmentTypeLabel: computed(() => {
        const project = contextStore.project();
        if (!project) return '';
        const allowedType = project.allowedEquipmentTypes[0];
        if (allowedType === EquipmentTypeEnum.CABINET) {
          return 'Gabinete';
        } else if (allowedType === EquipmentTypeEnum.PANEL) {
          return 'Panele';
        } else {
          return 'Equipo';
        }
      }),

      /**
       * Filtered equipments
       */
      filteredCabinets: computed(() => {
        let cabinets = state.cabinets();
        const term = state.searchTerm().toLowerCase();
        const areas = state.filterByAreas();
        const types = state.filterByCabinetTypes();

        if (term) {
          cabinets = cabinets.filter(c => c.tag.toLowerCase().includes(term));
        }

        if (areas.length > 0) {
          const areaIds = areas.map(a => a.id);
          cabinets = cabinets.filter(c => areaIds.includes(c.areaId));
        }

        if (types.length > 0) {
          const typeCodes = types.map(t => t.code);
          cabinets = cabinets.filter(c => typeCodes.includes(c.cabinetType));
        }

        return cabinets;
      }),

      filteredPanels: computed(() => {
        let panels = state.panels();
        const term = state.searchTerm().toLowerCase();
        const areas = state.filterByAreas();
        const types = state.filterByPanelTypes();

        if (term) {
          panels = panels.filter(p => p.tag.toLowerCase().includes(term));
        }

        if (areas.length > 0) {
          const areaIds = areas.map(a => a.id);
          panels = panels.filter(p => areaIds.includes(p.areaId));
        }

        if (types.length > 0) {
          const typeCodes = types.map(t => t.code);
          panels = panels.filter(p => typeCodes.includes(p.panelType));
        }

        return panels;
      }),

      /**
       * Selected equipment (para Step 3)
       */
      selectedEquipment: computed(() => {
        const equipmentId = state.formData().selectedEquipmentId;
        const equipmentType = state.formData().selectedEquipmentType;

        if (!equipmentId || !equipmentType) return null;

        if (equipmentType === EquipmentTypeEnum.CABINET) {
          return state.cabinets().find(c => c.id === equipmentId) || null;
        } else {
          return state.panels().find(p => p.id === equipmentId) || null;
        }
      }),

      /**
       * Service type label
       */
      serviceTypeLabel: computed(() => {
        const type = state.formData().serviceType;
        if (!type) return '';

        const labels: Record<ServiceTypeEnum, string> = {
          [ServiceTypeEnum.MAINTENANCE]: 'Mantenimiento',
          [ServiceTypeEnum.INSPECTION]: 'Inspección',
          [ServiceTypeEnum.RAISE_OBSERVATION]: 'Levantamiento de Observaciones'
        };

        return labels[type];
      }),
      /**
       * Indica si hay power assignments
       */
      hasPowerAssignments: computed(() => state.powerAssignments().length > 0),

      /**
       * Circuitos formateados por assignment
       */
      getCircuitsText: computed(() => (circuits: number[]) => {
        if (!circuits || circuits.length === 0) return 'Sin circuitos';
        if (circuits.length === 30) return 'Todos (1-30)';

        const sorted = [...circuits].sort((a, b) => a - b);

        // Agrupar en rangos
        const ranges: string[] = [];
        let start = sorted[0];
        let prev = sorted[0];

        for (let i = 1; i < sorted.length; i++) {
          if (sorted[i] !== prev + 1) {
            if (start === prev) {
              ranges.push(`${start}`);
            } else {
              ranges.push(`${start}-${prev}`);
            }
            start = sorted[i];
          }
          prev = sorted[i];
        }

        if (start === prev) {
          ranges.push(`${start}`);
        } else {
          ranges.push(`${start}-${prev}`);
        }

        return ranges.join(', ');
      }),
    };
  }),

  withMethods((store) => {
    const contextStore = inject(ContextStore);
    const cabinetService = inject(CabinetService);
    const panelService = inject(PanelService);
    const cabinetTypeService = inject(CabinetTypeService);
    const panelTypeService = inject(PanelTypeService);
    const areaService = inject(AreaService);
    const powerAssignmentService = inject(EquipmentPowerDistributionAssignmentService);
    const powerPanelService = inject(PowerDistributionPanelService);

    return {
      /**
       * Initialize (cargar datos para Step 2)
       */
      async initialize(): Promise<void> {
        const project = contextStore.project();
        const client = contextStore.client();

        if (!project || !client) {
          patchState(store, {
            error: 'No hay proyecto o cliente seleccionado'
          });
          return;
        }

        // Cargar áreas del cliente
        await this.loadAreas(client.id);

        // Cargar equipos según tipo permitido
        const allowedType = project.allowedEquipmentTypes[0];

        if (allowedType === EquipmentTypeEnum.CABINET) {
          await Promise.all([
            this.loadCabinets(),
            this.loadCabinetTypes()
          ]);
        } else if (allowedType === EquipmentTypeEnum.PANEL) {
          await Promise.all([
            this.loadPanels(),
            this.loadPanelTypes()
          ]);
        }
      },

      /**
       * Load equipments
       */
      async loadCabinets(): Promise<void> {
        patchState(store, { isLoadingEquipments: true });

        try {
          const cabinets = await firstValueFrom(cabinetService.getAll());

          patchState(store, {
            cabinets: cabinets.sort((a, b) => a.tag.localeCompare(b.tag)),
            isLoadingEquipments: false
          });

        } catch (error: any) {
          console.error('❌ Error loading cabinets:', error);
          patchState(store, {
            cabinets: [],
            isLoadingEquipments: false,
            error: 'Error al cargar gabinetes'
          });
        }
      },

      async loadPanels(): Promise<void> {
        patchState(store, { isLoadingEquipments: true });

        try {
          const panels = await firstValueFrom(panelService.getAll());

          patchState(store, {
            panels: panels.sort((a, b) => a.tag.localeCompare(b.tag)),
            isLoadingEquipments: false
          });

        } catch (error: any) {
          console.error('❌ Error loading panels:', error);
          patchState(store, {
            panels: [],
            isLoadingEquipments: false,
            error: 'Error al cargar paneles'
          });
        }
      },

      async loadCabinetTypes(): Promise<void> {
        patchState(store, { isLoadingTypes: true });

        try {
          const types = await firstValueFrom(cabinetTypeService.getAll());

          patchState(store, {
            cabinetTypes: types.sort((a, b) => a.name.localeCompare(b.name)),
            isLoadingTypes: false
          });

        } catch (error: any) {
          console.error('❌ Error loading cabinet types:', error);
          patchState(store, { isLoadingTypes: false });
        }
      },

      async loadPanelTypes(): Promise<void> {
        patchState(store, { isLoadingTypes: true });

        try {
          const types = await firstValueFrom(panelTypeService.getAll());

          patchState(store, {
            panelTypes: types.sort((a, b) => a.name.localeCompare(b.name)),
            isLoadingTypes: false
          });

        } catch (error: any) {
          console.error('❌ Error loading panel types:', error);
          patchState(store, { isLoadingTypes: false });
        }
      },

      async loadAreas(clientId: string): Promise<void> {
        patchState(store, { isLoadingAreas: true });

        try {
          const areas = await firstValueFrom(areaService.getAllByClientId(clientId));

          patchState(store, {
            areas: areas.sort((a, b) => a.name.localeCompare(b.name)),
            isLoadingAreas: false
          });

        } catch (error: any) {
          console.error('❌ Error loading areas:', error);
          patchState(store, { isLoadingAreas: false });
        }
      },

      /**
       * Cargar power assignments del equipo seleccionado
       */
      async loadPowerAssignments(): Promise<void> {
        const equipmentId = store.formData().selectedEquipmentId;

        if (!equipmentId) {
          patchState(store, {
            powerAssignments: [],
            isLoadingPowerAssignments: false,
            powerAssignmentsError: null
          });
          return;
        }

        patchState(store, {
          isLoadingPowerAssignments: true,
          powerAssignmentsError: null
        });

        try {
          const assignments = await firstValueFrom(
            powerAssignmentService.getAllByEquipmentId(equipmentId)
          );

          // Crear estructura con placeholders para panels
          const assignmentsWithPanels: PowerAssignmentWithPanel[] = assignments.map(a => ({
            assignment: a,
            panel: null,
            isLoadingPanel: true
          }));

          patchState(store, {
            powerAssignments: assignmentsWithPanels,
            isLoadingPowerAssignments: false,
            powerAssignmentsError: null
          });

          // Cargar info de cada panel en paralelo
          await Promise.all(
            assignments.map((assignment, index) =>
              this.loadPanelInfo(assignment.powerDistributionPanelId, index)
            )
          );

        } catch (error: any) {
          console.error('❌ Error loading power assignments:', error);
          patchState(store, {
            powerAssignments: [],
            isLoadingPowerAssignments: false,
            powerAssignmentsError: error.message || 'Error al cargar paneles de distribución'
          });
        }
      },

      /**
       * Cargar info de un panel específico
       */
      async loadPanelInfo(panelId: string, assignmentIndex: number): Promise<void> {
        try {
          const panel = await firstValueFrom(powerPanelService.getById(panelId));

          patchState(store, (state) => {
            const updatedAssignments = [...state.powerAssignments];
            updatedAssignments[assignmentIndex] = {
              ...updatedAssignments[assignmentIndex],
              panel,
              isLoadingPanel: false
            };
            return { powerAssignments: updatedAssignments };
          });

        } catch (error: any) {
          console.error('❌ Error loading panel info:', error);

          patchState(store, (state) => {
            const updatedAssignments = [...state.powerAssignments];
            updatedAssignments[assignmentIndex] = {
              ...updatedAssignments[assignmentIndex],
              panel: null,
              isLoadingPanel: false
            };
            return { powerAssignments: updatedAssignments };
          });
        }
      },

      // ==================== STEP 1: Service Type ====================

      setServiceType(type: ServiceTypeEnum): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, serviceType: type }
        }));
      },

      // ==================== STEP 2: Equipment Selection ====================

      selectEquipment(equipmentId: string, equipmentType: EquipmentTypeEnum): void {
        patchState(store, (state) => ({
          formData: {
            ...state.formData,
            selectedEquipmentId: equipmentId,
            selectedEquipmentType: equipmentType
          }
        }));
      },

      setSearchTerm(term: string): void {
        patchState(store, { searchTerm: term });
      },

      setFilterByAreas(areas: AreaEntity[]): void {
        patchState(store, { filterByAreas: areas });
      },

      setFilterByCabinetTypes(types: CabinetTypeEntity[]): void {
        patchState(store, { filterByCabinetTypes: types });
      },

      setFilterByPanelTypes(types: PanelTypeEntity[]): void {
        patchState(store, { filterByPanelTypes: types });
      },

      clearFilters(): void {
        patchState(store, {
          searchTerm: '',
          filterByAreas: [],
          filterByCabinetTypes: [],
          filterByPanelTypes: []
        });
      },

      // ==================== STEP 3: Supervisor ====================

      setSupervisorName(name: string): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, supervisorName: name }
        }));
        this.validateSupervisorName(name);
      },

      validateSupervisorName(name: string): void {
        const errors = { ...store.validationErrors() };

        if (!name.trim()) {
          errors.supervisorName = 'El nombre del supervisor es requerido';
        } else if (name.trim().length < 3) {
          errors.supervisorName = 'Debe tener al menos 3 caracteres';
        } else if (name.trim().length > 100) {
          errors.supervisorName = 'No puede exceder 100 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) {
          errors.supervisorName = 'Solo se permiten letras y espacios';
        } else {
          delete errors.supervisorName;
        }

        patchState(store, { validationErrors: errors });
      },

      // ==================== NAVIGATION ====================

      goToNextStep(): void {
        const currentStep = store.currentStep();

        if (currentStep < store.totalSteps() && store.canGoNext()) {
          if (currentStep === 2) {
            this.loadPowerAssignments().then();
          }

          patchState(store, {
            currentStep: currentStep + 1
          });
        }
      },

      goToPreviousStep(): void {
        const currentStep = store.currentStep();

        if (currentStep > 1) {
          patchState(store, {
            currentStep: currentStep - 1
          });
        }
      },

      goToStep(step: number): void {
        if (step >= 1 && step <= store.totalSteps()) {
          patchState(store, { currentStep: step });
        }
      },

      // ==================== SUBMIT ====================

      async submit(): Promise<string | null> {
        if (!store.canSubmit()) {
          return null;
        }

        patchState(store, {
          isSubmitting: true,
          error: null
        });

        try {
          const formData = store.formData();
          const project = contextStore.project();

          if (!project) {
            throw new Error('No hay proyecto seleccionado');
          }

          const serviceData = {
            serviceType: formData.serviceType!,
            equipmentId: formData.selectedEquipmentId!,
            equipmentType: formData.selectedEquipmentType!,
            projectId: project.id,
            supervisorName: formData.supervisorName.trim()
          };

          console.log('📝 Service data to create:', serviceData);

          // TODO: Implementar servicios
          let serviceId: string;

          switch (formData.serviceType) {
            case ServiceTypeEnum.MAINTENANCE:
              // TODO: serviceId = await firstValueFrom(maintenanceService.create(serviceData));
              serviceId = 'mock-maintenance-id';
              console.log('TODO: MaintenanceService.create()', serviceData);
              break;

            case ServiceTypeEnum.INSPECTION:
              // TODO: serviceId = await firstValueFrom(inspectionService.create(serviceData));
              serviceId = 'mock-inspection-id';
              console.log('TODO: InspectionService.create()', serviceData);
              break;

            case ServiceTypeEnum.RAISE_OBSERVATION:
              // TODO: serviceId = await firstValueFrom(raiseObservationService.create(serviceData));
              serviceId = 'mock-observation-id';
              console.log('TODO: RaiseObservationService.create()', serviceData);
              break;

            default:
              throw new Error('Tipo de servicio no válido');
          }

          patchState(store, {
            isSubmitting: false,
            error: null
          });

          return serviceId;

        } catch (error: any) {
          console.error('❌ Error creating service:', error);

          patchState(store, {
            isSubmitting: false,
            error: error.message || 'Error al crear el servicio'
          });

          return null;
        }
      },

      // ==================== UTILS ====================

      clearError(): void {
        patchState(store, { error: null });
      },

      reset(): void {
        patchState(store, initialState);
      }
    };
  })
);
