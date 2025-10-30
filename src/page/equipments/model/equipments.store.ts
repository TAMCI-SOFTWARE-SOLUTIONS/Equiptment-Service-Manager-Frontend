import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { CabinetService } from '../../../entities/cabinet/api';
import { PanelService } from '../../../entities/panel/api';
import { PlantService } from '../../../entities/plant';
import { AreaService } from '../../../entities/area/api';
import { LocationService } from '../../../entities/location';
import { EquipmentEntity, cabinetToEquipment, panelToEquipment } from '../../../entities/equipment/model/equipment.entity';
import { EquipmentStatusEnum } from '../../../entities/equipment/model/equipment-status.enum';
import { ClientEntity } from '../../../entities/client/model';
import { PlantEntity } from '../../../entities/plant';
import { AreaEntity } from '../../../entities/area/model';
import { LocationEntity } from '../../../entities/location';
import { firstValueFrom } from 'rxjs';
import { EquipmentTypeEnum } from '../../../shared/model';

export interface DateRangeFilter {
  from: Date | null;
  to: Date | null;
}

export interface EquipmentsFilters {
  // Basic filters
  typeFilter: 'all' | 'cabinet' | 'panel';
  equipmentTypeId: string | null; // 🆕 Tipo de gabinete o panel (dinámico)
  plantId: string | null;
  areaId: string | null;
  locationId: string | null;
  statusFilter: EquipmentStatusEnum | null;
  communicationProtocolId: string | null;
  searchQuery: string;

  // Date range filters
  createdAtRange: DateRangeFilter;
  updatedAtRange: DateRangeFilter;
  lastInspectionAtRange: DateRangeFilter;
  lastMaintenanceAtRange: DateRangeFilter;
  lastRaiseObservationsAtRange: DateRangeFilter;
}

export interface EquipmentsPagination {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

export interface EquipmentsState {
  // Data
  equipments: EquipmentEntity[];

  // Lookup caches (lazy loaded)
  clientsCache: Map<string, ClientEntity>;
  plantsCache: Map<string, PlantEntity>;
  areasCache: Map<string, AreaEntity>;
  locationsCache: Map<string, LocationEntity>;

  // Filters
  filters: EquipmentsFilters;

  // Pagination
  pagination: EquipmentsPagination;

  // UI State
  isLoading: boolean;
  error: string | null;
}

// 🆕 Helper para filtrar por rango de fechas
function filterByDateRange(
  equipments: EquipmentEntity[],
  field: keyof EquipmentEntity,
  range: DateRangeFilter
): EquipmentEntity[] {
  if (!range.from && !range.to) return equipments;

  return equipments.filter(equipment => {
    const date = equipment[field];
    if (!date || !(date instanceof Date)) return true;

    if (range.from && date < range.from) return false;
    if (range.to && date > range.to) return false;

    return true;
  });
}

const initialState: EquipmentsState = {
  equipments: [],
  clientsCache: new Map(),
  plantsCache: new Map(),
  areasCache: new Map(),
  locationsCache: new Map(),
  filters: {
    typeFilter: 'all',
    equipmentTypeId: null,
    plantId: null,
    areaId: null,
    locationId: null,
    statusFilter: null,
    communicationProtocolId: null,
    searchQuery: '',
    createdAtRange: { from: null, to: null },
    updatedAtRange: { from: null, to: null },
    lastInspectionAtRange: { from: null, to: null },
    lastMaintenanceAtRange: { from: null, to: null },
    lastRaiseObservationsAtRange: { from: null, to: null }
  },
  pagination: {
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    totalItems: 0
  },
  isLoading: false,
  error: null
};

export const EquipmentsStore = signalStore(
  { providedIn: 'root' },
  withState<EquipmentsState>(initialState),

  withComputed((state) => ({
    /**
     * Aplicar TODOS los filtros
     */
    filteredEquipments: computed(() => {
      let equipments = state.equipments();
      const filters = state.filters();

      // Filtro por tipo (cabinet/panel)
      if (filters.typeFilter === 'cabinet') {
        equipments = equipments.filter(e => e.type === EquipmentTypeEnum.CABINET);
      } else if (filters.typeFilter === 'panel') {
        equipments = equipments.filter(e => e.type === EquipmentTypeEnum.PANEL);
      }

      // 🆕 Filtro por tipo de equipo (cabinetType o panelType)
      if (filters.equipmentTypeId) {
        equipments = equipments.filter(e => e.equipmentTypeId === filters.equipmentTypeId);
      }

      // Filtro por planta
      if (filters.plantId) {
        equipments = equipments.filter(e => e.plantId === filters.plantId);
      }

      // Filtro por área
      if (filters.areaId) {
        equipments = equipments.filter(e => e.areaId === filters.areaId);
      }

      // Filtro por ubicación
      if (filters.locationId) {
        equipments = equipments.filter(e => e.locationId === filters.locationId);
      }

      // Filtro por estado
      if (filters.statusFilter) {
        equipments = equipments.filter(e => e.status === filters.statusFilter);
      }

      // Filtro por protocolo
      if (filters.communicationProtocolId) {
        equipments = equipments.filter(e => e.communicationProtocolId === filters.communicationProtocolId);
      }

      // Filtro por búsqueda (tag)
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase().trim();
        equipments = equipments.filter(e =>
          e.tag.toLowerCase().includes(query)
        );
      }

      // Filtros de rango de fechas
      equipments = filterByDateRange(equipments, 'createdAt', filters.createdAtRange);
      equipments = filterByDateRange(equipments, 'updatedAt', filters.updatedAtRange);
      equipments = filterByDateRange(equipments, 'lastInspectionAt', filters.lastInspectionAtRange);
      equipments = filterByDateRange(equipments, 'lastMaintenanceAt', filters.lastMaintenanceAtRange);
      equipments = filterByDateRange(equipments, 'lastRaiseObservationsAt', filters.lastRaiseObservationsAtRange);

      return equipments;
    }),

    /**
     * Equipos paginados (CON paginación)
     */
    paginatedEquipments: computed(() => {
      const filtered = state.equipments();
      const filters = state.filters();
      const pagination = state.pagination();

      // Aplicar filtros
      let equipments = filtered;

      // Filtro por tipo
      if (filters.typeFilter === 'cabinet') {
        equipments = equipments.filter(e => e.type === EquipmentTypeEnum.CABINET);
      } else if (filters.typeFilter === 'panel') {
        equipments = equipments.filter(e => e.type === EquipmentTypeEnum.PANEL);
      }

      // 🆕 Filtro por tipo de equipo
      if (filters.equipmentTypeId) {
        equipments = equipments.filter(e => e.equipmentTypeId === filters.equipmentTypeId);
      }

      if (filters.plantId) {
        equipments = equipments.filter(e => e.plantId === filters.plantId);
      }

      if (filters.areaId) {
        equipments = equipments.filter(e => e.areaId === filters.areaId);
      }

      if (filters.locationId) {
        equipments = equipments.filter(e => e.locationId === filters.locationId);
      }

      if (filters.statusFilter) {
        equipments = equipments.filter(e => e.status === filters.statusFilter);
      }

      if (filters.communicationProtocolId) {
        equipments = equipments.filter(e => e.communicationProtocolId === filters.communicationProtocolId);
      }

      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase().trim();
        equipments = equipments.filter(e =>
          e.tag.toLowerCase().includes(query)
        );
      }

      // Filtros de fechas
      equipments = filterByDateRange(equipments, 'createdAt', filters.createdAtRange);
      equipments = filterByDateRange(equipments, 'updatedAt', filters.updatedAtRange);
      equipments = filterByDateRange(equipments, 'lastInspectionAt', filters.lastInspectionAtRange);
      equipments = filterByDateRange(equipments, 'lastMaintenanceAt', filters.lastMaintenanceAtRange);
      equipments = filterByDateRange(equipments, 'lastRaiseObservationsAt', filters.lastRaiseObservationsAtRange);

      // Calcular paginación
      const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
      const endIndex = startIndex + pagination.pageSize;

      return equipments.slice(startIndex, endIndex);
    }),

    /**
     * Información de paginación actualizada
     */
    paginationInfo: computed(() => {
      const filtered = state.equipments();
      const filters = state.filters();
      const pagination = state.pagination();

      let equipments = filtered;

      if (filters.typeFilter === 'cabinet') {
        equipments = equipments.filter(e => e.type === EquipmentTypeEnum.CABINET);
      } else if (filters.typeFilter === 'panel') {
        equipments = equipments.filter(e => e.type === EquipmentTypeEnum.PANEL);
      }

      if (filters.equipmentTypeId) {
        equipments = equipments.filter(e => e.equipmentTypeId === filters.equipmentTypeId);
      }

      if (filters.plantId) {
        equipments = equipments.filter(e => e.plantId === filters.plantId);
      }

      if (filters.areaId) {
        equipments = equipments.filter(e => e.areaId === filters.areaId);
      }

      if (filters.locationId) {
        equipments = equipments.filter(e => e.locationId === filters.locationId);
      }

      if (filters.statusFilter) {
        equipments = equipments.filter(e => e.status === filters.statusFilter);
      }

      if (filters.communicationProtocolId) {
        equipments = equipments.filter(e => e.communicationProtocolId === filters.communicationProtocolId);
      }

      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase().trim();
        equipments = equipments.filter(e =>
          e.tag.toLowerCase().includes(query)
        );
      }

      equipments = filterByDateRange(equipments, 'createdAt', filters.createdAtRange);
      equipments = filterByDateRange(equipments, 'updatedAt', filters.updatedAtRange);
      equipments = filterByDateRange(equipments, 'lastInspectionAt', filters.lastInspectionAtRange);
      equipments = filterByDateRange(equipments, 'lastMaintenanceAt', filters.lastMaintenanceAtRange);
      equipments = filterByDateRange(equipments, 'lastRaiseObservationsAt', filters.lastRaiseObservationsAtRange);

      const totalItems = equipments.length;
      const totalPages = Math.ceil(totalItems / pagination.pageSize);

      return {
        currentPage: pagination.currentPage,
        pageSize: pagination.pageSize,
        totalPages,
        totalItems,
        startItem: totalItems === 0 ? 0 : (pagination.currentPage - 1) * pagination.pageSize + 1,
        endItem: Math.min(pagination.currentPage * pagination.pageSize, totalItems)
      };
    }),

    /**
     * 🆕 Tipos de equipos únicos (dinámico según typeFilter)
     * Si typeFilter === 'cabinet' → Lista de cabinetTypes
     * Si typeFilter === 'panel' → Lista de panelTypes
     * Si typeFilter === 'all' → Lista vacía
     */
    uniqueEquipmentTypes: computed(() => {
      const equipments = state.equipments();
      const typeFilter = state.filters().typeFilter;

      // Si no hay filtro de tipo, no hay opciones
      if (typeFilter === 'all') return [];

      // Filtrar por tipo
      const filtered = equipments.filter(e => {
        if (typeFilter === 'cabinet') return e.type === EquipmentTypeEnum.CABINET;
        if (typeFilter === 'panel') return e.type === EquipmentTypeEnum.PANEL;
        return false;
      });

      // Extraer tipos únicos
      const uniqueTypes = new Map<string, string>();

      filtered.forEach(equipment => {
        console.log('Equipment:', equipment.tag, 'TypeID:', equipment.equipmentTypeId, 'TypeName:', equipment.equipmentTypeName);
        if (equipment.equipmentTypeId && equipment.equipmentTypeName) {
          uniqueTypes.set(equipment.equipmentTypeId, equipment.equipmentTypeName);
        }
      });

      // Convertir a array y ordenar
      return Array.from(uniqueTypes.entries())
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name));
    }),

    /**
     * Áreas únicas (filtradas por planta si existe)
     */
    uniqueAreas: computed(() => {
      const areasCache = state.areasCache();
      const plantId = state.filters().plantId;

      let areaIds = new Set(state.equipments().map(e => e.areaId));

      // Si hay planta seleccionada, filtrar áreas por esa planta
      if (plantId) {
        const equipmentsInPlant = state.equipments().filter(e => e.plantId === plantId);
        areaIds = new Set(equipmentsInPlant.map(e => e.areaId));
      }

      return Array.from(areaIds)
        .map(id => areasCache.get(id))
        .filter((area): area is AreaEntity => area !== undefined)
        .sort((a, b) => a.name.localeCompare(b.name));
    }),

    /**
     * Ubicaciones únicas (filtradas por área si existe)
     */
    uniqueLocations: computed(() => {
      const locationsCache = state.locationsCache();
      const areaId = state.filters().areaId;

      let locationIds = new Set(
        state.equipments()
          .map(e => e.locationId)
          .filter(id => id && id.trim() !== '')
      );

      // Si hay área seleccionada, filtrar ubicaciones por esa área
      if (areaId) {
        const equipmentsInArea = state.equipments().filter(e => e.areaId === areaId);
        locationIds = new Set(
          equipmentsInArea
            .map(e => e.locationId)
            .filter(id => id && id.trim() !== '')
        );
      }

      return Array.from(locationIds)
        .map(id => locationsCache.get(id))
        .filter((location): location is LocationEntity => location !== undefined)
        .sort((a, b) => a.name.localeCompare(b.name));
    }),

    /**
     * Protocolos únicos
     */
    uniqueProtocols: computed(() => {
      const protocols = new Map<string, string>();

      state.equipments().forEach(equipment => {
        if (equipment.communicationProtocolId && equipment.communicationProtocol) {
          protocols.set(equipment.communicationProtocolId, equipment.communicationProtocol);
        }
      });

      return Array.from(protocols.entries())
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name));
    }),

    /**
     * Contadores por tipo
     */
    totalCount: computed(() => state.equipments().length),

    cabinetCount: computed(() =>
      state.equipments().filter(e => e.type === EquipmentTypeEnum.CABINET).length
    ),

    panelCount: computed(() =>
      state.equipments().filter(e => e.type === EquipmentTypeEnum.PANEL).length
    ),

    /**
     * Plantas únicas (para el filtro)
     */
    uniquePlants: computed(() => {
      const plantsCache = state.plantsCache();
      const uniquePlantIds = new Set(state.equipments().map(e => e.plantId));

      return Array.from(uniquePlantIds)
        .map(id => plantsCache.get(id))
        .filter((plant): plant is PlantEntity => plant !== undefined)
        .sort((a, b) => a.name.localeCompare(b.name));
    }),

    /**
     * Indica si hay equipos
     */
    hasEquipments: computed(() => state.equipments().length > 0),

    /**
     * Indica si hay filtros activos
     */
    hasActiveFilters: computed(() => {
      const filters = state.filters();
      return filters.typeFilter !== 'all' ||
        filters.equipmentTypeId !== null ||
        filters.plantId !== null ||
        filters.areaId !== null ||
        filters.locationId !== null ||
        filters.statusFilter !== null ||
        filters.communicationProtocolId !== null ||
        filters.searchQuery.trim() !== '' ||
        filters.createdAtRange.from !== null ||
        filters.createdAtRange.to !== null ||
        filters.updatedAtRange.from !== null ||
        filters.updatedAtRange.to !== null ||
        filters.lastInspectionAtRange.from !== null ||
        filters.lastInspectionAtRange.to !== null ||
        filters.lastMaintenanceAtRange.from !== null ||
        filters.lastMaintenanceAtRange.to !== null ||
        filters.lastRaiseObservationsAtRange.from !== null ||
        filters.lastRaiseObservationsAtRange.to !== null;
    }),

    /**
     * Label dinámico para el filtro de tipo de equipo
     */
    equipmentTypeLabel: computed(() => {
      const typeFilter = state.filters().typeFilter;
      if (typeFilter === 'cabinet') return 'Tipo de Gabinete';
      if (typeFilter === 'panel') return 'Tipo de Panel';
      return 'Tipo de Equipo';
    })
  })),

  withMethods((store) => {
    const cabinetService = inject(CabinetService);
    const panelService = inject(PanelService);
    const plantService = inject(PlantService);
    const areaService = inject(AreaService);
    const locationService = inject(LocationService);

    return {
      /**
       * Cargar todos los equipos (Cabinets + Panels)
       */
      async loadEquipments(): Promise<void> {
        patchState(store, {
          isLoading: true,
          error: null
        });

        try {
          const [cabinets, panels] = await Promise.all([
            firstValueFrom(cabinetService.getAll()),
            firstValueFrom(panelService.getAll())
          ]);

          const cabinetEquipments = cabinets.map(cabinetToEquipment);
          const panelEquipments = panels.map(panelToEquipment);

          const allEquipments = [...cabinetEquipments, ...panelEquipments]
            .sort((a, b) => a.tag.localeCompare(b.tag));

          patchState(store, {
            equipments: allEquipments,
            isLoading: false,
            error: null
          });

          await this.loadLocationNamesForEquipments();

        } catch (error: any) {
          console.error('❌ Error loading equipments:', error);
          patchState(store, {
            equipments: [],
            isLoading: false,
            error: error.message || 'Error al cargar los equipos'
          });
        }
      },

      async loadLocationNamesForEquipments(): Promise<void> {
        const equipments = store.equipments();

        const uniquePlantIds = Array.from(new Set(equipments.map(e => e.plantId)));
        const uniqueAreaIds = Array.from(new Set(equipments.map(e => e.areaId)));
        const uniqueLocationIds = Array.from(new Set(equipments.map(e => e.locationId).filter(id => id && id.trim() !== '')));

        if (equipments.length === 0) return;

        try {
          const [plants, areas, locations] = await Promise.all([
            firstValueFrom(plantService.getAllByIds(uniquePlantIds)),
            firstValueFrom(areaService.getAllByIds(uniqueAreaIds)),
            firstValueFrom(locationService.getAllByIds(uniqueLocationIds))
          ]);

          const plantsMap = new Map(plants.map(p => [p.id, p]));
          const areasMap = new Map(areas.map(a => [a.id, a]));
          const locationsMap = new Map(locations.map(l => [l.id, l]));

          patchState(store, {
            plantsCache: plantsMap,
            areasCache: areasMap,
            locationsCache: locationsMap
          });

          const updatedEquipments = equipments.map(equipment => ({
            ...equipment,
            plantName: plantsMap.get(equipment.plantId)?.name || 'Desconocida',
            areaName: areasMap.get(equipment.areaId)?.name || 'Desconocida',
            locationName: locationsMap.get(equipment.locationId)?.name || ''
          }));

          patchState(store, {
            equipments: updatedEquipments
          });

        } catch (error: any) {
          console.error('❌ Error loading location names:', error);
        }
      },

      async deleteEquipment(equipment: EquipmentEntity): Promise<boolean> {
        try {
          if (equipment.type === EquipmentTypeEnum.CABINET) {
            await firstValueFrom(cabinetService.delete(equipment.id));
          } else {
            await firstValueFrom(panelService.delete(equipment.id));
          }

          patchState(store, (state) => ({
            equipments: state.equipments.filter(e => e.id !== equipment.id)
          }));

          return true;

        } catch (error: any) {
          console.error('❌ Error deleting equipment:', error);
          patchState(store, {
            error: error.message || 'Error al eliminar el equipo'
          });
          return false;
        }
      },

      /**
       * Actualizar filtro de tipo (y resetear equipmentTypeId)
       */
      setTypeFilter(filter: 'all' | 'cabinet' | 'panel'): void {
        patchState(store, (state) => ({
          filters: {
            ...state.filters,
            typeFilter: filter,
            equipmentTypeId: null // 🆕 Reset tipo de equipo al cambiar tipo
          },
          pagination: { ...state.pagination, currentPage: 1 }
        }));
      },

      /**
       * 🆕 Actualizar filtro de tipo de equipo (cabinetType o panelType)
       */
      setEquipmentTypeFilter(equipmentTypeId: string | null): void {
        patchState(store, (state) => ({
          filters: { ...state.filters, equipmentTypeId },
          pagination: { ...state.pagination, currentPage: 1 }
        }));
      },

      setPlantFilter(plantId: string | null): void {
        patchState(store, (state) => ({
          filters: {
            ...state.filters,
            plantId,
            areaId: null, // Reset área al cambiar planta
            locationId: null // Reset ubicación al cambiar planta
          },
          pagination: { ...state.pagination, currentPage: 1 }
        }));
      },

      setAreaFilter(areaId: string | null): void {
        patchState(store, (state) => ({
          filters: {
            ...state.filters,
            areaId,
            locationId: null // Reset ubicación al cambiar área
          },
          pagination: { ...state.pagination, currentPage: 1 }
        }));
      },

      setLocationFilter(locationId: string | null): void {
        patchState(store, (state) => ({
          filters: { ...state.filters, locationId },
          pagination: { ...state.pagination, currentPage: 1 }
        }));
      },

      setStatusFilter(status: EquipmentStatusEnum | null): void {
        patchState(store, (state) => ({
          filters: { ...state.filters, statusFilter: status },
          pagination: { ...state.pagination, currentPage: 1 }
        }));
      },

      setProtocolFilter(communicationProtocolId: string | null): void {
        patchState(store, (state) => ({
          filters: { ...state.filters, communicationProtocolId },
          pagination: { ...state.pagination, currentPage: 1 }
        }));
      },

      setSearchQuery(query: string): void {
        patchState(store, (state) => ({
          filters: { ...state.filters, searchQuery: query },
          pagination: { ...state.pagination, currentPage: 1 }
        }));
      },

      clearSearchQuery(): void {
        patchState(store, (state) => ({
          filters: { ...state.filters, searchQuery: "" },
          pagination: { ...state.pagination, currentPage: 1 }
        }));
      },

      /**
       * 🆕 Filtros de rango de fechas
       */
      setCreatedAtRange(range: DateRangeFilter): void {
        patchState(store, (state) => ({
          filters: { ...state.filters, createdAtRange: range },
          pagination: { ...state.pagination, currentPage: 1 }
        }));
      },

      setUpdatedAtRange(range: DateRangeFilter): void {
        patchState(store, (state) => ({
          filters: { ...state.filters, updatedAtRange: range },
          pagination: { ...state.pagination, currentPage: 1 }
        }));
      },

      setLastInspectionAtRange(range: DateRangeFilter): void {
        patchState(store, (state) => ({
          filters: { ...state.filters, lastInspectionAtRange: range },
          pagination: { ...state.pagination, currentPage: 1 }
        }));
      },

      setLastMaintenanceAtRange(range: DateRangeFilter): void {
        patchState(store, (state) => ({
          filters: { ...state.filters, lastMaintenanceAtRange: range },
          pagination: { ...state.pagination, currentPage: 1 }
        }));
      },

      setLastRaiseObservationsAtRange(range: DateRangeFilter): void {
        patchState(store, (state) => ({
          filters: { ...state.filters, lastRaiseObservationsAtRange: range },
          pagination: { ...state.pagination, currentPage: 1 }
        }));
      },

      setPage(page: number): void {
        const info = store.paginationInfo();
        if (page < 1 || page > info.totalPages) return;

        patchState(store, (state) => ({
          pagination: { ...state.pagination, currentPage: page }
        }));
      },

      setPageSize(pageSize: number): void {
        patchState(store, (state) => ({
          pagination: {
            ...state.pagination,
            pageSize,
            currentPage: 1
          }
        }));
      },

      previousPage(): void {
        const currentPage = store.pagination().currentPage;
        if (currentPage > 1) {
          this.setPage(currentPage - 1);
        }
      },

      nextPage(): void {
        const info = store.paginationInfo();
        if (info.currentPage < info.totalPages) {
          this.setPage(info.currentPage + 1);
        }
      },

      clearFilters(): void {
        patchState(store, (_) => ({
          filters: { ...initialState.filters },
          pagination: { ...initialState.pagination }
        }));
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
