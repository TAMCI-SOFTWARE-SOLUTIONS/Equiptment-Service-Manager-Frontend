import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { ClientService } from '../../../entities/client/api';
import { ClientEntity } from '../../../entities/client/model';
import {FileService} from '../../../entities/file/api/file.service';
import {firstValueFrom} from 'rxjs';

export interface ClientWithImages extends ClientEntity {
  logoUrl?: string;
  bannerUrl?: string;
  isLoadingImages?: boolean;
}

export interface ClientsState {
  clients: ClientEntity[];
  clientsWithImages: ClientWithImages[];
  isLoading: boolean;
  error: string | null;
  selectedClientId: string | null;
}

const initialState: ClientsState = {
  clients: [],
  clientsWithImages: [],
  isLoading: false,
  error: null,
  selectedClientId: null
};

export const ClientsStore = signalStore(
  { providedIn: 'root' },
  withState<ClientsState>(initialState),

  withComputed((state) => ({
    selectedClient: computed(() => {
      const selectedId = state.selectedClientId();
      return selectedId
        ? state.clientsWithImages().find(client => client.id === selectedId) || null
        : null;
    }),

    clientsCount: computed(() => state.clients().length),

    hasClients: computed(() => state.clients().length > 0),

    isClientsLoading: computed(() => state.isLoading())
  })),

  withMethods((store) => {
    const clientService = inject(ClientService);
    const fileService = inject(FileService);

    return {
      /**
       * Cargar todos los clientes con sus imágenes
       */
      loadClients(): void {
        patchState(store, {
          isLoading: true,
          error: null
        });

        clientService.getAll().subscribe({
          next: (clients: ClientEntity[]) => {
            patchState(store, {
              clients,
              isLoading: false,
              error: null
            });

            // Cargar imágenes después de obtener los clientes
            this.loadClientsImages(clients);
          },
          error: (error: any) => {
            console.error('❌ ClientsStore - Error al cargar clientes:', error);
            patchState(store, {
              clients: [],
              clientsWithImages: [],
              isLoading: false,
              error: error.message || 'Error al cargar los clientes'
            });
          }
        });
      },

      /**
       * Charge images for a list of clients
       * @private
       */
      loadClientsImages(clients: ClientEntity[]): void {
        // Inicializar clientes con imágenes vacías
        const clientsWithImages: ClientWithImages[] = clients.map(client => ({
          ...client,
          logoUrl: undefined,
          bannerUrl: undefined,
          isLoadingImages: true
        }));

        patchState(store, { clientsWithImages });

        // Cargar cada imagen de manera asíncrona
        clients.forEach((client, index) => {
          const loadPromises: Promise<void>[] = [];

          // Cargar logo
          if (client.logoFileId) {
            const logoPromise = firstValueFrom(fileService.viewFileAsUrl(client.logoFileId))
              .then(url => {
                const updated = [...store.clientsWithImages()];
                updated[index] = { ...updated[index], logoUrl: url };
                patchState(store, { clientsWithImages: updated });
              })
              .catch(err => {
                console.warn(`⚠️ Error loading logo for ${client.name}:`, err);
              });

            loadPromises.push(logoPromise);
          }

          // Cargar banner
          if (client.bannerFileId) {
            const bannerPromise = firstValueFrom(fileService.viewFileAsUrl(client.bannerFileId))
              .then(url => {
                const updated = [...store.clientsWithImages()];
                updated[index] = { ...updated[index], bannerUrl: url };
                patchState(store, { clientsWithImages: updated });
              })
              .catch(err => {
                console.warn(`⚠️ Error loading banner for ${client.name}:`, err);
              });

            loadPromises.push(bannerPromise);
          }

          // Marcar como cargado cuando termine
          Promise.all(loadPromises).finally(() => {
            const updated = [...store.clientsWithImages()];
            updated[index] = { ...updated[index], isLoadingImages: false };
            patchState(store, { clientsWithImages: updated });
          });
        });
      },

      /**
       * Seleccionar un cliente
       */
      selectClient(clientId: string): void {
        patchState(store, { selectedClientId: clientId });
      },

      /**
       * Limpiar selección
       */
      clearSelection(): void {
        patchState(store, { selectedClientId: null });
      },

      /**
       * Limpiar error
       */
      clearError(): void {
        patchState(store, { error: null });
      },

      /**
       * Agregar cliente y cargar sus imágenes
       */
      addClient(client: ClientEntity): void {
        patchState(store, (state) => ({
          clients: [...state.clients, client]
        }));

        // Cargar imágenes del nuevo cliente
        this.loadClientsImages([...store.clients()]);
      },

      /**
       * Actualizar cliente en la lista
       */
      updateClient(updatedClient: ClientEntity): void {
        patchState(store, (state) => ({
          clients: state.clients.map(client =>
            client.id === updatedClient.id ? updatedClient : client
          )
        }));

        // Recargar imágenes por si cambiaron
        this.loadClientsImages(store.clients());
      },

      /**
       * Eliminar cliente de la lista
       */
      removeClient(clientId: string): void {
        patchState(store, (state) => ({
          clients: state.clients.filter(client => client.id !== clientId),
          clientsWithImages: state.clientsWithImages.filter(client => client.id !== clientId)
        }));
      },

      /**
       * Clean up image URLs when the component is destroyed
       */
      cleanupImageUrls(): void {
        store.clientsWithImages().forEach(client => {
          if (client.logoUrl) {
            URL.revokeObjectURL(client.logoUrl);
          }
          if (client.bannerUrl) {
            URL.revokeObjectURL(client.bannerUrl);
          }
        });

        patchState(store, {
          clientsWithImages: []
        });
      }
    };
  })
);
