import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed } from '@angular/core';

interface LayoutState {
  isMobile: boolean;
  sidebarOpened: boolean;
  sidebarCollapsed: boolean;
}

const initialState: LayoutState = {
  isMobile: false,
  sidebarOpened: false,
  sidebarCollapsed: false
};

export const LayoutStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed((store) => ({
    isDrawerMode: computed(() => store.isMobile()),
    isSidebarVisible: computed(() => {
      if (store.isMobile()) {
        return store.sidebarOpened();
      }
      return !store.sidebarCollapsed();
    })
  })),

  withMethods((store) => ({
    setMobile: () => patchState(store, {
      isMobile: true,
      sidebarOpened: false
    }),
    setDesktop: () => patchState(store, {
      isMobile: false,
      sidebarOpened: false, // Reset del drawer
      sidebarCollapsed: false
    }),
    openSidebar: () => patchState(store, {
      sidebarOpened: true,
      sidebarCollapsed: false
    }),
    closeSidebar: () => {
      if (store.isMobile()) {
        patchState(store, { sidebarOpened: false });
      }
    },
    toggleSidebar: () => {
      if (store.isMobile()) {
        patchState(store, { sidebarOpened: !store.sidebarOpened() });
      } else {
        patchState(store, { sidebarCollapsed: !store.sidebarCollapsed() });
      }
    },
    collapseSidebar: () => {
      if (!store.isMobile()) {
        patchState(store, { sidebarCollapsed: true });
      }
    },
    expandSidebar: () => {
      if (!store.isMobile()) {
        patchState(store, { sidebarCollapsed: false });
      }
    }
  }))
);
