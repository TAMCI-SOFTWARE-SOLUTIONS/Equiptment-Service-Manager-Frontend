import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import {CabinetEntity} from '../../../entities/cabinet/model';
import {PanelEntity} from '../../../entities/panel/model';

interface StartServiceEquipmentState {
  isLoading: boolean;
  error: string | null;
  cabinet: CabinetEntity | null;
  panel: PanelEntity | null;
  supervisors: string[];
  selectedSupervisor: string | null;
}

const initialState: StartServiceEquipmentState = {
  isLoading: false,
  error: null,
  cabinet: null,
  panel: null,
  supervisors: [],
  selectedSupervisor: null
}

export const StartServiceEquipmentStore = signalStore(
  withState(initialState),
  withComputed((state) => ({})),
  withMethods((store) => ({
    activateLoading: () => patchState(store, { isLoading: true }),
    deactivateLoading: () => patchState(store, { isLoading: false }),
    setError: (error: string | null) => patchState(store, { error, isLoading: false }),
    setCabinet: (cabinet: CabinetEntity | null) => patchState(store, { cabinet, isLoading: false }),
    setPanel: (panel: PanelEntity | null) => patchState(store, { panel, isLoading: false }),
  }))
);
