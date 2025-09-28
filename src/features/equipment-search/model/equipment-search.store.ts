import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import {ProjectEntity} from '../../../entities/project/model/project.entity';
import {CabinetEntity} from '../../../entities/cabinet/model';
import {computed} from '@angular/core';
import {CabinetTypeEntity} from '../../../entities/cabinet-type/model';
import {AreaEntity} from '../../../entities/area/model';
import {PanelEntity} from '../../../entities/panel/model';
import {PanelTypeEntity} from '../../../entities/panel-type/model';

interface EquipmentSearchState {
  searchTerm: string;
  isLoading: boolean;
  error: string | null;
  project: ProjectEntity | null;
  areas: AreaEntity[];
  filterByAreas: AreaEntity[];

  cabinets: CabinetEntity[];
  selectedCabinet: CabinetEntity | null;
  cabinetsTypes: CabinetTypeEntity[];
  filterByCabinetTypes: CabinetTypeEntity[];

  panels: PanelEntity[];
  selectedPanel: PanelEntity | null;
  panelsTypes: PanelTypeEntity[];
  filterByPanelTypes: PanelTypeEntity[];
}

const initialState: EquipmentSearchState = {
  searchTerm: '',
  isLoading: false,
  error: null,
  project: null,
  areas: [],
  filterByAreas: [],
  cabinets: [],
  selectedCabinet: null,
  cabinetsTypes: [],
  filterByCabinetTypes: [],
  panels: [],
  selectedPanel: null,
  panelsTypes: [],
  filterByPanelTypes: []
}

export const EquipmentSearchStore = signalStore(
  withState(initialState),
  withComputed((state) => ({
    hasProject: computed(() => state.project() != null),
    cabinetsCount: computed(() => state.cabinets().length),
    isSearchActive: computed(() => state.searchTerm().length > 0),
    filteredCabinets: computed(() => {
      let cabinets = state.cabinets();
      const term = state.searchTerm().toLowerCase();
      const areas = state.filterByAreas();
      const types = state.filterByCabinetTypes();

      if (term) {
        cabinets = cabinets.filter(cabinet => cabinet.tag.toLowerCase().includes(term));
      }

      if (areas && areas.length > 0) {
        const areaIds = areas.map(a => a.id);
        cabinets = cabinets.filter(cabinet => areaIds.includes(cabinet.areaId));
      }

      if (types && types.length > 0) {
        const typeCodes = types.map(t => t.code);
        cabinets = cabinets.filter(cabinet => typeCodes.includes(cabinet.cabinetType));
      }

      return cabinets;
    })
  })),
  withMethods((store) => ({
    activateLoading: () => patchState(store, { isLoading: true }),
    deactivateLoading: () => patchState(store, { isLoading: false }),
    setError: (error: string | null) => patchState(store, { error, isLoading: false }),
    setSearchTerm: (term: string) => patchState(store, {searchTerm: term}),
    setProject: (project: ProjectEntity) => patchState(store, { project, isLoading: false, error: null}),
    setAreas: (areas: AreaEntity[]) => patchState(store, { areas, isLoading: false, error: null}),
    setFilterByAreas: (areas: AreaEntity[]) => patchState(store, { filterByAreas: areas }),
    setCabinets: (cabinets: CabinetEntity[]) => patchState(store, { cabinets, isLoading: false, error: null}),
    setSelectedCabinet: (cabinet: CabinetEntity | null) => patchState(store, { selectedCabinet: cabinet }),
    setCabinetsTypes: (types: CabinetTypeEntity[]) => patchState(store, { cabinetsTypes: types, isLoading: false, error: null}),
    setFilterByCabinetTypes: (types: CabinetTypeEntity[]) => patchState(store, { filterByCabinetTypes: types }),
    setPanels: (panels: PanelEntity[]) => patchState(store, { panels, isLoading: false, error: null}),
    setSelectedPanel: (panel: PanelEntity | null) => patchState(store, { selectedPanel: panel }),
    setPanelsTypes: (types: PanelTypeEntity[]) => patchState(store, { panelsTypes: types, isLoading: false, error: null}),
    setFilterByPanelTypes: (types: PanelTypeEntity[]) => patchState(store, { filterByPanelTypes: types }),
    cleanFilters: () => patchState(store, { filterByAreas: [], filterByCabinetTypes: [] })
  }))
);
