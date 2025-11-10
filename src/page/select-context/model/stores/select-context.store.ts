import {computed, inject} from '@angular/core';
import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import {ClientEntity} from '../../../../entities/client/model';
import {ProjectEntity} from '../../../../entities/project/model/project.entity';
import {ClientService} from '../../../../entities/client/api';
import {ProjectService} from '../../../../entities/project/api';
import {EventBusService} from '../../../../shared/services';
import {firstValueFrom} from 'rxjs';
import {ContextChangedPayload} from '../../../../shared/events/event-payloads';
import {EventNames} from '../../../../shared/events/event-names';

export enum SelectContextStep {
  SELECT_CLIENT = 0,
  SELECT_PROJECT = 1
}

export interface SelectContextState {
  currentStep: SelectContextStep;

  clients: ClientEntity[];
  selectedClient: ClientEntity | null;
  isLoadingClients: boolean;
  clientsError: string | null;

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
    isFirstStep: computed(() => state.currentStep() === SelectContextStep.SELECT_CLIENT),
    isLastStep: computed(() => state.currentStep() === SelectContextStep.SELECT_PROJECT),

    hasClients: computed(() => state.clients().length > 0),
    canProceedToProjects: computed(() => state.selectedClient() !== null && !state.isLoadingClients()),

    hasProjects: computed(() => state.projects().length > 0),
    canFinish: computed(() => state.selectedProject() !== null && !state.isLoadingProjects()),

    isLoading: computed(() => state.isLoadingClients() || state.isLoadingProjects()),

    hasError: computed(() => state.clientsError() !== null || state.projectsError() !== null)
  })),

  withMethods((store) => {
    const clientService = inject(ClientService);
    const projectService = inject(ProjectService);
    const eventBus = inject(EventBusService);

    return {
      async loadClients(): Promise<void> {
        patchState(store, {
          isLoadingClients: true,
          clientsError: null
        });

        try {
          const clients = await firstValueFrom(clientService.getAll());

          patchState(store, {
            clients: clients || [],
            isLoadingClients: false,
            clientsError: null
          });

        } catch (error: any) {
          patchState(store, {
            clients: [],
            isLoadingClients: false,
            clientsError: error.message || 'Error al cargar clientes'
          });
        }
      },

      selectClient(client: ClientEntity): void {
        patchState(store, {
          selectedClient: client,
          selectedProject: null,
          projects: [],
          projectsError: null
        });
      },

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
          const projects = await firstValueFrom(projectService.getAllByClientId(selectedClient.id));

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

      selectProject(project: ProjectEntity): void {
        patchState(store, {
          selectedProject: project
        });
      },

      async nextStep(): Promise<void> {
        const currentStep = store.currentStep();

        if (currentStep === SelectContextStep.SELECT_CLIENT) {
          if (!store.selectedClient()) {
            return;
          }

          patchState(store, {
            currentStep: SelectContextStep.SELECT_PROJECT
          });

          await this.loadProjects();
        }
      },

      previousStep(): void {
        const currentStep = store.currentStep();

        if (currentStep === SelectContextStep.SELECT_PROJECT) {
          patchState(store, {
            currentStep: SelectContextStep.SELECT_CLIENT,
            projects: [],
            selectedProject: null,
            projectsError: null
          });
        }
      },

      finish(): void {
        const client = store.selectedClient();
        const project = store.selectedProject();

        if (!client || !project) {
          console.error('❌ Cannot finish: missing client or project');
          return;
        }

        const payload: ContextChangedPayload = {
          clientId: client.id,
          projectId: project.id
        };

        eventBus.emit(EventNames.CONTEXT_CHANGED, payload);
      },

      reset(): void {
        patchState(store, initialState);
      },

      clearErrors(): void {
        patchState(store, {
          clientsError: null,
          projectsError: null
        });
      }
    };
  })
);
