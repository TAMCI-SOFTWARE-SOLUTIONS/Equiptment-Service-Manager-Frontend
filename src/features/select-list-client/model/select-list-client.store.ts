import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import {ClientEntity} from '../../../entities/client/model';
import {computed} from '@angular/core';

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
  clientSelected: null,
};

export const SelectListClientStore = signalStore(
  withState(initialState),
  withComputed((state) => ({
    isClientSelected: computed(() => {
      return state.clientSelected!() != null;
    }),
    clientSelectedId: computed(() => {
      return state.clientSelected!()?.id || null;
    }),
    isAvailableButtonToContinue: computed(() => {
      return !state.isLoading() && state.clients().length > 0 && state.clientSelected!() != null;
    })
  })),
  withMethods((store) => ({
    activateLoading: () => patchState(store, { isLoading: true }),
    deactivateLoading: () => patchState(store, { isLoading: false }),
    setClients: (clients: ClientEntity[]) => patchState(store, { clients, isLoading: false, error: null }),
    setError: (error: string | null) => patchState(store, { error, isLoading: false }),
    setClientSelected: (client: ClientEntity | null) => patchState(store, { clientSelected: client }),
  }))
);
