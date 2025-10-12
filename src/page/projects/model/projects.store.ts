import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { ProjectService } from '../../../entities/project/api/project.service';
import { ClientService } from '../../../entities/client/api';
import { ClientEntity } from '../../../entities/client/model';
import { ProjectStatusEnum } from '../../../entities/project/model/project-status.enum';
import { firstValueFrom } from 'rxjs';
import {ProjectEntity} from '../../../entities/project/model/project.entity';

export interface ProjectWithClient extends ProjectEntity {
  clientName?: string;
  clientCode?: string;
}

export interface ProjectsState {
  projects: ProjectEntity[];
  clients: ClientEntity[];
  projectsWithClients: ProjectWithClient[];
  isLoading: boolean;
  error: string | null;
  selectedProjectId: string | null;
  searchQuery: string;
  selectedStatus: ProjectStatusEnum | null;
}

const initialState: ProjectsState = {
  projects: [],
  clients: [],
  projectsWithClients: [],
  isLoading: false,
  error: null,
  selectedProjectId: null,
  searchQuery: '',
  selectedStatus: null
};

export const ProjectsStore = signalStore(
  { providedIn: 'root' },
  withState<ProjectsState>(initialState),

  withComputed((state) => ({
    selectedProject: computed(() => {
      const selectedId = state.selectedProjectId();
      return selectedId
        ? state.projectsWithClients().find(project => project.id === selectedId) || null
        : null;
    }),

    projectsCount: computed(() => state.projects().length),

    hasProjects: computed(() => state.projects().length > 0),

    isProjectsLoading: computed(() => state.isLoading()),

    filteredProjects: computed(() => {
      const query = state.searchQuery().toLowerCase().trim();
      const selectedStatus = state.selectedStatus();
      let projects = state.projectsWithClients();

      // Filtrar por estado si está seleccionado
      if (selectedStatus) {
        projects = projects.filter(project => project.status === selectedStatus);
      }

      // Filtrar por búsqueda
      if (query) {
        projects = projects.filter(project =>
          project.name.toLowerCase().includes(query) ||
          project.code.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query) ||
          project.clientName?.toLowerCase().includes(query)
        );
      }

      return projects;
    }),

    uniqueStatuses: computed(() => {
      const statuses = new Set(state.projects().map(project => project.status));
      return Array.from(statuses);
    }),

    projectsByStatus: computed(() => {
      const projects = state.projectsWithClients();
      return projects.reduce((acc, project) => {
        if (!acc[project.status]) {
          acc[project.status] = [];
        }
        acc[project.status].push(project);
        return acc;
      }, {} as Record<ProjectStatusEnum, ProjectWithClient[]>);
    }),

    activeProjects: computed(() =>
      state.projectsWithClients().filter(project => project.status === ProjectStatusEnum.IN_PROGRESS)
    ),

    completedProjects: computed(() =>
      state.projectsWithClients().filter(project => project.status === ProjectStatusEnum.COMPLETED)
    ),

    cancelledProjects: computed(() =>
      state.projectsWithClients().filter(project => project.status === ProjectStatusEnum.CANCELLED)
    )
  })),

  withMethods((store) => {
    const projectService = inject(ProjectService);
    const clientService = inject(ClientService);

    return {
      /**
       * Cargar todos los datos necesarios (proyectos y clientes)
       */
      loadAllData(): void {
        patchState(store, {
          isLoading: true,
          error: null
        });

        // Cargar datos en paralelo
        Promise.all([
          this.loadClients(),
          this.loadProjects()
        ]).then(() => {
          this.buildProjectsWithClients();
          patchState(store, { isLoading: false });
        }).catch((error) => {
          console.error('❌ ProjectsStore - Error al cargar datos:', error);
          patchState(store, {
            isLoading: false,
            error: error.message || 'Error al cargar los proyectos'
          });
        });
      },

      /**
       * Cargar clientes
       */
      async loadClients(): Promise<ClientEntity[]> {
        try {
          const clients = await firstValueFrom(clientService.getAll());
          patchState(store, {clients});
          return clients;
        } catch (error) {
          console.error('Error loading clients:', error);
          return [];
        }
      },

      /**
       * Cargar proyectos
       */
      async loadProjects(): Promise<ProjectEntity[]> {
        try {
          const projects = await firstValueFrom(projectService.getAll());
          patchState(store, {projects});
          return projects;
        } catch (error) {
          console.error('Error loading projects:', error);
          return [];
        }
      },

      /**
       * Construir proyectos con información de clientes
       */
      buildProjectsWithClients(): void {
        const projects = store.projects();
        const clients = store.clients();

        const projectsWithClients: ProjectWithClient[] = projects.map(project => {
          const client = clients.find(c => c.id === project.clientId);

          return {
            ...project,
            clientName: client?.name || 'Cliente desconocido',
            clientCode: client?.id || 'N/A'
          };
        });

        patchState(store, {
          projectsWithClients
        });
      },

      /**
       * Seleccionar un proyecto
       */
      selectProject(projectId: string): void {
        patchState(store, { selectedProjectId: projectId });
      },

      /**
       * Limpiar selección
       */
      clearSelection(): void {
        patchState(store, { selectedProjectId: null });
      },

      /**
       * Establecer búsqueda
       */
      setSearchQuery(query: string): void {
        patchState(store, { searchQuery: query });
      },

      /**
       * Establecer filtro por estado
       */
      setStatusFilter(status: ProjectStatusEnum | null): void {
        patchState(store, { selectedStatus: status });
      },

      /**
       * Limpiar filtros
       */
      clearFilters(): void {
        patchState(store, {
          searchQuery: '',
          selectedStatus: null
        });
      },

      /**
       * Limpiar error
       */
      clearError(): void {
        patchState(store, { error: null });
      },

      /**
       * Agregar proyecto y actualizar metadata
       */
      addProject(project: ProjectEntity): void {
        patchState(store, (state) => ({
          projects: [...state.projects, project]
        }));

        // Recalcular metadata
        this.buildProjectsWithClients();
      },

      /**
       * Actualizar proyecto
       */
      updateProject(updatedProject: ProjectEntity): void {
        patchState(store, (state) => ({
          projects: state.projects.map(project =>
            project.id === updatedProject.id ? updatedProject : project
          )
        }));

        // Recalcular metadata
        this.buildProjectsWithClients();
      },

      /**
       * Eliminar proyecto
       */
      removeProject(projectId: string): void {
        patchState(store, (state) => ({
          projects: state.projects.filter(project => project.id !== projectId),
          projectsWithClients: state.projectsWithClients.filter(project => project.id !== projectId)
        }));
      },

      /**
       * Obtener proyectos por cliente
       */
      getProjectsByClientId(clientId: string): ProjectWithClient[] {
        return store.projectsWithClients().filter(project => project.clientId === clientId);
      },

      /**
       * Obtener proyectos activos
       */
      getActiveProjects(): ProjectWithClient[] {
        return store.activeProjects();
      }
    };
  })
);
