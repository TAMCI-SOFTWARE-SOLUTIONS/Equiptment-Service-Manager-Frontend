import {signalStore, withState, withMethods, patchState} from '@ngrx/signals';

export interface RequestCodeState {
  isLoading: boolean;
  error: string | null;
  isCodeSent: boolean;
  isAuthenticated: boolean;
}

const initialState: RequestCodeState = {
  isLoading: false,
  error: null,
  isCodeSent: false,
  isAuthenticated: false
};

export const RequestCodeStore = signalStore(
  withState(initialState),
  withMethods((store) => ({
    setLoading: (isLoading: boolean) => patchState(store, { isLoading }),

    setError: (error: string | null) => patchState(store, { error }),

    setCodeSent: (isCodeSent: boolean) => patchState(store, { isCodeSent }),

    setAuthenticated: (isAuthenticated: boolean) => patchState(store, { isAuthenticated }),

    reset: () => patchState(store, initialState)
  }))
);
