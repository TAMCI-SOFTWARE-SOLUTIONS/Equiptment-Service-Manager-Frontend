import {patchState, signalStore, withState, withMethods} from '@ngrx/signals';

interface LayoutState {
  isMobile: boolean;
  sidebarOpened: boolean;
}

const initialState: LayoutState = {
  isMobile: false,
  sidebarOpened: true
};

export const LayoutStore = signalStore(
  withState(initialState),
  withMethods((store) => ({
    setMobile: () => patchState(store, { isMobile: true, sidebarOpened: false }),
    setDesktop: () => patchState(store, { isMobile: false, sidebarOpened: true }),
    openSidebar: () => patchState(store, { sidebarOpened: true }),
    closeSidebar: () => patchState(store, { sidebarOpened: false }),
    toggleSidebar: () => patchState(store, { sidebarOpened: !store.sidebarOpened })
  }))
);
