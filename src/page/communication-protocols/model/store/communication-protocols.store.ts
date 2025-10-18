import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import {CommunicationProtocolEntity} from '../../../../entities/communication-protocol/model';
import {CommunicationProtocolService} from '../../../../entities/communication-protocol/api';

export interface CommunicationProtocolsState {
  protocols: CommunicationProtocolEntity[];
  isLoading: boolean;
  error: string | null;
  editingId: string | null;
  searchQuery: string;
}

const initialState: CommunicationProtocolsState = {
  protocols: [],
  isLoading: false,
  error: null,
  editingId: null,
  searchQuery: ''
};

export const CommunicationProtocolsStore = signalStore(
  { providedIn: 'root' },
  withState<CommunicationProtocolsState>(initialState),

  withComputed((state) => ({
    /**
     * Protocolos filtrados por búsqueda
     */
    filteredProtocols: computed(() => {
      const query = state.searchQuery().toLowerCase().trim();
      const protocols = state.protocols();

      if (!query) return protocols;

      return protocols.filter(protocol =>
        protocol.name.toLowerCase().includes(query)
      );
    }),

    /**
     * Cantidad total de protocolos
     */
    protocolsCount: computed(() => state.protocols().length),

    /**
     * Indica si hay protocolos
     */
    hasProtocols: computed(() => state.protocols().length > 0),

    /**
     * Indica si está editando algún protocolo
     */
    isEditing: computed(() => state.editingId() !== null)
  })),

  withMethods((store) => {
    const protocolService = inject(CommunicationProtocolService);

    return {
      /**
       * Cargar todos los protocolos
       */
      async loadProtocols(): Promise<void> {
        patchState(store, {
          isLoading: true,
          error: null
        });

        try {
          const protocols = await firstValueFrom(protocolService.getAll());

          patchState(store, {
            protocols: protocols.sort((a, b) => a.name.localeCompare(b.name)),
            isLoading: false,
            error: null
          });

        } catch (error: any) {
          console.error('❌ Error loading protocols:', error);
          patchState(store, {
            protocols: [],
            isLoading: false,
            error: error.message || 'Error al cargar los protocolos'
          });
        }
      },

      /**
       * Crear nuevo protocolo
       */
      async createProtocol(name: string): Promise<boolean> {
        if (!name.trim()) return false;

        try {
          const newProtocol: CommunicationProtocolEntity = {
            id: '',
            name: name.trim()
          };

          const created = await firstValueFrom(
            protocolService.create(newProtocol)
          );

          patchState(store, (state) => ({
            protocols: [...state.protocols, created].sort((a, b) =>
              a.name.localeCompare(b.name)
            )
          }));

          return true;

        } catch (error: any) {
          console.error('❌ Error creating protocol:', error);
          patchState(store, {
            error: error.message || 'Error al crear el protocolo'
          });
          return false;
        }
      },

      /**
       * Actualizar protocolo
       */
      async updateProtocol(id: string, name: string): Promise<boolean> {
        if (!name.trim()) return false;

        try {
          const updated: CommunicationProtocolEntity = { id, name: name.trim() };

          const result = await firstValueFrom(
            protocolService.update(updated)
          );

          patchState(store, (state) => ({
            protocols: state.protocols
              .map(p => p.id === id ? result : p)
              .sort((a, b) => a.name.localeCompare(b.name)),
            editingId: null
          }));

          return true;

        } catch (error: any) {
          console.error('❌ Error updating protocol:', error);
          patchState(store, {
            error: error.message || 'Error al actualizar el protocolo'
          });
          return false;
        }
      },

      /**
       * Eliminar protocolo
       */
      async deleteProtocol(id: string): Promise<boolean> {
        try {
          await firstValueFrom(protocolService.delete(id));

          patchState(store, (state) => ({
            protocols: state.protocols.filter(p => p.id !== id)
          }));

          return true;

        } catch (error: any) {
          console.error('❌ Error deleting protocol:', error);
          patchState(store, {
            error: error.message || 'Error al eliminar el protocolo'
          });
          return false;
        }
      },

      /**
       * Establecer protocolo en modo edición
       */
      setEditing(id: string | null): void {
        patchState(store, { editingId: id });
      },

      /**
       * Actualizar query de búsqueda
       */
      setSearchQuery(query: string): void {
        patchState(store, { searchQuery: query });
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
