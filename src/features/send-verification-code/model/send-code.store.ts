import {patchState, signalStore, withMethods, withState} from '@ngrx/signals';

interface SendCodeState {
  isLoading: boolean;
  error: string | null;
  email: string;
  code: string;
}

const initialState: SendCodeState = {
  isLoading: false,
  error: null,
  email: '',
  code: ''
}

export const SendCodeStore = signalStore(
  withState(initialState),
  withMethods((store)=>({
    setLoading: (isLoading: boolean) => patchState(store, { isLoading }),
    setError: (error: string | null) => patchState(store, { error }),
    setEmail: (email: string) => patchState(store, {email})
  }))
);
