import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import {EquipmentVersionEntity} from '../../../../entities/equipment-version/model/equipment-version.entity';

// TODO: Importar servicios cuando estén listos
// import { ProjectService } from '../../../entities/project/api';
// import { PanelService } from '../../../entities/panel/api';
// import { CabinetService } from '../../../entities/cabinet/api';
// import { ProfileService } from '../../../entities/profile/api';
// import { ClientService } from '../../../entities/client/api';
// import { UserService } from '../../../entities/user/api';

export interface DashboardStats {
  // KPIs
  activeProjects: number;
  totalEquipment: number;
  totalCollaborators: number;
  totalClients: number;

  // Equipment by Type
  equipmentByType: {
    cabinets: number;
    panels: number;
  };

  // Equipment by Status
  equipmentByStatus: {
    operative: number;
    standBy: number;
    inoperative: number;
    retired: number;
  };

  // Services Stats (Hardcoded for future)
  maintenanceStats: {
    inProgress: number;
    paused: number;
    completed: number;
    cancelled: number;
  };

  repairStats: {
    inProgress: number;
    paused: number;
    completed: number;
    cancelled: number;
  };

  operationalLiftStats: {
    inProgress: number;
    paused: number;
    completed: number;
    cancelled: number;
  };

  // Recent Activity
  recentActivity: EquipmentVersionWithDetails[];
}

export interface EquipmentVersionWithDetails extends EquipmentVersionEntity {
  equipmentName: string;
  equipmentType: 'CABINET' | 'PANEL';
  modifiedByName: string; // Nombre del colaborador o email del usuario
}

export interface DashboardState {
  stats: DashboardStats;
  isLoading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: {
    activeProjects: 0,
    totalEquipment: 0,
    totalCollaborators: 0,
    totalClients: 0,
    equipmentByType: {
      cabinets: 0,
      panels: 0
    },
    equipmentByStatus: {
      operative: 0,
      standBy: 0,
      inoperative: 0,
      retired: 0
    },
    maintenanceStats: {
      inProgress: 0,
      paused: 0,
      completed: 0,
      cancelled: 0
    },
    repairStats: {
      inProgress: 0,
      paused: 0,
      completed: 0,
      cancelled: 0
    },
    operationalLiftStats: {
      inProgress: 0,
      paused: 0,
      completed: 0,
      cancelled: 0
    },
    recentActivity: []
  },
  isLoading: false,
  error: null
};

export const DashboardStore = signalStore(
  { providedIn: 'root' },

  withState<DashboardState>(initialState),

  withComputed((state) => ({
    /**
     * Total de equipos
     */
    totalEquipment: computed(() =>
      state.stats().equipmentByType.cabinets + state.stats().equipmentByType.panels
    ),

    /**
     * ¿Hay datos cargados?
     */
    hasData: computed(() =>
      state.stats().activeProjects > 0 ||
      state.stats().totalEquipment > 0
    )
  })),

  withMethods((store) => {
    // TODO: Inyectar servicios cuando estén listos
    // const projectService = inject(ProjectService);
    // const panelService = inject(PanelService);
    // const cabinetService = inject(CabinetService);
    // const profileService = inject(ProfileService);
    // const clientService = inject(ClientService);
    // const userService = inject(UserService);

    return {
      /**
       * Cargar todas las estadísticas del dashboard
       */
      async loadDashboard(): Promise<void> {
        patchState(store, {
          isLoading: true,
          error: null
        });

        try {
          // ==================== TODO: LLAMADAS A SERVICIOS ====================

          // 1. Proyectos Activos
          // const projectStats = await firstValueFrom(projectService.getProjectsStats());
          const activeProjects = 2; // Hardcoded

          // 2. Estadísticas de Gabinetes
          // const cabinetStats = await firstValueFrom(cabinetService.getCabinetStats());
          const cabinetStats = {
            total: 5,
            byStatus: [
              { status: 'OPERATIVE', count: 3 },
              { status: 'STAND_BY', count: 1 },
              { status: 'INOPERATIVE', count: 1 },
              { status: 'RETIRED', count: 0 }
            ]
          };

          // 3. Estadísticas de Paneles
          // const panelStats = await firstValueFrom(panelService.getPanelStats());
          const panelStats = {
            total: 3,
            byStatus: [
              { status: 'OPERATIVE', count: 2 },
              { status: 'STAND_BY', count: 1 },
              { status: 'INOPERATIVE', count: 0 },
              { status: 'RETIRED', count: 0 }
            ]
          };

          // 4. Estadísticas de Colaboradores
          // const collaboratorStats = await firstValueFrom(profileService.getCollaboratorsStats());
          const totalCollaborators = 12; // Hardcoded

          // 5. Estadísticas de Clientes
          // const clientStats = await firstValueFrom(clientService.getClientsStats());
          const totalClients = 1; // Hardcoded

          // 6. Versiones Recientes de Equipos
          // const cabinetVersions = await firstValueFrom(cabinetService.getRecentVersions(5));
          // const panelVersions = await firstValueFrom(panelService.getRecentVersions(5));

          const now = new Date();
          const mockVersions: EquipmentVersionEntity[] = [
            {
              id: 'cv-1',
              equipmentId: 'cab-001',
              description: 'Actualización de configuración eléctrica',
              createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
              modifiedBy: 'user-1'
            },
            {
              id: 'pv-1',
              equipmentId: 'pan-005',
              description: 'Cambio de parámetros de control',
              createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
              modifiedBy: 'user-2'
            },
            {
              id: 'cv-2',
              equipmentId: 'cab-002',
              description: 'Actualización de firmware',
              createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
              modifiedBy: 'user-1'
            },
            {
              id: 'pv-2',
              equipmentId: 'pan-003',
              description: 'Calibración de sensores',
              createdAt: new Date(now.getTime() - 48 * 60 * 60 * 1000),
              modifiedBy: 'user-3'
            }
          ];

          // 7. Procesar versiones recientes con detalles
          // const recentActivity = await this.processRecentActivity([...cabinetVersions, ...panelVersions]);
          const recentActivity = await this.processRecentActivity(mockVersions);

          // Combinar estadísticas de equipos por estado
          const equipmentByStatus = {
            operative:
              (cabinetStats.byStatus.find(s => s.status === 'OPERATIVE')?.count ?? 0) +
              (panelStats.byStatus.find(s => s.status === 'OPERATIVE')?.count ?? 0),
            standBy:
              (cabinetStats.byStatus.find(s => s.status === 'STAND_BY')?.count ?? 0) +
              (panelStats.byStatus.find(s => s.status === 'STAND_BY')?.count ?? 0),
            inoperative:
              (cabinetStats.byStatus.find(s => s.status === 'INOPERATIVE')?.count ?? 0) +
              (panelStats.byStatus.find(s => s.status === 'INOPERATIVE')?.count ?? 0),
            retired:
              (cabinetStats.byStatus.find(s => s.status === 'RETIRED')?.count ?? 0) +
              (panelStats.byStatus.find(s => s.status === 'RETIRED')?.count ?? 0)
          };

          // Actualizar estado
          patchState(store, {
            stats: {
              activeProjects,
              totalEquipment: cabinetStats.total + panelStats.total,
              totalCollaborators,
              totalClients,
              equipmentByType: {
                cabinets: cabinetStats.total,
                panels: panelStats.total
              },
              equipmentByStatus,
              // Servicios (hardcoded para futuro)
              maintenanceStats: {
                inProgress: 3,
                paused: 1,
                completed: 15,
                cancelled: 2
              },
              repairStats: {
                inProgress: 2,
                paused: 0,
                completed: 8,
                cancelled: 1
              },
              operationalLiftStats: {
                inProgress: 5,
                paused: 2,
                completed: 20,
                cancelled: 3
              },
              recentActivity
            },
            isLoading: false,
            error: null
          });

        } catch (error: any) {
          console.error('❌ Error loading dashboard:', error);
          patchState(store, {
            isLoading: false,
            error: error.message || 'Error al cargar el dashboard'
          });
        }
      },

      /**
       * Procesar versiones recientes con detalles completos
       */
      async processRecentActivity(
        versions: EquipmentVersionEntity[]
      ): Promise<EquipmentVersionWithDetails[]> {

        // Ordenar por fecha (más reciente primero)
        const sorted = [...versions].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Procesar cada versión para agregar detalles
        const processed = await Promise.all(
          sorted.map(async (version) => {
            // TODO: Obtener nombre del equipo
            // const equipment = version.equipmentId.startsWith('cab')
            //   ? await firstValueFrom(cabinetService.getById(version.equipmentId))
            //   : await firstValueFrom(panelService.getById(version.equipmentId));

            const equipmentName = version.equipmentId.startsWith('cab')
              ? `Gabinete ${version.equipmentId.toUpperCase()}`
              : `Panel ${version.equipmentId.toUpperCase()}`;

            const equipmentType: 'CABINET' | 'PANEL' = version.equipmentId.startsWith('cab')
              ? 'CABINET'
              : 'PANEL';

            // TODO: Obtener nombre del modificador
            // 1. Intentar traer Profile
            // const profile = await firstValueFrom(profileService.getByUserId(version.modifiedBy));
            // if (profile) {
            //   modifiedByName = `${profile.firstName} ${profile.lastName}`;
            // } else {
            //   // 2. Si no hay profile, traer User
            //   const user = await firstValueFrom(userService.getById(version.modifiedBy));
            //   modifiedByName = user.email;
            // }

            // Hardcoded names for demo
            const mockNames: { [key: string]: string } = {
              'user-1': 'Juan Pérez',
              'user-2': 'admin@company.com',
              'user-3': 'María López'
            };
            const modifiedByName = mockNames[version.modifiedBy] || 'Usuario Desconocido';

            return {
              ...version,
              equipmentName,
              equipmentType,
              modifiedByName
            };
          })
        );

        return processed;
      },

      /**
       * Refrescar dashboard
       */
      async refresh(): Promise<void> {
        await this.loadDashboard();
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
        patchState(store, initialState);
      }
    };
  })
);
