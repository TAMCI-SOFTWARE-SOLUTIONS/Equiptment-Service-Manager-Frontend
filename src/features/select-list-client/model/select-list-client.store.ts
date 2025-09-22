import {patchState, signalStore, withMethods, withState} from '@ngrx/signals';
import {ClientEntity} from '../../../entities/client/model';

export interface SelectListClientState {
  isLoading: boolean;
  error: string | null;
  clients: ClientEntity[];
  clientSelected?: ClientEntity | null;
}

const initialState: SelectListClientState = {
  isLoading: false,
  error: null,
  clients: [],
};

export const SelectListClientStore = signalStore(
  withState(initialState),
  withMethods((store) => ({
    activateLoading: () => patchState(store, { isLoading: true }),
    deactivateLoading: () => patchState(store, { isLoading: false }),
    setClients: (clients: ClientEntity[]) => patchState(store, { clients, isLoading: false, error: null }),
    setError: (error: string | null) => patchState(store, { error, isLoading: false }),
    setClientSelected: (client: ClientEntity | null) => patchState(store, { clientSelected: client }),
  }))
);
