import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import {ClientEntity} from '../../entities/client/model';
import {ProjectEntity} from '../../entities/project/model/project.entity';
import {ClientService} from '../../entities/client/api';
import {ProjectService} from '../../entities/project/api';
import {ContextStore} from './context.store';

export enum SelectContextStep {
  SELECT_CLIENT = 0,
  SELECT_PROJECT = 1
}

export interface SelectContextState {
  currentStep: SelectContextStep;

  // Clientes
  clients: ClientEntity[];
  selectedClient: ClientEntity | null;
  isLoadingClients: boolean;
  clientsError: string | null;

  // Proyectos
  projects: ProjectEntity[];
  selectedProject: ProjectEntity | null;
  isLoadingProjects: boolean;
  projectsError: string | null;
}

const initialState: SelectContextState = {
  currentStep: SelectContextStep.SELECT_CLIENT,

  clients: [],
  selectedClient: null,
  isLoadingClients: false,
  clientsError: null,

  projects: [],
  selectedProject: null,
  isLoadingProjects: false,
  projectsError: null
};

export const SelectContextStore = signalStore(
  withState<SelectContextState>(initialState),

  withComputed((state) => ({
    // Step management
    isFirstStep: computed(() => state.currentStep() === SelectContextStep.SELECT_CLIENT),
    isLastStep: computed(() => state.currentStep() === SelectContextStep.SELECT_PROJECT),

    // Step 1 - Client
    hasClients: computed(() => state.clients().length > 0),
    canProceedToProjects: computed(() =>
      state.selectedClient() !== null &&
      !state.isLoadingClients()
    ),

    // Step 2 - Project
    hasProjects: computed(() => state.projects().length > 0),
    canFinish: computed(() =>
      state.selectedProject() !== null &&
      !state.isLoadingProjects()
    ),

    // General
    isLoading: computed(() =>
      state.isLoadingClients() || state.isLoadingProjects()
    ),

    hasError: computed(() =>
      state.clientsError() !== null || state.projectsError() !== null
    )
  })),

  withMethods((store) => {
    const clientService = inject(ClientService);
    const projectService = inject(ProjectService);
    const contextStore = inject(ContextStore);

    return {
      /**
       * Cargar todos los clientes
       */
      async loadClients(): Promise<void> {
        patchState(store, {
          isLoadingClients: true,
          clientsError: null
        });

        try {
          const clients = await clientService.getAll().toPromise();

          patchState(store, {
            clients: clients || [],
            isLoadingClients: false,
            clientsError: null
          });

        } catch (error: any) {
          console.error('❌ Error loading clients:', error);
          patchState(store, {
            clients: [],
            isLoadingClients: false,
            clientsError: error.message || 'Error al cargar clientes'
          });
        }
      },

      /**
       * Seleccionar cliente
       */
      selectClient(client: ClientEntity): void {
        patchState(store, {
          selectedClient: client,
          // Reset project selection when client changes
          selectedProject: null,
          projects: [],
          projectsError: null
        });
      },

      /**
       * Cargar proyectos del cliente seleccionado
       */
      async loadProjects(): Promise<void> {
        const selectedClient = store.selectedClient();

        if (!selectedClient) {
          console.warn('⚠️ No client selected');
          return;
        }

        patchState(store, {
          isLoadingProjects: true,
          projectsError: null
        });

        try {
          const projects = await projectService
            .getAllByClientId(selectedClient.id)
            .toPromise();

          patchState(store, {
            projects: projects || [],
            isLoadingProjects: false,
            projectsError: null
          });

        } catch (error: any) {
          console.error('❌ Error loading projects:', error);
          patchState(store, {
            projects: [],
            isLoadingProjects: false,
            projectsError: error.message || 'Error al cargar proyectos'
          });
        }
      },

      /**
       * Seleccionar proyecto
       */
      selectProject(project: ProjectEntity): void {
        patchState(store, {
          selectedProject: project
        });
      },

      /**
       * Avanzar al siguiente paso
       */
      async nextStep(): Promise<void> {
        const currentStep = store.currentStep();

        if (currentStep === SelectContextStep.SELECT_CLIENT) {
          // Validar que hay cliente seleccionado
          if (!store.selectedClient()) {
            return;
          }

          // Avanzar a selección de proyecto
          patchState(store, {
            currentStep: SelectContextStep.SELECT_PROJECT
          });

          // Cargar proyectos del cliente seleccionado
          await this.loadProjects();
        }
      },

      /**
       * Retroceder al paso anterior
       */
      previousStep(): void {
        const currentStep = store.currentStep();

        if (currentStep === SelectContextStep.SELECT_PROJECT) {
          patchState(store, {
            currentStep: SelectContextStep.SELECT_CLIENT,
            // Mantener el cliente seleccionado pero limpiar proyectos
            projects: [],
            selectedProject: null,
            projectsError: null
          });
        }
      },

      /**
       * Finalizar selección y guardar en ContextStore
       */
      finish(): void {
        const client = store.selectedClient();
        const project = store.selectedProject();

        if (!client || !project) {
          console.error('❌ Cannot finish: missing client or project');
          return;
        }

        // Guardar en ContextStore
        contextStore.setContext(client, project);

        console.log('✅ Context saved:', {
          client: client.name,
          project: project.name
        });
      },

      /**
       * Reiniciar el flujo
       */
      reset(): void {
        patchState(store, initialState);
      },

      /**
       * Limpiar errores
       */
      clearErrors(): void {
        patchState(store, {
          clientsError: null,
          projectsError: null
        });
      }
    };
  })
);
