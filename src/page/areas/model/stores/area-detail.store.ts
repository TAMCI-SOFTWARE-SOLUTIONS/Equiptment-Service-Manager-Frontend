import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import {AreaEntity} from '../../../../entities/area/model';
import {PlantEntity, PlantService} from '../../../../entities/plant';
import {ClientEntity} from '../../../../entities/client/model';
import {LocationEntity, LocationService} from '../../../../entities/location';
import {AreaService} from '../../../../entities/area/api';
import {ClientService} from '../../../../entities/client/api';

export interface AreaDetailState {
  area: AreaEntity | null;
  plant: PlantEntity | null;
  client: ClientEntity | null;
  locations: LocationEntity[];
  isLoadingArea: boolean;
  isLoadingLocations: boolean;
  isLoadingPlant: boolean;
  isLoadingClient: boolean;
  error: string | null;
}

const initialState: AreaDetailState = {
  area: null,
  plant: null,
  client: null,
  locations: [],
  isLoadingArea: false,
  isLoadingLocations: false,
  isLoadingPlant: false,
  isLoadingClient: false,
  error: null
};

export const AreaDetailStore = signalStore(
  withState<AreaDetailState>(initialState),

  withComputed((state) => ({
    /**
     * Indica si hay datos cargados
     */
    hasData: computed(() => state.area() !== null),

    /**
     * Indica si está cargando
     */
    isLoading: computed(() =>
      state.isLoadingArea() ||
      state.isLoadingLocations() ||
      state.isLoadingPlant() ||
      state.isLoadingClient()
    ),

    /**
     * Cantidad de ubicaciones
     */
    locationsCount: computed(() => state.locations().length),

    /**
     * Indica si hay ubicaciones
     */
    hasLocations: computed(() => state.locations().length > 0)
  })),

  withMethods((store) => {
    const areaService = inject(AreaService);
    const locationService = inject(LocationService);
    const plantService = inject(PlantService);
    const clientService = inject(ClientService);

    return {
      /**
       * Cargar área, planta, cliente y ubicaciones
       */
      async loadAreaDetail(clientId: string, plantId: string, areaId: string): Promise<void> {
        patchState(store, {
          isLoadingArea: true,
          isLoadingPlant: true,
          isLoadingClient: true,
          isLoadingLocations: true,
          error: null
        });

        try {
          // 1. Cargar área
          const area = await firstValueFrom(areaService.getById(areaId));

          patchState(store, {
            area,
            isLoadingArea: false
          });

          // 2. Cargar planta (para breadcrumb)
          const plant = await firstValueFrom(plantService.getById(plantId));

          patchState(store, {
            plant,
            isLoadingPlant: false
          });

          // 3. Cargar cliente (para breadcrumb)
          const client = await firstValueFrom(clientService.getById(clientId));

          patchState(store, {
            client,
            isLoadingClient: false
          });

          // 4. Cargar ubicaciones del área
          const locations = await firstValueFrom(locationService.getAllByAreaId(areaId));

          patchState(store, {
            locations,
            isLoadingLocations: false,
            error: null
          });

        } catch (error: any) {
          console.error('❌ Error loading area detail:', error);
          patchState(store, {
            isLoadingArea: false,
            isLoadingPlant: false,
            isLoadingClient: false,
            isLoadingLocations: false,
            error: error.message || 'Error al cargar el detalle del área'
          });
        }
      },

      /**
       * Actualizar área local
       */
      updateArea(updatedArea: AreaEntity): void {
        patchState(store, { area: updatedArea });
      },

      /**
       * Agregar ubicación a la lista
       */
      addLocation(location: LocationEntity): void {
        patchState(store, (state) => ({
          locations: [...state.locations, location]
        }));
      },

      /**
       * Actualizar ubicación en la lista
       */
      updateLocation(updatedLocation: LocationEntity): void {
        patchState(store, (state) => ({
          locations: state.locations.map(l =>
            l.id === updatedLocation.id ? updatedLocation : l
          )
        }));
      },

      /**
       * Eliminar ubicación de la lista
       */
      removeLocation(locationId: string): void {
        patchState(store, (state) => ({
          locations: state.locations.filter(l => l.id !== locationId)
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
