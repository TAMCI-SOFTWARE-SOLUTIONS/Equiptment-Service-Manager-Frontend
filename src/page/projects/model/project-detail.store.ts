import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { ProjectService } from '../../../entities/project/api';
import { ClientService } from '../../../entities/client/api';
import { FileService } from '../../../entities/file/api/file.service';
import { ProjectEntity } from '../../../entities/project/model/project.entity';
import { ProjectStatusEnum } from '../../../entities/project/model/project-status.enum';
import { ClientEntity } from '../../../entities/client/model';
import { EquipmentTypeEnum } from '../../../shared/model';
import { firstValueFrom } from 'rxjs';

export interface ProjectDetailState {
  project: ProjectEntity | null;
  client: ClientEntity | null;
  bannerUrl: string | null;
  isLoading: boolean;
  isLoadingClient: boolean;
  isLoadingBanner: boolean;
  error: string | null;
}

const initialState: ProjectDetailState = {
  project: null,
  client: null,
  bannerUrl: null,
  isLoading: false,
  isLoadingClient: false,
  isLoadingBanner: false,
  error: null
};

export const ProjectDetailStore = signalStore(
  withState<ProjectDetailState>(initialState),

  withComputed((state) => ({
    /**
     * Indica si hay proyecto cargado
     */
    hasProject: computed(() => state.project() !== null),

    /**
     * Indica si tiene banner
     */
    hasBanner: computed(() => {
      const project = state.project();
      return project?.bannerId !== null && project?.bannerId !== undefined;
    }),

    /**
     * Label del estado
     */
    statusLabel: computed(() => {
      const project = state.project();
      if (!project) return '';

      const labels: Record<ProjectStatusEnum, string> = {
        [ProjectStatusEnum.PLANNED]: 'Planificado',
        [ProjectStatusEnum.IN_PROGRESS]: 'En Progreso',
        [ProjectStatusEnum.COMPLETED]: 'Completado',
        [ProjectStatusEnum.ON_HOLD]: 'En Espera',
        [ProjectStatusEnum.CANCELLED]: 'Cancelado'
      };

      return labels[project.status] || project.status;
    }),

    /**
     * Color del estado
     */
    statusColor: computed(() => {
      const project = state.project();
      if (!project) return 'bg-gray-100 text-gray-700 border-gray-200';

      const colors: Record<ProjectStatusEnum, string> = {
        [ProjectStatusEnum.PLANNED]: 'bg-sky-50 text-sky-700 border-sky-200',
        [ProjectStatusEnum.IN_PROGRESS]: 'bg-sky-100 text-sky-800 border-sky-300',
        [ProjectStatusEnum.COMPLETED]: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        [ProjectStatusEnum.ON_HOLD]: 'bg-gray-100 text-gray-700 border-gray-300',
        [ProjectStatusEnum.CANCELLED]: 'bg-gray-200 text-gray-600 border-gray-400'
      };

      return colors[project.status] || 'bg-gray-100 text-gray-700 border-gray-200';
    }),

    /**
     * Icono del estado
     */
    statusIcon: computed(() => {
      const project = state.project();
      if (!project) return 'pi-circle';

      const icons: Record<ProjectStatusEnum, string> = {
        [ProjectStatusEnum.PLANNED]: 'pi-calendar',
        [ProjectStatusEnum.IN_PROGRESS]: 'pi-clock',
        [ProjectStatusEnum.COMPLETED]: 'pi-check-circle',
        [ProjectStatusEnum.ON_HOLD]: 'pi-pause-circle',
        [ProjectStatusEnum.CANCELLED]: 'pi-times-circle'
      };

      return icons[project.status] || 'pi-circle';
    }),

    /**
     * Puede iniciar proyecto (solo si está PLANNED)
     */
    canStartProject: computed(() => {
      const project = state.project();
      return project?.status === ProjectStatusEnum.PLANNED;
    }),

    /**
     * Puede completar proyecto (solo si está IN_PROGRESS)
     */
    canCompleteProject: computed(() => {
      const project = state.project();
      return project?.status === ProjectStatusEnum.IN_PROGRESS;
    }),

    /**
     * Puede pausar proyecto (solo si está IN_PROGRESS)
     */
    canPauseProject: computed(() => {
      const project = state.project();
      return project?.status === ProjectStatusEnum.IN_PROGRESS;
    }),

    /**
     * Puede cancelar proyecto (solo si está IN_PROGRESS)
     */
    canCancelProject: computed(() => {
      const project = state.project();
      return project?.status === ProjectStatusEnum.IN_PROGRESS;
    }),

    /**
     * Puede eliminar proyecto (solo si está PLANNED)
     */
    canDeleteProject: computed(() => {
      const project = state.project();
      return project?.status === ProjectStatusEnum.PLANNED;
    }),

    /**
     * Label del tipo de equipo
     */
    equipmentTypeLabels: computed(() => {
      const project = state.project();
      if (!project) return [];

      const labels: Record<EquipmentTypeEnum, string> = {
        [EquipmentTypeEnum.CABINET]: 'Gabinetes',
        [EquipmentTypeEnum.PANEL]: 'Paneles'
      };

      return project.allowedEquipmentTypes.map(type => ({
        type,
        label: labels[type] || type,
        icon: type === EquipmentTypeEnum.CABINET ? '📦' : '📋'
      }));
    })
  })),

  withMethods((store) => {
    const projectService = inject(ProjectService);
    const clientService = inject(ClientService);
    const fileService = inject(FileService);

    return {
      /**
       * Cargar proyecto por ID
       */
      async loadProject(projectId: string): Promise<void> {
        patchState(store, {
          isLoading: true,
          error: null
        });

        try {
          const project = await firstValueFrom(projectService.getById(projectId));

          patchState(store, {
            project,
            isLoading: false,
            error: null
          });

          // Cargar cliente
          if (project.clientId) {
            this.loadClient(project.clientId);
          }

          // Cargar banner si existe
          if (project.bannerId) {
            this.loadBanner(project.bannerId);
          }

        } catch (error: any) {
          console.error('❌ Error loading project:', error);
          patchState(store, {
            project: null,
            isLoading: false,
            error: error.message || 'Error al cargar el proyecto'
          });
        }
      },

      /**
       * Cargar cliente asociado
       */
      async loadClient(clientId: string): Promise<void> {
        patchState(store, { isLoadingClient: true });

        try {
          const client = await firstValueFrom(clientService.getById(clientId));

          patchState(store, {
            client,
            isLoadingClient: false
          });

        } catch (error: any) {
          console.error('❌ Error loading client:', error);
          patchState(store, {
            client: null,
            isLoadingClient: false
          });
        }
      },

      /**
       * Cargar banner del proyecto
       */
      async loadBanner(fileId: string): Promise<void> {
        patchState(store, { isLoadingBanner: true });

        try {
          const bannerUrl = await firstValueFrom(fileService.viewFileAsUrl(fileId));

          patchState(store, {
            bannerUrl,
            isLoadingBanner: false
          });

        } catch (error: any) {
          console.error('❌ Error loading banner:', error);
          patchState(store, {
            bannerUrl: null,
            isLoadingBanner: false
          });
        }
      },

      /**
       * TODO: Iniciar proyecto (PLANNED → IN_PROGRESS)
       */
      async startProject(): Promise<boolean> {
        const project = store.project();
        if (!project || !store.canStartProject()) {
          return false;
        }

        console.log('🚧 TODO: Implementar inicio de proyecto');
        console.log('Proyecto:', project);

        // TODO: Implementar cuando el backend esté listo
        // const updated = await firstValueFrom(projectService.updateStatus(project.id, ProjectStatusEnum.IN_PROGRESS));
        // patchState(store, { project: updated });

        return false;
      },

      /**
       * TODO: Completar proyecto (IN_PROGRESS → COMPLETED)
       */
      async completeProject(): Promise<boolean> {
        const project = store.project();
        if (!project || !store.canCompleteProject()) {
          return false;
        }

        console.log('🚧 TODO: Implementar completar proyecto');
        console.log('Proyecto:', project);

        // TODO: Implementar cuando el backend esté listo
        // const updated = await firstValueFrom(projectService.updateStatus(project.id, ProjectStatusEnum.COMPLETED));
        // patchState(store, { project: updated });

        return false;
      },

      /**
       * TODO: Pausar proyecto (IN_PROGRESS → ON_HOLD)
       */
      async pauseProject(): Promise<boolean> {
        const project = store.project();
        if (!project || !store.canPauseProject()) {
          return false;
        }

        console.log('🚧 TODO: Implementar pausar proyecto');
        console.log('Proyecto:', project);

        // TODO: Implementar cuando el backend esté listo
        // const updated = await firstValueFrom(projectService.updateStatus(project.id, ProjectStatusEnum.ON_HOLD));
        // patchState(store, { project: updated });

        return false;
      },

      /**
       * TODO: Cancelar proyecto (IN_PROGRESS → CANCELLED)
       */
      async cancelProject(): Promise<boolean> {
        const project = store.project();
        if (!project || !store.canCancelProject()) {
          return false;
        }

        console.log('🚧 TODO: Implementar cancelar proyecto');
        console.log('Proyecto:', project);

        // TODO: Implementar cuando el backend esté listo
        // const updated = await firstValueFrom(projectService.updateStatus(project.id, ProjectStatusEnum.CANCELLED));
        // patchState(store, { project: updated });

        return false;
      },

      /**
       * TODO: Eliminar proyecto (solo si está PLANNED)
       */
      async deleteProject(): Promise<boolean> {
        const project = store.project();
        if (!project || !store.canDeleteProject()) {
          return false;
        }

        console.log('🚧 TODO: Implementar eliminar proyecto');
        console.log('Proyecto:', project);

        // TODO: Implementar cuando el backend esté listo
        // await firstValueFrom(projectService.delete(project.id));

        return false;
      },

      /**
       * Limpiar error
       */
      clearError(): void {
        patchState(store, { error: null });
      },

      /**
       * Reset del store
       */
      reset(): void {
        // Cleanup banner URL
        if (store.bannerUrl()) {
          URL.revokeObjectURL(store.bannerUrl()!);
        }

        patchState(store, initialState);
      }
    };
  })
);
