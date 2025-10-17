import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import {LocationEntity, LocationService} from '../../../../entities/location';
import {AreaEntity} from '../../../../entities/area/model';
import {PlantEntity, PlantService} from '../../../../entities/plant';
import {ClientEntity} from '../../../../entities/client/model';
import {EquipmentTypeEnum} from '../../../../shared/model';
import {AreaService} from '../../../../entities/area/api';
import {ClientService} from '../../../../entities/client/api';

export interface LocationDetailState {
  location: LocationEntity | null;
  area: AreaEntity | null;
  plant: PlantEntity | null;
  client: ClientEntity | null;
  isLoadingLocation: boolean;
  isLoadingArea: boolean;
  isLoadingPlant: boolean;
  isLoadingClient: boolean;
  error: string | null;
}

const initialState: LocationDetailState = {
  location: null,
  area: null,
  plant: null,
  client: null,
  isLoadingLocation: false,
  isLoadingArea: false,
  isLoadingPlant: false,
  isLoadingClient: false,
  error: null
};

export const LocationDetailStore = signalStore(
  withState<LocationDetailState>(initialState),

  withComputed((state) => ({
    /**
     * Indica si hay datos cargados
     */
    hasData: computed(() => state.location() !== null),

    /**
     * Indica si está cargando
     */
    isLoading: computed(() =>
      state.isLoadingLocation() ||
      state.isLoadingArea() ||
      state.isLoadingPlant() ||
      state.isLoadingClient()
    ),

    /**
     * Ruta completa de la ubicación
     */
    fullPath: computed(() => {
      const client = state.client();
      const plant = state.plant();
      const area = state.area();
      const location = state.location();

      if (!client || !plant || !area || !location) return '';

      return `${client.name} / ${plant.name} / ${area.name} / ${location.name}`;
    }),

    /**
     * Tipos de equipo permitidos en formato legible
     */
    allowedEquipmentTypesLabels: computed(() => {
      const area = state.area();
      if (!area) return [];

      const labels: Record<EquipmentTypeEnum, string> = {
        [EquipmentTypeEnum.CABINET]: 'Gabinete',
        [EquipmentTypeEnum.PANEL]: 'Panel'
      };

      return area.allowedEquipmentTypes.map(type => labels[type]);
    })
  })),

  withMethods((store) => {
    const locationService = inject(LocationService);
    const areaService = inject(AreaService);
    const plantService = inject(PlantService);
    const clientService = inject(ClientService);

    return {
      /**
       * Cargar ubicación, área, planta y cliente
       */
      async loadLocationDetail(
        clientId: string,
        plantId: string,
        areaId: string,
        locationId: string
      ): Promise<void> {
        patchState(store, {
          isLoadingLocation: true,
          isLoadingArea: true,
          isLoadingPlant: true,
          isLoadingClient: true,
          error: null
        });

        try {
          // 1. Cargar ubicación
          const location = await firstValueFrom(locationService.getById(locationId));

          patchState(store, {
            location,
            isLoadingLocation: false
          });

          // 2. Cargar área (para breadcrumb y tipos de equipo)
          const area = await firstValueFrom(areaService.getById(areaId));

          patchState(store, {
            area,
            isLoadingArea: false
          });

          // 3. Cargar planta (para breadcrumb)
          const plant = await firstValueFrom(plantService.getById(plantId));

          patchState(store, {
            plant,
            isLoadingPlant: false
          });

          // 4. Cargar cliente (para breadcrumb)
          const client = await firstValueFrom(clientService.getById(clientId));

          patchState(store, {
            client,
            isLoadingClient: false,
            error: null
          });

        } catch (error: any) {
          console.error('❌ Error loading location detail:', error);
          patchState(store, {
            isLoadingLocation: false,
            isLoadingArea: false,
            isLoadingPlant: false,
            isLoadingClient: false,
            error: error.message || 'Error al cargar el detalle de la ubicación'
          });
        }
      },

      /**
       * Actualizar ubicación local
       */
      updateLocation(updatedLocation: LocationEntity): void {
        patchState(store, { location: updatedLocation });
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
