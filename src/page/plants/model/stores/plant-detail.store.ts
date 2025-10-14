import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import {PlantEntity, PlantService} from '../../../../entities/plant';
import {ClientEntity} from '../../../../entities/client/model';
import {AreaEntity} from '../../../../entities/area/model';
import {AreaService} from '../../../../entities/area/api';
import {ClientService} from '../../../../entities/client/api';

export interface PlantDetailState {
  plant: PlantEntity | null;
  client: ClientEntity | null;
  areas: AreaEntity[];
  isLoadingPlant: boolean;
  isLoadingAreas: boolean;
  isLoadingClient: boolean;
  error: string | null;
}

const initialState: PlantDetailState = {
  plant: null,
  client: null,
  areas: [],
  isLoadingPlant: false,
  isLoadingAreas: false,
  isLoadingClient: false,
  error: null
};

export const PlantDetailStore = signalStore(
  withState<PlantDetailState>(initialState),

  withComputed((state) => ({
    /**
     * Indica si hay datos cargados
     */
    hasData: computed(() => state.plant() !== null),

    /**
     * Indica si está cargando
     */
    isLoading: computed(() =>
      state.isLoadingPlant() || state.isLoadingAreas() || state.isLoadingClient()
    ),

    /**
     * Cantidad de áreas
     */
    areasCount: computed(() => state.areas().length),

    /**
     * Indica si hay áreas
     */
    hasAreas: computed(() => state.areas().length > 0)
  })),

  withMethods((store) => {
    const plantService = inject(PlantService);
    const areaService = inject(AreaService);
    const clientService = inject(ClientService);

    return {
      /**
       * Cargar planta, cliente y áreas
       */
      async loadPlantDetail(clientId: string, plantId: string): Promise<void> {
        patchState(store, {
          isLoadingPlant: true,
          isLoadingClient: true,
          isLoadingAreas: true,
          error: null
        });

        try {
          // 1. Cargar planta
          const plant = await firstValueFrom(plantService.getById(plantId));

          patchState(store, {
            plant,
            isLoadingPlant: false
          });

          // 2. Cargar cliente (para breadcrumb)
          const client = await firstValueFrom(clientService.getById(clientId));

          patchState(store, {
            client,
            isLoadingClient: false
          });

          // 3. Cargar áreas de la planta
          const areas = await firstValueFrom(areaService.getAllByPlantId(plantId));

          patchState(store, {
            areas,
            isLoadingAreas: false,
            error: null
          });

        } catch (error: any) {
          console.error('❌ Error loading plant detail:', error);
          patchState(store, {
            isLoadingPlant: false,
            isLoadingClient: false,
            isLoadingAreas: false,
            error: error.message || 'Error al cargar el detalle de la planta'
          });
        }
      },

      /**
       * Actualizar planta local
       */
      updatePlant(updatedPlant: PlantEntity): void {
        patchState(store, { plant: updatedPlant });
      },

      /**
       * Agregar área a la lista
       */
      addArea(area: AreaEntity): void {
        patchState(store, (state) => ({
          areas: [...state.areas, area]
        }));
      },

      /**
       * Actualizar área en la lista
       */
      updateArea(updatedArea: AreaEntity): void {
        patchState(store, (state) => ({
          areas: state.areas.map(a =>
            a.id === updatedArea.id ? updatedArea : a
          )
        }));
      },

      /**
       * Eliminar área de la lista
       */
      removeArea(areaId: string): void {
        patchState(store, (state) => ({
          areas: state.areas.filter(a => a.id !== areaId)
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
