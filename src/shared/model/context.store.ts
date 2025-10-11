import { patchState, signalStore, withComputed, withMethods, withState, withHooks } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, switchMap, catchError, of } from 'rxjs';
import { computed, inject } from '@angular/core';
import { ClientEntity } from '../../entities/client/model';
import { ProjectEntity } from '../../entities/project/model/project.entity';
import { ClientService } from '../../entities/client/api/client.service';
import { ProjectService } from '../../entities/project/api/project.service';

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

const STORAGE_KEY = 'app_context';

export const ContextStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed((state) => ({
    hasContext: computed(() => {
      return state.client() !== null && state.project() !== null;
    }),
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

  withMethods((
    store,
    clientService = inject(ClientService),
    projectService = inject(ProjectService)
  ) => ({

    setClient: (client: ClientEntity | null) => {
      patchState(store, {
        client,
        project: null
      });
      saveToStorage(store);
    },

    setProject: (project: ProjectEntity | null) => {
      patchState(store, { project });
      saveToStorage(store);
    },

    setContext: (client: ClientEntity, project: ProjectEntity) => {
      patchState(store, { client, project });
      saveToStorage(store);
    },

    clearContext: () => {
      patchState(store, {
        client: null,
        project: null,
        error: null
      });
      localStorage.removeItem(STORAGE_KEY);
    },

    loadFromStorage: () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const context = JSON.parse(saved) as Pick<ContextState, 'client' | 'project'>;
          patchState(store, {
            ...context,
            isInitialized: true
          });
          return true; // Indica que se cargó del storage
        } catch (error) {
          console.error('Error loading context:', error);
        }
      }
      return false; // No había nada en storage
    },

    // Auto-cargar primer cliente y primer proyecto (solo para usuarios nuevos)
    initializeForNewUser: rxMethod<void>(
      pipe(
        tap(() => {
          console.log('Initializing context for new user...');
          patchState(store, { isLoading: true, error: null });
        }),
        switchMap(() =>
          clientService.getAll().pipe(
            switchMap((clients) => {
              if (clients.length === 0) {
                patchState(store, {
                  isLoading: false,
                  isInitialized: true,
                  error: 'No hay clientes disponibles'
                });
                return of(null);
              }

              // Seleccionar primer cliente
              const firstClient = clients[0];
              console.log('Auto-selected first client:', firstClient.name);

              // Cargar proyectos de ese cliente
              return projectService.getAllByClientId(firstClient.id).pipe(
                tap((projects) => {
                  if (projects.length === 0) {
                    patchState(store, {
                      client: firstClient,
                      project: null,
                      isLoading: false,
                      isInitialized: true,
                      error: 'El cliente no tiene proyectos disponibles'
                    });
                    return;
                  }

                  // Seleccionar primer proyecto
                  const firstProject = projects[0];
                  console.log('Auto-selected first project:', firstProject.name);

                  patchState(store, {
                    client: firstClient,
                    project: firstProject,
                    isLoading: false,
                    isInitialized: true,
                    error: null
                  });

                  // Guardar en storage
                  saveToStorage(store);
                }),
                catchError((error) => {
                  console.error('Error loading projects:', error);
                  patchState(store, {
                    client: firstClient,
                    project: null,
                    isLoading: false,
                    isInitialized: true,
                    error: 'Error cargando proyectos'
                  });
                  return of(null);
                })
              );
            }),
            catchError((error) => {
              console.error('Error loading clients:', error);
              patchState(store, {
                error: 'Error cargando clientes',
                isLoading: false,
                isInitialized: true
              });
              return of(null);
            })
          )
        )
      )
    )
  })),

  withHooks({
    onInit(store) {
      console.log('ContextStore initialized');

      // Intentar cargar del storage
      const hasStoredContext = store.loadFromStorage();

      // Si NO hay contexto guardado (usuario nuevo), auto-cargar
      if (!hasStoredContext) {
        console.log('No stored context found, initializing for new user');
        store.initializeForNewUser();
      } else {
        console.log('Context loaded from storage:', store.contextSummary());
      }
    }
  })
);

function saveToStorage(store: any) {
  const context = {
    client: store.client(),
    project: store.project()
  };
  if (context.client && context.project) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(context));
    console.log('Context saved to storage');
  }
}
