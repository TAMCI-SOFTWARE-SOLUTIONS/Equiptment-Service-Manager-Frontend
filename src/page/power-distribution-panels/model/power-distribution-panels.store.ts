import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import {PowerDistributionPanelEntity} from '../../../entities/power-distribution-panel/model';
import {
  PowerDistributionPanelTypeEnum
} from '../../../entities/power-distribution-panel/model/enums/power-distribution-panel-type.enum';
import {PowerDistributionPanelService} from '../../../entities/power-distribution-panel/api';

export interface PowerDistributionPanelsState {
  panels: PowerDistributionPanelEntity[];
  selectedPanel: PowerDistributionPanelEntity | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  typeFilter: PowerDistributionPanelTypeEnum | 'ALL';
}

const initialState: PowerDistributionPanelsState = {
  panels: [],
  selectedPanel: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  typeFilter: 'ALL'
};

export const PowerDistributionPanelsStore = signalStore(
  { providedIn: 'root' },
  withState<PowerDistributionPanelsState>(initialState),

  withComputed((state) => ({
    /**
     * Paneles filtrados por búsqueda y tipo
     */
    filteredPanels: computed(() => {
      const query = state.searchQuery().toLowerCase().trim();
      const typeFilter = state.typeFilter();
      let panels = state.panels();

      // Filtrar por tipo
      if (typeFilter !== 'ALL') {
        panels = panels.filter(p => p.type === typeFilter);
      }

      // Filtrar por búsqueda (código)
      if (query) {
        panels = panels.filter(p =>
          p.code.toLowerCase().includes(query)
        );
      }

      return panels;
    }),

    /**
     * Cantidad total de paneles
     */
    totalCount: computed(() => state.panels().length),

    /**
     * Cantidad de paneles filtrados
     */
    filteredCount: computed(() => {
      const query = state.searchQuery().toLowerCase().trim();
      const typeFilter = state.typeFilter();
      let panels = state.panels();

      if (typeFilter !== 'ALL') {
        panels = panels.filter(p => p.type === typeFilter);
      }

      if (query) {
        panels = panels.filter(p =>
          p.code.toLowerCase().includes(query)
        );
      }

      return panels.length;
    }),

    /**
     * Indica si hay paneles cargados
     */
    hasPanels: computed(() => state.panels().length > 0),

    /**
     * Indica si hay resultados de búsqueda
     */
    hasSearchResults: computed(() => {
      const query = state.searchQuery().toLowerCase().trim();
      const typeFilter = state.typeFilter();
      let panels = state.panels();

      if (typeFilter !== 'ALL') {
        panels = panels.filter(p => p.type === typeFilter);
      }

      if (!query) return panels.length > 0;

      return panels.some(p =>
        p.code.toLowerCase().includes(query)
      );
    }),

    /**
     * Indica si hay filtros activos
     */
    hasActiveFilters: computed(() => {
      return state.searchQuery().trim().length > 0 || state.typeFilter() !== 'ALL';
    })
  })),

  withMethods((store) => {
    const panelService = inject(PowerDistributionPanelService);

    return {
      /**
       * Cargar todos los paneles
       */
      async loadPanels(): Promise<void> {
        patchState(store, {
          isLoading: true,
          error: null
        });

        try {
          const panels = await firstValueFrom(panelService.getAll());

          patchState(store, {
            panels: panels || [],
            isLoading: false,
            error: null
          });

        } catch (error: any) {
          console.error('❌ Error loading power distribution panels:', error);
          patchState(store, {
            panels: [],
            isLoading: false,
            error: error.message || 'Error al cargar los paneles de distribución'
          });
        }
      },

      /**
       * Actualizar búsqueda
       */
      setSearchQuery(query: string): void {
        patchState(store, { searchQuery: query });
      },

      /**
       * Actualizar filtro de tipo
       */
      setTypeFilter(type: PowerDistributionPanelTypeEnum | 'ALL'): void {
        patchState(store, { typeFilter: type });
      },

      /**
       * Limpiar búsqueda
       */
      clearSearch(): void {
        patchState(store, { searchQuery: '' });
      },

      /**
       * Limpiar filtros
       */
      clearFilters(): void {
        patchState(store, {
          searchQuery: '',
          typeFilter: 'ALL'
        });
      },

      /**
       * Seleccionar panel
       */
      selectPanel(panel: PowerDistributionPanelEntity | null): void {
        patchState(store, { selectedPanel: panel });
      },

      /**
       * Agregar panel (después de crear)
       */
      addPanel(panel: PowerDistributionPanelEntity): void {
        patchState(store, (state) => ({
          panels: [...state.panels, panel]
        }));
      },

      /**
       * Actualizar panel en la lista
       */
      updatePanel(updatedPanel: PowerDistributionPanelEntity): void {
        patchState(store, (state) => ({
          panels: state.panels.map(p =>
            p.id === updatedPanel.id ? updatedPanel : p
          )
        }));
      },

      /**
       * Eliminar panel de la lista
       */
      async removePanel(panelId: string): Promise<void> {
        patchState(store, {
          isLoading: true,
          error: null
        });

        try {
          await firstValueFrom(panelService.delete(panelId));

          patchState(store, (state) => ({
            isLoading: false,
            error: null,
            panels: state.panels.filter(p => p.id !== panelId)
          }));

          console.log('✅ Panel eliminado correctamente');

        } catch (error: any) {
          console.error('❌ Error deleting power distribution panel:', error);
          patchState(store, {
            isLoading: false,
            error: error.message || 'Error al eliminar el panel de distribución'
          });
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
