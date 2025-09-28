import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import {ProjectEntity} from '../../../entities/project/model/project.entity';
import {computed} from '@angular/core';

interface SelectListProjectState {
  isLoading: boolean;
  error: string | null;
  projects: ProjectEntity[];
  projectSelected?: ProjectEntity | null;
}

const initialState: SelectListProjectState = {
  isLoading: false,
  error: null,
  projects: [],
  projectSelected: null,
};

export const SelectListProjectStore = signalStore(
  withState(initialState),
  withComputed((state) => ({
    isProjectSelected: computed(() => {
      return state.projectSelected!() != null;
    }),
    projectSelectedId: computed(() => {
      return state.projectSelected!()?.id || null;
    }),
    isAvailableButtonToContinue: computed(() => {
      return !state.isLoading() && state.projects().length > 0 && state.projectSelected!() != null;
    })
  })),
  withMethods((store) => ({
    activateLoading: () => patchState(store, { isLoading: true }),
    deactivateLoading: () => patchState(store, { isLoading: false }),
    setProjects: (projects: ProjectEntity[]) => patchState(store, { projects, isLoading: false, error: null }),
    setError: (error: string | null) => patchState(store, { error, isLoading: false }),
    setProjectSelected: (project: ProjectEntity | null) => patchState(store, { projectSelected: project }),
  }))
);
