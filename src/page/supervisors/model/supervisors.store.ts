import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import {SupervisorEntity, SupervisorService} from '../../../entities/supervisor';

export interface SupervisorsState {
  supervisors: SupervisorEntity[];
  isLoading: boolean;
  error: string | null;
  editingId: string | null;
  searchQuery: string;
}

const initialState: SupervisorsState = {
  supervisors: [],
  isLoading: false,
  error: null,
  editingId: null,
  searchQuery: ''
};

export const SupervisorsStore = signalStore(
  withState<SupervisorsState>(initialState),

  withComputed((state) => ({
    /**
     * Supervisores filtrados por búsqueda
     */
    filteredSupervisors: computed(() => {
      const query = state.searchQuery().toLowerCase().trim();
      const supervisors = state.supervisors();

      if (!query) return supervisors;

      return supervisors.filter(supervisor =>
        supervisor.fullName.toLowerCase().includes(query)
      );
    }),

    /**
     * Cantidad total de supervisores
     */
    supervisorsCount: computed(() => state.supervisors().length),

    /**
     * Indica si hay supervisores
     */
    hasSupervisors: computed(() => state.supervisors().length > 0),

    /**
     * Indica si está editando algún supervisor
     */
    isEditing: computed(() => state.editingId() !== null),

    /**
     * Indica si no hay resultados en la búsqueda
     */
    hasNoSearchResults: computed(() => {
      const filtered = state.supervisors().filter(s =>
        s.fullName.toLowerCase().includes(state.searchQuery().toLowerCase().trim())
      );
      return state.searchQuery().trim() !== '' && filtered.length === 0;
    })
  })),

  withMethods((store) => {
    const supervisorService = inject(SupervisorService);

    return {
      /**
       * Cargar todos los supervisores
       */
      async loadSupervisors(): Promise<void> {
        patchState(store, {
          isLoading: true,
          error: null
        });

        try {
          const supervisors = await firstValueFrom(supervisorService.getAll());

          patchState(store, {
            supervisors: supervisors.sort((a, b) => a.fullName.localeCompare(b.fullName)),
            isLoading: false,
            error: null
          });

        } catch (error: any) {
          console.error('❌ Error loading supervisors:', error);
          patchState(store, {
            supervisors: [],
            isLoading: false,
            error: error.message || 'Error al cargar los supervisores'
          });
        }
      },

      /**
       * Crear nuevo supervisor
       */
      async createSupervisor(fullName: string): Promise<boolean> {
        if (!fullName.trim()) return false;

        try {
          const newSupervisor: SupervisorEntity = {
            id: '',
            fullName: fullName.trim()
          };

          const created = await firstValueFrom(
            supervisorService.create(newSupervisor)
          );

          patchState(store, (state) => ({
            supervisors: [...state.supervisors, created].sort((a, b) =>
              a.fullName.localeCompare(b.fullName)
            )
          }));

          return true;

        } catch (error: any) {
          console.error('❌ Error creating supervisor:', error);
          patchState(store, {
            error: error.message || 'Error al crear el supervisor'
          });
          return false;
        }
      },

      /**
       * Actualizar supervisor
       */
      async updateSupervisor(id: string, fullName: string): Promise<boolean> {
        if (!fullName.trim()) return false;

        try {
          const updated: SupervisorEntity = { id, fullName: fullName.trim() };

          const result = await firstValueFrom(
            supervisorService.update(id, updated)
          );

          patchState(store, (state) => ({
            supervisors: state.supervisors
              .map(s => s.id === id ? result : s)
              .sort((a, b) => a.fullName.localeCompare(b.fullName)),
            editingId: null
          }));

          return true;

        } catch (error: any) {
          console.error('❌ Error updating supervisor:', error);
          patchState(store, {
            error: error.message || 'Error al actualizar el supervisor'
          });
          return false;
        }
      },

      /**
       * Eliminar supervisor
       */
      async deleteSupervisor(id: string): Promise<boolean> {
        try {
          await firstValueFrom(supervisorService.delete(id));

          patchState(store, (state) => ({
            supervisors: state.supervisors.filter(s => s.id !== id)
          }));

          return true;

        } catch (error: any) {
          console.error('❌ Error deleting supervisor:', error);
          patchState(store, {
            error: error.message || 'Error al eliminar el supervisor'
          });
          return false;
        }
      },

      /**
       * Establecer supervisor en modo edición
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
