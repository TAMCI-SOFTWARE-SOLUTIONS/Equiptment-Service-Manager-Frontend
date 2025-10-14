import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { ClientService } from '../../../entities/client/api';
import { firstValueFrom } from 'rxjs';
import {ClientEntity} from '../../../entities/client/model';
import {PlantEntity, PlantService} from '../../../entities/plant';
import {FileService} from '../../../entities/file/api/file.service';

export interface ClientDetailState {
  client: ClientEntity | null;
  clientLogoUrl: string | null;
  clientBannerUrl: string | null;
  plants: PlantEntity[];
  isLoadingClient: boolean;
  isLoadingPlants: boolean;
  error: string | null;
}

const initialState: ClientDetailState = {
  client: null,
  clientLogoUrl: null,
  clientBannerUrl: null,
  plants: [],
  isLoadingClient: false,
  isLoadingPlants: false,
  error: null
};

export const ClientDetailStore = signalStore(
  withState<ClientDetailState>(initialState),

  withComputed((state) => ({
    /**
     * Indica si hay datos cargados
     */
    hasData: computed(() => state.client() !== null),

    /**
     * Indica si está cargando
     */
    isLoading: computed(() =>
      state.isLoadingClient() || state.isLoadingPlants()
    ),

    /**
     * Cantidad de plantas
     */
    plantsCount: computed(() => state.plants().length),

    /**
     * Indica si hay plantas
     */
    hasPlants: computed(() => state.plants().length > 0)
  })),

  withMethods((store) => {
    const clientService = inject(ClientService);
    const plantService = inject(PlantService);
    const fileService = inject(FileService);

    return {
      /**
       * Cargar cliente y sus plantas
       */
      async loadClientDetail(clientId: string): Promise<void> {
        patchState(store, {
          isLoadingClient: true,
          isLoadingPlants: true,
          error: null
        });

        try {
          // 1. Cargar cliente
          const client = await firstValueFrom(clientService.getById(clientId));

          patchState(store, {
            client,
            isLoadingClient: false
          });

          // 2. Cargar imágenes del cliente
          await this.loadClientImages(client);

          // 3. Cargar plantas del cliente
          const plants = await firstValueFrom(plantService.getAllByClientId(clientId));

          patchState(store, {
            plants,
            isLoadingPlants: false,
            error: null
          });

        } catch (error: any) {
          console.error('❌ Error loading client detail:', error);
          patchState(store, {
            isLoadingClient: false,
            isLoadingPlants: false,
            error: error.message || 'Error al cargar el detalle del cliente'
          });
        }
      },

      /**
       * Cargar imágenes del cliente (logo y banner)
       */
      async loadClientImages(client: ClientEntity): Promise<void> {
        try {
          // Cargar logo
          if (client.logoFileId) {
            const logoUrl = await firstValueFrom(
              fileService.viewFileAsUrl(client.logoFileId)
            );
            patchState(store, { clientLogoUrl: logoUrl });
          }

          // Cargar banner
          if (client.bannerFileId) {
            const bannerUrl = await firstValueFrom(
              fileService.viewFileAsUrl(client.bannerFileId)
            );
            patchState(store, { clientBannerUrl: bannerUrl });
          }
        } catch (error) {
          console.warn('⚠️ Error loading client images:', error);
        }
      },

      /**
       * Actualizar cliente local
       */
      updateClient(updatedClient: ClientEntity): void {
        patchState(store, { client: updatedClient });

        // Recargar imágenes si cambiaron
        this.loadClientImages(updatedClient).then(() => {});
      },

      /**
       * Agregar planta a la lista
       */
      addPlant(plant: PlantEntity): void {
        patchState(store, (state) => ({
          plants: [...state.plants, plant]
        }));
      },

      /**
       * Actualizar planta en la lista
       */
      updatePlant(updatedPlant: PlantEntity): void {
        patchState(store, (state) => ({
          plants: state.plants.map(p =>
            p.id === updatedPlant.id ? updatedPlant : p
          )
        }));
      },

      /**
       * Eliminar planta de la lista
       */
      removePlant(plantId: string): void {
        patchState(store, (state) => ({
          plants: state.plants.filter(p => p.id !== plantId)
        }));
      },

      /**
       * Limpiar error
       */
      clearError(): void {
        patchState(store, { error: null });
      },

      /**
       * Limpiar URL s de imágenes
       */
      cleanupImageUrls(): void {
        const logoUrl = store.clientLogoUrl();
        const bannerUrl = store.clientBannerUrl();

        if (logoUrl) URL.revokeObjectURL(logoUrl);
        if (bannerUrl) URL.revokeObjectURL(bannerUrl);

        patchState(store, {
          clientLogoUrl: null,
          clientBannerUrl: null
        });
      },

      /**
       * Reset del store
       */
      reset(): void {
        this.cleanupImageUrls();
        patchState(store, initialState);
      }
    };
  })
);
