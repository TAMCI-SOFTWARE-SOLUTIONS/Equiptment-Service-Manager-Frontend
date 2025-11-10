import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import {firstValueFrom} from 'rxjs';
import {computed, inject} from '@angular/core';
import {ClientEntity} from '../../entities/client/model';
import {ProjectEntity} from '../../entities/project/model/project.entity';
import {ClientService} from '../../entities/client/api';
import {ProjectService} from '../../entities/project/api';

interface ContextState {
  client: ClientEntity | null;
  project: ProjectEntity | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

const initialState: ContextState = {
  client: null,
  project: null,
  isLoading: false,
  error: null,
  isInitialized: false
};

export const ContextStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed((state) => ({
    hasContext: computed(() => state.client() !== null && state.project() !== null),
    clientId: computed(() => state.client()?.id || null),
    projectId: computed(() => state.project()?.id || null),
    contextSummary: computed(() => {
      const client = state.client();
      const project = state.project();
      if (!client || !project) return null;
      return {
        clientName: client.name,
        projectName: project.name,
        clientId: client.id,
        projectId: project.id
      };
    })
  })),

  withMethods((store) => {
    const clientService = inject(ClientService);
    const projectService = inject(ProjectService);

    return {
      async loadContext(clientId: string, projectId: string) {
        patchState(store, { isLoading: true, error: null });
        try {
          const client = await firstValueFrom(clientService.getById(clientId));
          const project = await firstValueFrom(projectService.getById(projectId));

          patchState(store, {
            client,
            project,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          patchState(store, {
            isLoading: false,
            error: error?.message || 'Error al cargar el contexto'
          });
          throw error;
        }
      },

      setClient: (client: ClientEntity | null) => {
        patchState(store, { client, project: null });
      },

      setProject: (project: ProjectEntity | null) => {
        patchState(store, { project });
      },

      setContext: (client: ClientEntity, project: ProjectEntity) => {
        patchState(store, { client, project });
      },

      clearContext: () => {
        patchState(store, {
          client: null,
          project: null,
          error: null
        });
      }
    };
  })
);
