import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import {CabinetTypeEntity} from '../../../../entities/cabinet-type/model';
import {CabinetTypeService} from '../../../../entities/cabinet-type/api';
import {firstValueFrom} from 'rxjs';

export interface CabinetTypesState {
  cabinetTypes: CabinetTypeEntity[];
  selectedCabinetType: CabinetTypeEntity | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
}

const initialState: CabinetTypesState = {
  cabinetTypes: [],
  selectedCabinetType: null,
  isLoading: false,
  error: null,
  searchQuery: ''
};

export const CabinetTypesStore = signalStore(
  { providedIn: 'root' },
  withState<CabinetTypesState>(initialState),

  withComputed((state) => ({
    /**
     * Cabinet types filtrados por búsqueda
     */
    filteredCabinetTypes: computed(() => {
      const query = state.searchQuery().toLowerCase().trim();
      const cabinetTypes = state.cabinetTypes();

      if (!query) return cabinetTypes;

      return cabinetTypes.filter(ct =>
        ct.name.toLowerCase().includes(query) ||
        ct.code.toLowerCase().includes(query)
      );
    }),

    /**
     * Cantidad total de cabinet types
     */
    totalCount: computed(() => state.cabinetTypes().length),

    /**
     * Cantidad de cabinet types filtrados
     */
    filteredCount: computed(() => {
      const query = state.searchQuery().toLowerCase().trim();
      const cabinetTypes = state.cabinetTypes();

      if (!query) return cabinetTypes.length;

      return cabinetTypes.filter(ct =>
        ct.name.toLowerCase().includes(query) ||
        ct.code.toLowerCase().includes(query)
      ).length;
    }),

    /**
     * Indica si hay cabinet types cargados
     */
    hasCabinetTypes: computed(() => state.cabinetTypes().length > 0),

    /**
     * Indica si hay resultados de búsqueda
     */
    hasSearchResults: computed(() => {
      const query = state.searchQuery().toLowerCase().trim();
      if (!query) return true;

      return state.cabinetTypes().some(ct =>
        ct.name.toLowerCase().includes(query) ||
        ct.code.toLowerCase().includes(query)
      );
    })
  })),

  withMethods((store) => {
    const cabinetTypeService = inject(CabinetTypeService);

    return {
      /**
       * Cargar todos los cabinet types
       */
      async loadCabinetTypes(): Promise<void> {
        patchState(store, {
          isLoading: true,
          error: null
        });

        try {
          const cabinetTypes = await firstValueFrom(cabinetTypeService.getAll());

          patchState(store, {
            cabinetTypes: cabinetTypes || [],
            isLoading: false,
            error: null
          });

        } catch (error: any) {
          console.error('❌ Error loading cabinet types:', error);
          patchState(store, {
            cabinetTypes: [],
            isLoading: false,
            error: error.message || 'Error al cargar los tipos de gabinete'
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
       * Seleccionar cabinet type
       */
      selectCabinetType(cabinetType: CabinetTypeEntity | null): void {
        patchState(store, { selectedCabinetType: cabinetType });
      },

      /**
       * Agregar cabinet type (después de crear)
       */
      addCabinetType(cabinetType: CabinetTypeEntity): void {
        patchState(store, (state) => ({
          cabinetTypes: [...state.cabinetTypes, cabinetType]
        }));
      },

      /**
       * Actualizar cabinet type en la lista
       */
      updateCabinetType(updatedCabinetType: CabinetTypeEntity): void {
        patchState(store, (state) => ({
          cabinetTypes: state.cabinetTypes.map(ct =>
            ct.id === updatedCabinetType.id ? updatedCabinetType : ct
          )
        }));
      },

      /**
       * Eliminar cabinet type de la lista
       */
      removeCabinetType(cabinetTypeId: string): void {
        patchState(store, (state) => ({
          cabinetTypes: state.cabinetTypes.filter(ct => ct.id !== cabinetTypeId)
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
