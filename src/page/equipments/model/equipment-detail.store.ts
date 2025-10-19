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
import { ClientEntity } from '../../../entities/client/model';
import { PlantEntity } from '../../../entities/plant';
import { AreaEntity } from '../../../entities/area/model';
import { LocationEntity } from '../../../entities/location';
import { firstValueFrom } from 'rxjs';

export interface EquipmentDetailState {
  equipment: EquipmentEntity | null;

  // Location details (loaded separately)
  client: ClientEntity | null;
  plant: PlantEntity | null;
  area: AreaEntity | null;
  location: LocationEntity | null;

  // Loading states
  isLoading: boolean;
  isLoadingLocation: boolean;
  isDeleting: boolean;

  error: string | null;
}

const initialState: EquipmentDetailState = {
  equipment: null,
  client: null,
  plant: null,
  area: null,
  location: null,
  isLoading: false,
  isLoadingLocation: false,
  isDeleting: false,
  error: null
};

export const EquipmentDetailStore = signalStore(
  withState<EquipmentDetailState>(initialState),

  withComputed((state) => ({
    /**
     * Indica si hay equipo cargado
     */
    hasEquipment: computed(() => state.equipment() !== null),

    /**
     * Tipo de equipo como texto
     */
    equipmentTypeLabel: computed(() => {
      const equipment = state.equipment();
      if (!equipment) return '';
      return equipment.type === EquipmentTypeEnum.CABINET ? 'Gabinete' : 'Tablero';
    }),

    /**
     * Ubicación completa como texto
     */
    fullLocation: computed(() => {
      const client = state.client();
      const plant = state.plant();
      const area = state.area();
      const location = state.location();

      if (!client || !plant || !area || !location) return '';

      return `${client.name} • ${plant.name} • ${area.name} • ${location.name}`;
    }),

    /**
     * Breadcrumb de ubicación
     */
    locationBreadcrumb: computed(() => {
      const client = state.client();
      const plant = state.plant();
      const area = state.area();
      const location = state.location();

      return {
        client: client?.name || 'Cargando...',
        plant: plant?.name || 'Cargando...',
        area: area?.name || 'Cargando...',
        location: location?.name || 'Cargando...'
      };
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
       * Cargar equipo por ID y tipo
       */
      async loadEquipment(equipmentId: string, type: EquipmentTypeEnum): Promise<void> {
        patchState(store, {
          isLoading: true,
          error: null
        });

        try {
          let equipment: EquipmentEntity;

          if (type === EquipmentTypeEnum.CABINET) {
            const cabinet = await firstValueFrom(cabinetService.getById(equipmentId));
            equipment = cabinetToEquipment(cabinet);
          } else {
            const panel = await firstValueFrom(panelService.getById(equipmentId));
            equipment = panelToEquipment(panel);
          }

          patchState(store, {
            equipment,
            isLoading: false,
            error: null
          });

          // Cargar detalles de ubicación
          this.loadLocationDetails(equipment);

        } catch (error: any) {
          console.error('❌ Error loading equipment:', error);
          patchState(store, {
            equipment: null,
            isLoading: false,
            error: error.message || 'Error al cargar el equipo'
          });
        }
      },

      /**
       * Cargar detalles de ubicación (cliente, planta, área, ubicación)
       */
      async loadLocationDetails(equipment: EquipmentEntity): Promise<void> {
        patchState(store, { isLoadingLocation: true });

        try {
          const [client, plant, area, location] = await Promise.all([
            firstValueFrom(clientService.getById(equipment.clientId)),
            firstValueFrom(plantService.getById(equipment.plantId)),
            firstValueFrom(areaService.getById(equipment.areaId)),
            firstValueFrom(locationService.getById(equipment.locationId))
          ]);

          patchState(store, {
            client,
            plant,
            area,
            location,
            isLoadingLocation: false
          });

        } catch (error: any) {
          console.error('❌ Error loading location details:', error);
          patchState(store, { isLoadingLocation: false });
        }
      },

      /**
       * Eliminar equipo
       */
      async deleteEquipment(): Promise<boolean> {
        const equipment = store.equipment();
        if (!equipment) return false;

        patchState(store, {
          isDeleting: true,
          error: null
        });

        try {
          if (equipment.type === EquipmentTypeEnum.CABINET) {
            await firstValueFrom(cabinetService.delete(equipment.id));
          } else {
            await firstValueFrom(panelService.delete(equipment.id));
          }

          patchState(store, {
            isDeleting: false,
            error: null
          });

          return true;

        } catch (error: any) {
          console.error('❌ Error deleting equipment:', error);
          patchState(store, {
            isDeleting: false,
            error: error.message || 'Error al eliminar el equipo'
          });

          return false;
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
