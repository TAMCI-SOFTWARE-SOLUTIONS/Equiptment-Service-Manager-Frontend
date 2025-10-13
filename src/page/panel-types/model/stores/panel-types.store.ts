import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import {PanelTypeEntity} from '../../../../entities/panel-type/model/panel-type.entity';
import {PanelTypeService} from '../../../../entities/panel-type/api/panel-type.service';

export interface PanelTypesState {
  panelTypes: PanelTypeEntity[];
  selectedPanelType: PanelTypeEntity | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
}

const initialState: PanelTypesState = {
  panelTypes: [],
  selectedPanelType: null,
  isLoading: false,
  error: null,
  searchQuery: ''
};

export const PanelTypesStore = signalStore(
  { providedIn: 'root' },
  withState<PanelTypesState>(initialState),

  withComputed((state) => ({
    /**
     * Panel types filtrados por búsqueda
     */
    filteredPanelTypes: computed(() => {
      const query = state.searchQuery().toLowerCase().trim();
      const panelTypes = state.panelTypes();

      if (!query) return panelTypes;

      return panelTypes.filter(pt =>
        pt.name.toLowerCase().includes(query) ||
        pt.code.toLowerCase().includes(query)
      );
    }),

    /**
     * Cantidad total de panel types
     */
    totalCount: computed(() => state.panelTypes().length),

    /**
     * Cantidad de panel types filtrados
     */
    filteredCount: computed(() => {
      const query = state.searchQuery().toLowerCase().trim();
      const panelTypes = state.panelTypes();

      if (!query) return panelTypes.length;

      return panelTypes.filter(pt =>
        pt.name.toLowerCase().includes(query) ||
        pt.code.toLowerCase().includes(query)
      ).length;
    }),

    /**
     * Indica si hay panel types cargados
     */
    hasPanelTypes: computed(() => state.panelTypes().length > 0),

    /**
     * Indica si hay resultados de búsqueda
     */
    hasSearchResults: computed(() => {
      const query = state.searchQuery().toLowerCase().trim();
      if (!query) return true;

      return state.panelTypes().some(pt =>
        pt.name.toLowerCase().includes(query) ||
        pt.code.toLowerCase().includes(query)
      );
    })
  })),

  withMethods((store) => {
    const panelTypeService = inject(PanelTypeService);

    return {
      /**
       * Cargar todos los panel types
       */
      async loadPanelTypes(): Promise<void> {
        patchState(store, {
          isLoading: true,
          error: null
        });

        try {
          const panelTypes = await panelTypeService.getAll().toPromise();

          patchState(store, {
            panelTypes: panelTypes || [],
            isLoading: false,
            error: null
          });

        } catch (error: any) {
          console.error('❌ Error loading panel types:', error);
          patchState(store, {
            panelTypes: [],
            isLoading: false,
            error: error.message || 'Error al cargar los tipos de panel'
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
       * Limpiar búsqueda
       */
      clearSearch(): void {
        patchState(store, { searchQuery: '' });
      },

      /**
       * Seleccionar panel type
       */
      selectPanelType(panelType: PanelTypeEntity | null): void {
        patchState(store, { selectedPanelType: panelType });
      },

      /**
       * Agregar panel type (después de crear)
       */
      addPanelType(panelType: PanelTypeEntity): void {
        patchState(store, (state) => ({
          panelTypes: [...state.panelTypes, panelType]
        }));
      },

      /**
       * Actualizar panel type en la lista
       */
      updatePanelType(updatedPanelType: PanelTypeEntity): void {
        patchState(store, (state) => ({
          panelTypes: state.panelTypes.map(pt =>
            pt.id === updatedPanelType.id ? updatedPanelType : pt
          )
        }));
      },

      /**
       * Eliminar panel type de la lista
       */
      removePanelType(panelTypeId: string): void {
        patchState(store, (state) => ({
          panelTypes: state.panelTypes.filter(pt => pt.id !== panelTypeId)
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
