import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { CabinetService } from '../../../entities/cabinet/api';
import { PanelService } from '../../../entities/panel/api';
import { ClientService } from '../../../entities/client/api';
import { PlantService } from '../../../entities/plant';
import { AreaService } from '../../../entities/area/api';
import { LocationService } from '../../../entities/location';
import { EquipmentEntity, cabinetToEquipment, panelToEquipment } from '../../../entities/equipment/model/equipment.entity';
import { EquipmentTypeEnum } from '../../../entities/equipment/model/equipment-type.enum';
import { EquipmentStatusEnum } from '../../../entities/equipment/model/equipment-status.enum';
import { ClientEntity } from '../../../entities/client/model';
import { PlantEntity } from '../../../entities/plant';
import { AreaEntity } from '../../../entities/area/model';
import { LocationEntity } from '../../../entities/location';
import { firstValueFrom } from 'rxjs';

export interface EquipmentsFilters {
  typeFilter: 'all' | 'cabinet' | 'panel';
  plantId: string | null;
  statusFilter: EquipmentStatusEnum | null;
  searchQuery: string;
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

  // UI State
  isLoading: boolean;
  error: string | null;
}

const initialState: EquipmentsState = {
  equipments: [],
  clientsCache: new Map(),
  plantsCache: new Map(),
  areasCache: new Map(),
  locationsCache: new Map(),
  filters: {
    typeFilter: 'all',
    plantId: null,
    statusFilter: null,
    searchQuery: ''
  },
  isLoading: false,
  error: null
};

export const EquipmentsStore = signalStore(
  { providedIn: 'root' },
  withState<EquipmentsState>(initialState),

  withComputed((state) => ({
    /**
     * Equipos filtrados
     */
    filteredEquipments: computed(() => {
      let equipments = state.equipments();
      const filters = state.filters();

      // Filtro por tipo
      if (filters.typeFilter === 'cabinet') {
        equipments = equipments.filter(e => e.type === EquipmentTypeEnum.CABINET);
      } else if (filters.typeFilter === 'panel') {
        equipments = equipments.filter(e => e.type === EquipmentTypeEnum.PANEL);
      }

      // Filtro por planta
      if (filters.plantId) {
        equipments = equipments.filter(e => e.plantId === filters.plantId);
      }

      // Filtro por estado
      if (filters.statusFilter) {
        equipments = equipments.filter(e => e.status === filters.statusFilter);
      }

      // Filtro por búsqueda (tag)
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase().trim();
        equipments = equipments.filter(e =>
          e.tag.toLowerCase().includes(query)
        );
      }

      return equipments;
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
        filters.plantId !== null ||
        filters.statusFilter !== null ||
        filters.searchQuery.trim() !== '';
    })
  })),

  withMethods((store) => {
    const cabinetService = inject(CabinetService);
    const panelService = inject(PanelService);
    const clientService = inject(ClientService);
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
          // Cargar ambos tipos en paralelo
          const [cabinets, panels] = await Promise.all([
            firstValueFrom(cabinetService.getAll()),
            firstValueFrom(panelService.getAll())
          ]);

          // Convertir a EquipmentEntity
          const cabinetEquipments = cabinets.map(cabinetToEquipment);
          const panelEquipments = panels.map(panelToEquipment);

          // Combinar y ordenar por tag
          const allEquipments = [...cabinetEquipments, ...panelEquipments]
            .sort((a, b) => a.tag.localeCompare(b.tag));

          patchState(store, {
            equipments: allEquipments,
            isLoading: false,
            error: null
          });

          // Lazy load nombres de ubicaciones
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

      /**
       * Lazy load: Cargar nombres de ubicaciones para equipos
       */
      async loadLocationNamesForEquipments(): Promise<void> {
        const equipments = store.equipments();

        // Extraer IDs únicos
        const uniquePlantIds = Array.from(new Set(equipments.map(e => e.plantId)));
        const uniqueAreaIds = Array.from(new Set(equipments.map(e => e.areaId)));
        const uniqueLocationIds = Array.from(new Set(equipments.map(e => e.locationId)));

        // Si no hay equipos, no hacer nada
        if (equipments.length === 0) return;

        try {
          // Cargar solo las entidades necesarias usando batchGet (OPTIMIZADO)
          const [plants, areas, locations] = await Promise.all([
            firstValueFrom(plantService.getAllByIds(uniquePlantIds)),
            firstValueFrom(areaService.getAllByIds(uniqueAreaIds)),
            firstValueFrom(locationService.getAllByIds(uniqueLocationIds))
          ]);

          // Crear Maps para lookup O(1)
          const plantsMap = new Map(plants.map(p => [p.id, p]));
          const areasMap = new Map(areas.map(a => [a.id, a]));
          const locationsMap = new Map(locations.map(l => [l.id, l]));

          // Actualizar caches
          patchState(store, {
            plantsCache: plantsMap,
            areasCache: areasMap,
            locationsCache: locationsMap
          });

          // Actualizar nombres en los equipos
          const updatedEquipments = equipments.map(equipment => ({
            ...equipment,
            plantName: plantsMap.get(equipment.plantId)?.name || 'Desconocida',
            areaName: areasMap.get(equipment.areaId)?.name || 'Desconocida',
            locationName: locationsMap.get(equipment.locationId)?.name || 'Desconocida'
          }));

          patchState(store, {
            equipments: updatedEquipments
          });

        } catch (error: any) {
          console.error('❌ Error loading location names:', error);
          // No bloqueamos, solo mostramos IDs si falla
        }
      },

      /**
       * Eliminar equipo
       */
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
       * Actualizar filtro de tipo
       */
      setTypeFilter(filter: 'all' | 'cabinet' | 'panel'): void {
        patchState(store, (state) => ({
          filters: { ...state.filters, typeFilter: filter }
        }));
      },

      /**
       * Actualizar filtro de planta
       */
      setPlantFilter(plantId: string | null): void {
        patchState(store, (state) => ({
          filters: { ...state.filters, plantId }
        }));
      },

      /**
       * Actualizar filtro de estado
       */
      setStatusFilter(status: EquipmentStatusEnum | null): void {
        patchState(store, (state) => ({
          filters: { ...state.filters, statusFilter: status }
        }));
      },

      /**
       * Actualizar búsqueda
       */
      setSearchQuery(query: string): void {
        patchState(store, (state) => ({
          filters: { ...state.filters, searchQuery: query }
        }));
      },

      /**
       * Limpiar todos los filtros
       */
      clearFilters(): void {
        patchState(store, (_) => ({
          filters: { ...initialState.filters }
        }));
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
