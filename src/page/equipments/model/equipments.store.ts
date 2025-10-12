import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { CabinetService } from '../../../entities/cabinet/api';
import { PanelService } from '../../../entities/panel/api/panel.service';
import { ClientService } from '../../../entities/client/api';
import { ProjectService } from '../../../entities/project/api/project.service';
import { CabinetEntity } from '../../../entities/cabinet/model';
import { PanelEntity } from '../../../entities/panel/model';
import { ClientEntity } from '../../../entities/client/model';
import { EquipmentTypeEnum } from '../../../shared/model';
import { firstValueFrom } from 'rxjs';
import {ProjectEntity} from '../../../entities/project/model/project.entity';

export interface EquipmentWithMetadata {
  id: string;
  type: EquipmentTypeEnum;
  tag: string;
  location: string;
  status: string;
  plantId: string;
  areaId: string;
  communicationProtocol: string;
  createdAt: Date;
  updatedAt: Date | null;
  lastServiceAt: Date | null;
  // Metadata adicional
  clientName?: string;
  projectName?: string;
  areaName?: string;
  equipmentTypeName?: string;
}

export interface EquipmentsState {
  cabinets: CabinetEntity[];
  panels: PanelEntity[];
  clients: ClientEntity[];
  projects: ProjectEntity[];
  equipmentsWithMetadata: EquipmentWithMetadata[];
  isLoading: boolean;
  error: string | null;
  selectedEquipmentId: string | null;
  searchQuery: string;
  selectedEquipmentType: EquipmentTypeEnum | null;
}

const initialState: EquipmentsState = {
  cabinets: [],
  panels: [],
  clients: [],
  projects: [],
  equipmentsWithMetadata: [],
  isLoading: false,
  error: null,
  selectedEquipmentId: null,
  searchQuery: '',
  selectedEquipmentType: null
};

export const EquipmentsStore = signalStore(
  { providedIn: 'root' },
  withState<EquipmentsState>(initialState),

  withComputed((state) => ({
    selectedEquipment: computed(() => {
      const selectedId = state.selectedEquipmentId();
      return selectedId
        ? state.equipmentsWithMetadata().find(equipment => equipment.id === selectedId) || null
        : null;
    }),

    equipmentsCount: computed(() => state.equipmentsWithMetadata().length),

    hasEquipments: computed(() => state.equipmentsWithMetadata().length > 0),

    isEquipmentsLoading: computed(() => state.isLoading()),

    filteredEquipments: computed(() => {
      const query = state.searchQuery().toLowerCase().trim();
      const selectedType = state.selectedEquipmentType();
      let equipments = state.equipmentsWithMetadata();

      // Filtrar por tipo de equipo si está seleccionado
      if (selectedType) {
        equipments = equipments.filter(eq => eq.type === selectedType);
      }

      // Filtrar por búsqueda
      if (query) {
        equipments = equipments.filter(equipment =>
          equipment.tag.toLowerCase().includes(query) ||
          equipment.location.toLowerCase().includes(query) ||
          equipment.clientName?.toLowerCase().includes(query) ||
          equipment.projectName?.toLowerCase().includes(query)
        );
      }

      return equipments;
    }),

    uniqueEquipmentTypes: computed(() => {
      const types = new Set(state.equipmentsWithMetadata().map(eq => eq.type));
      return Array.from(types);
    }),

    equipmentsByType: computed(() => {
      const equipments = state.equipmentsWithMetadata();
      return equipments.reduce((acc, equipment) => {
        if (!acc[equipment.type]) {
          acc[equipment.type] = [];
        }
        acc[equipment.type].push(equipment);
        return acc;
      }, {} as Record<EquipmentTypeEnum, EquipmentWithMetadata[]>);
    })
  })),

  withMethods((store) => {
    const cabinetService = inject(CabinetService);
    const panelService = inject(PanelService);
    const clientService = inject(ClientService);
    const projectService = inject(ProjectService);

    return {
      /**
       * Cargar todos los datos necesarios (equipments, clients, projects)
       */
      loadAllData(): void {
        patchState(store, {
          isLoading: true,
          error: null
        });

        // Cargar datos en paralelo
        Promise.all([
          this.loadClients(),
          this.loadProjects(),
          this.loadCabinets(),
          this.loadPanels()
        ]).then(() => {
          this.buildEquipmentsWithMetadata();
          patchState(store, { isLoading: false });
        }).catch((error) => {
          console.error('❌ EquipmentsStore - Error al cargar datos:', error);
          patchState(store, {
            isLoading: false,
            error: error.message || 'Error al cargar los equipos'
          });
        });
      },

      /**
       * Cargar clientes
       */
      async loadClients(): Promise<ClientEntity[]> {
        try {
          const clients = await firstValueFrom(clientService.getAll());
          patchState(store, {clients});
          return clients;
        } catch (error) {
          console.error('Error loading clients:', error);
          return [];
        }
      },

      /**
       * Cargar proyectos
       */
      async loadProjects(): Promise<ProjectEntity[]> {
        try {
          const projects = await firstValueFrom(projectService.getAll());
          patchState(store, {projects});
          return projects;
        } catch (error) {
          console.error('Error loading projects:', error);
          return [];
        }
      },

      /**
       * Cargar cabinets
       */
      async loadCabinets(): Promise<CabinetEntity[]> {
        try {
          const cabinets = await firstValueFrom(cabinetService.getAll());
          patchState(store, {cabinets});
          return cabinets;
        } catch (error) {
          console.error('Error loading cabinets:', error);
          return [];
        }
      },

      /**
       * Cargar panels
       */
      async loadPanels(): Promise<PanelEntity[]> {
        try {
          const panels = await firstValueFrom(panelService.getAll());
          patchState(store, {panels});
          return panels;
        } catch (error) {
          console.error('Error loading panels:', error);
          return [];
        }
      },

      /**
       * Construir equipos con metadata enriquecida
       */
      buildEquipmentsWithMetadata(): void {
        const cabinets = store.cabinets();
        const panels = store.panels();
        const clients = store.clients();
        const projects = store.projects();

        const cabinetsWithMetadata: EquipmentWithMetadata[] = cabinets.map(cabinet => {
          const project = projects.find(p => p.id === cabinet.plantId);
          const client = project ? clients.find(c => c.id === project.clientId) : null;

          return {
            id: cabinet.id,
            type: EquipmentTypeEnum.CABINET,
            tag: cabinet.tag,
            location: cabinet.location,
            status: cabinet.status,
            plantId: cabinet.plantId,
            areaId: cabinet.areaId,
            communicationProtocol: cabinet.communicationProtocol,
            createdAt: cabinet.createdAt,
            updatedAt: cabinet.updatedAt,
            lastServiceAt: cabinet.lastServiceAt,
            clientName: client?.name,
            projectName: project?.name,
            areaName: `Área ${cabinet.areaId.substring(0, 8)}`,
            equipmentTypeName: 'Cabinet'
          };
        });

        const panelsWithMetadata: EquipmentWithMetadata[] = panels.map(panel => {
          const project = projects.find(p => p.id === panel.plantId);
          const client = project ? clients.find(c => c.id === project.clientId) : null;

          return {
            id: panel.id,
            type: EquipmentTypeEnum.PANEL,
            tag: panel.tag,
            location: panel.location,
            status: panel.status,
            plantId: panel.plantId,
            areaId: panel.areaId,
            communicationProtocol: panel.communicationProtocol,
            createdAt: panel.createdAt,
            updatedAt: panel.updatedAt,
            lastServiceAt: panel.lastServiceAt,
            clientName: client?.name,
            projectName: project?.name,
            areaName: `Área ${panel.areaId.substring(0, 8)}`,
            equipmentTypeName: 'Panel'
          };
        });

        const allEquipments = [...cabinetsWithMetadata, ...panelsWithMetadata];

        patchState(store, {
          equipmentsWithMetadata: allEquipments
        });
      },

      /**
       * Seleccionar un equipo
       */
      selectEquipment(equipmentId: string): void {
        patchState(store, { selectedEquipmentId: equipmentId });
      },

      /**
       * Limpiar selección
       */
      clearSelection(): void {
        patchState(store, { selectedEquipmentId: null });
      },

      /**
       * Establecer búsqueda
       */
      setSearchQuery(query: string): void {
        patchState(store, { searchQuery: query });
      },

      /**
       * Establecer filtro por tipo de equipo
       */
      setEquipmentTypeFilter(equipmentType: EquipmentTypeEnum | null): void {
        patchState(store, { selectedEquipmentType: equipmentType });
      },

      /**
       * Limpiar filtros
       */
      clearFilters(): void {
        patchState(store, {
          searchQuery: '',
          selectedEquipmentType: null
        });
      },

      /**
       * Limpiar error
       */
      clearError(): void {
        patchState(store, { error: null });
      },

      /**
       * Agregar cabinet y actualizar metadata
       */
      addCabinet(cabinet: CabinetEntity): void {
        patchState(store, (state) => ({
          cabinets: [...state.cabinets, cabinet]
        }));

        // Recalcular metadata
        this.buildEquipmentsWithMetadata();
      },

      /**
       * Agregar panel y actualizar metadata
       */
      addPanel(panel: PanelEntity): void {
        patchState(store, (state) => ({
          panels: [...state.panels, panel]
        }));

        // Recalcular metadata
        this.buildEquipmentsWithMetadata();
      },

      /**
       * Actualizar cabinet
       */
      updateCabinet(updatedCabinet: CabinetEntity): void {
        patchState(store, (state) => ({
          cabinets: state.cabinets.map(cabinet =>
            cabinet.id === updatedCabinet.id ? updatedCabinet : cabinet
          )
        }));

        // Recalcular metadata
        this.buildEquipmentsWithMetadata();
      },

      /**
       * Actualizar panel
       */
      updatePanel(updatedPanel: PanelEntity): void {
        patchState(store, (state) => ({
          panels: state.panels.map(panel =>
            panel.id === updatedPanel.id ? updatedPanel : panel
          )
        }));

        // Recalcular metadata
        this.buildEquipmentsWithMetadata();
      },

      /**
       * Eliminar cabinet
       */
      removeCabinet(cabinetId: string): void {
        patchState(store, (state) => ({
          cabinets: state.cabinets.filter(cabinet => cabinet.id !== cabinetId),
          equipmentsWithMetadata: state.equipmentsWithMetadata.filter(eq => eq.id !== cabinetId)
        }));
      },

      /**
       * Eliminar panel
       */
      removePanel(panelId: string): void {
        patchState(store, (state) => ({
          panels: state.panels.filter(panel => panel.id !== panelId),
          equipmentsWithMetadata: state.equipmentsWithMetadata.filter(eq => eq.id !== panelId)
        }));
      }
    };
  })
);
