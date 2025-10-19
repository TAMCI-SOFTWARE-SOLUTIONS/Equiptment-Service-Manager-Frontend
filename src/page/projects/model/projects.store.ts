import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { ProjectService } from '../../../entities/project/api';
import { ClientService } from '../../../entities/client/api';
import { ClientEntity } from '../../../entities/client/model';
import { ProjectStatusEnum } from '../../../entities/project/model/project-status.enum';
import { firstValueFrom } from 'rxjs';
import { ProjectEntity } from '../../../entities/project/model/project.entity';
import {EquipmentTypeEnum} from '../../../shared/model';

export interface ProjectWithClient extends ProjectEntity {
  clientName?: string;
}

export interface ProjectsState {
  projects: ProjectEntity[];
  clients: ClientEntity[];
  projectsWithClients: ProjectWithClient[];
  isLoading: boolean;
  isLoadingClients: boolean;
  error: string | null;
  selectedProjectId: string | null;
  searchQuery: string;
  selectedStatus: ProjectStatusEnum | null;
  selectedClientId: string | null; // ← NUEVO
  selectedEquipmentType: EquipmentTypeEnum | null; // ← NUEVO
}

const initialState: ProjectsState = {
  projects: [],
  clients: [],
  projectsWithClients: [],
  isLoading: false,
  isLoadingClients: false,
  error: null,
  selectedProjectId: null,
  searchQuery: '',
  selectedStatus: null,
  selectedClientId: null,
  selectedEquipmentType: null
};

export const ProjectsStore = signalStore(
  { providedIn: 'root' },
  withState<ProjectsState>(initialState),

  withComputed((state) => ({
    /**
     * Proyecto seleccionado
     */
    selectedProject: computed(() => {
      const selectedId = state.selectedProjectId();
      const projects = state.projectsWithClients();
      return selectedId
        ? projects.find(project => project.id === selectedId) || null
        : null;
    }),

    /**
     * Cantidad de proyectos
     */
    projectsCount: computed(() => state.projects().length),

    /**
     * Indica si hay proyectos
     */
    hasProjects: computed(() => state.projects().length > 0),

    /**
     * Proyectos filtrados
     */
    filteredProjects: computed(() => {
      const query = state.searchQuery().toLowerCase().trim();
      const selectedStatus = state.selectedStatus();
      const selectedClientId = state.selectedClientId();
      const selectedEquipmentType = state.selectedEquipmentType();
      let projects = state.projectsWithClients();

      // Filtrar por estado
      if (selectedStatus) {
        projects = projects.filter(project => project.status === selectedStatus);
      }

      // Filtrar por cliente
      if (selectedClientId) {
        projects = projects.filter(project => project.clientId === selectedClientId);
      }

      // Filtrar por tipo de equipo
      if (selectedEquipmentType) {
        projects = projects.filter(project =>
          project.allowedEquipmentTypes.includes(selectedEquipmentType)
        );
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

    /**
     * Proyectos ordenados alfabéticamente
     */
    /**
     * Proyectos ordenados alfabéticamente
     */
    sortedProjects: computed(() => {
      const query = state.searchQuery().toLowerCase().trim();
      const selectedStatus = state.selectedStatus();
      const selectedClientId = state.selectedClientId();
      const selectedEquipmentType = state.selectedEquipmentType();
      let projects = state.projectsWithClients();

      // Filtrar por estado
      if (selectedStatus) {
        projects = projects.filter(project => project.status === selectedStatus);
      }

      // Filtrar por cliente
      if (selectedClientId) {
        projects = projects.filter(project => project.clientId === selectedClientId);
      }

      // Filtrar por tipo de equipo
      if (selectedEquipmentType) {
        projects = projects.filter(project =>
          project.allowedEquipmentTypes.includes(selectedEquipmentType)
        );
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

      // Ordenar alfabéticamente
      return [...projects].sort((a, b) => a.name.localeCompare(b.name));
    }),

    /**
     * Estados únicos disponibles
     */
    uniqueStatuses: computed(() => {
      const statuses = new Set(state.projects().map(project => project.status));
      return Array.from(statuses);
    }),

    /**
     * Proyectos agrupados por estado
     */
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

    /**
     * Cantidad de proyectos por estado
     */
    projectsCountByStatus: computed(() => {
      const projects = state.projectsWithClients();
      const grouped = projects.reduce((acc, project) => {
        if (!acc[project.status]) {
          acc[project.status] = [];
        }
        acc[project.status].push(project);
        return acc;
      }, {} as Record<ProjectStatusEnum, ProjectWithClient[]>);

      return {
        [ProjectStatusEnum.PLANNED]: grouped[ProjectStatusEnum.PLANNED]?.length || 0,
        [ProjectStatusEnum.IN_PROGRESS]: grouped[ProjectStatusEnum.IN_PROGRESS]?.length || 0,
        [ProjectStatusEnum.COMPLETED]: grouped[ProjectStatusEnum.COMPLETED]?.length || 0,
        [ProjectStatusEnum.ON_HOLD]: grouped[ProjectStatusEnum.ON_HOLD]?.length || 0,
        [ProjectStatusEnum.CANCELLED]: grouped[ProjectStatusEnum.CANCELLED]?.length || 0
      };
    })
  })),

  withMethods((store) => {
    const projectService = inject(ProjectService);
    const clientService = inject(ClientService);

    return {
      /**
       * Cargar todos los datos necesarios (proyectos y clientes asociados)
       */
      async loadAllData(): Promise<void> {
        patchState(store, {
          isLoading: true,
          error: null
        });

        try {
          // 1. Cargar proyectos
          const projects = await firstValueFrom(projectService.getAll());

          console.log(projects);

          patchState(store, {
            projects,
            isLoading: false
          });

          // 2. Extraer clientIds únicos de los proyectos
          const clientIds = [...new Set(projects.map(p => p.clientId))];

          // 3. Cargar solo esos clientes (optimización)
          if (clientIds.length > 0) {
            await this.loadClientsByIds(clientIds);
          }

          // 4. Construir proyectos con nombres de clientes
          this.buildProjectsWithClients();

        } catch (error: any) {
          console.error('❌ Error loading projects data:', error);
          patchState(store, {
            isLoading: false,
            error: error.message || 'Error al cargar los proyectos'
          });
        }
      },

      /**
       * Cargar clientes por IDs (optimizado)
       */
      async loadClientsByIds(clientIds: string[]): Promise<void> {
        patchState(store, { isLoadingClients: true });

        try {
          const clients = await firstValueFrom(clientService.getAllByIds(clientIds));

          patchState(store, {
            clients,
            isLoadingClients: false
          });

        } catch (error: any) {
          console.error('❌ Error loading clients:', error);
          patchState(store, {
            clients: [],
            isLoadingClients: false
          });
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
            clientName: client?.name || 'Cliente no encontrado'
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
       * Establecer filtro por cliente
       */
      setClientFilter(clientId: string | null): void {
        patchState(store, { selectedClientId: clientId });
      },

      /**
       * Establecer filtro por tipo de equipo
       */
      setEquipmentTypeFilter(equipmentType: EquipmentTypeEnum | null): void {
        patchState(store, { selectedEquipmentType: equipmentType });
      },

      /**
       * Limpiar filtros (actualizar)
       */
      clearFilters(): void {
        patchState(store, {
          searchQuery: '',
          selectedStatus: null,
          selectedClientId: null,
          selectedEquipmentType: null
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

        // Si el cliente no está cargado, cargarlo
        const clientExists = store.clients().some(c => c.id === project.clientId);
        if (!clientExists) {
          this.loadClientsByIds([project.clientId]).then();
        }

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

        // Si cambió el cliente, cargar el nuevo cliente
        const oldProject = store.projects().find(p => p.id === updatedProject.id);
        if (oldProject && oldProject.clientId !== updatedProject.clientId) {
          const clientExists = store.clients().some(c => c.id === updatedProject.clientId);
          if (!clientExists) {
            this.loadClientsByIds([updatedProject.clientId]).then();
          }
        }

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
       * Reset del store
       */
      reset(): void {
        patchState(store, initialState);
      },
    };
  })
);
