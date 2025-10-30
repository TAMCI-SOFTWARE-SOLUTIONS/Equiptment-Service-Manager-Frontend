import {computed, inject} from '@angular/core';
import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import {firstValueFrom, forkJoin} from 'rxjs';
import {EquipmentServiceEntity, EquipmentServiceService, ServiceStatusEnum} from '../../../entities/equipment-service';
import {ProfileService} from '../../../entities/profile';
import {SupervisorService} from '../../../entities/supervisor';
import {EquipmentTypeEnum} from '../../../shared/model';
import {RolesEnum} from '../../../entities/role/model';
import {AuthStore} from '../../../shared/stores';
import {CabinetService} from '../../../entities/cabinet/api';
import {PanelService} from '../../../entities/panel/api';

// ==================== INTERFACES ====================

/**
 * Servicio enriquecido con nombres para mostrar en la UI
 */
export interface ServiceWithDetails extends EquipmentServiceEntity {
  operatorName: string;
  supervisorName: string;
  equipmentTag: string;
}

export interface ServicesActiveState {
  // Data
  services: EquipmentServiceEntity[];
  enrichedServices: ServiceWithDetails[];

  // Lookup maps para performance
  operatorNames: Map<string, string>;
  supervisorNames: Map<string, string>;
  equipmentTags: Map<string, string>;

  // Loading states
  isLoadingServices: boolean;
  isLoadingDetails: boolean;
  error: string | null;

  // Filters
  statusFilter: ServiceStatusEnum | 'all';
  searchQuery: string;

  // Pagination
  currentPage: number;
  pageSize: number;
}

const initialState: ServicesActiveState = {
  services: [],
  enrichedServices: [],
  operatorNames: new Map(),
  supervisorNames: new Map(),
  equipmentTags: new Map(),
  isLoadingServices: false,
  isLoadingDetails: false,
  error: null,
  statusFilter: 'all',
  searchQuery: '',
  currentPage: 1,
  pageSize: 10
};

// ==================== STORE ====================

export const ServicesActiveStore = signalStore(
  withState<ServicesActiveState>(initialState),

  withComputed((state) => {
    const authStore = inject(AuthStore);

    return {
      /**
       * Rol del usuario actual
       */
      userRole: computed(() => {
        const roles = authStore.userRoles();
        if (roles.some(r => r.name === RolesEnum.ROLE_ADMIN)) return 'ADMIN';
        if (roles.some(r => r.name === RolesEnum.ROLE_OPERATOR)) return 'OPERATOR';
        return 'CLIENT_VIEWER';
      }),

      /**
       * ID del usuario actual
       */
      currentUserId: computed(() => authStore.userId()),

      /**
       * Indica si está cargando
       */
      isLoading: computed(() => state.isLoadingServices() || state.isLoadingDetails()),

      /**
       * Puede crear servicios (solo ADMIN)
       */
      canCreateService: computed(() => {
        const roles = authStore.userRoles();
        return roles.some(r => r.name === RolesEnum.ROLE_ADMIN);
      }),

      /**
       * Puede gestionar servicios (cancelar, reasignar) - solo ADMIN
       */
      canManageServices: computed(() => {
        const roles = authStore.userRoles();
        return roles.some(r => r.name === RolesEnum.ROLE_ADMIN);
      }),

      /**
       * Servicios filtrados por rol, estado y búsqueda
       */
      filteredServices: computed(() => {
        const roles = authStore.userRoles();
        const userId = authStore.userId();
        let services = state.enrichedServices();

        // 1. Filtro por rol (OPERATOR solo ve sus servicios)
        if (roles.some(r => r.name === RolesEnum.ROLE_OPERATOR) && userId) {
          services = services.filter(s => s.operatorId === userId);
        }

        // 2. Filtro por estado
        const statusFilter = state.statusFilter();
        if (statusFilter !== 'all') {
          services = services.filter(s => s.status === statusFilter);
        }

        // 3. Filtro de búsqueda
        const searchQuery = state.searchQuery().toLowerCase().trim();
        if (searchQuery) {
          services = services.filter(s =>
            s.equipmentTag.toLowerCase().includes(searchQuery) ||
            s.operatorName.toLowerCase().includes(searchQuery) ||
            s.supervisorName.toLowerCase().includes(searchQuery)
          );
        }

        return services;
      }),

      /**
       * Servicios paginados
       */
      paginatedServices: computed(() => {
        const roles = authStore.userRoles();
        const userId = authStore.userId();
        let services = state.enrichedServices();

        // Filtro por rol
        if (roles.some(r => r.name === RolesEnum.ROLE_OPERATOR) && userId) {
          services = services.filter(s => s.operatorId === userId);
        }

        // Filtro por estado
        const statusFilter = state.statusFilter();
        if (statusFilter !== 'all') {
          services = services.filter(s => s.status === statusFilter);
        }

        // Filtro de búsqueda
        const searchQuery = state.searchQuery().toLowerCase().trim();
        if (searchQuery) {
          services = services.filter(s =>
            s.equipmentTag.toLowerCase().includes(searchQuery) ||
            s.operatorName.toLowerCase().includes(searchQuery) ||
            s.supervisorName.toLowerCase().includes(searchQuery)
          );
        }

        // Paginación
        const page = state.currentPage();
        const pageSize = state.pageSize();
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;

        return services.slice(startIndex, endIndex);
      }),

      /**
       * Total de páginas
       */
      totalPages: computed(() => {
        const roles = authStore.userRoles();
        const userId = authStore.userId();
        let services = state.enrichedServices();

        // Filtro por rol
        if (roles.some(r => r.name === RolesEnum.ROLE_OPERATOR) && userId) {
          services = services.filter(s => s.operatorId === userId);
        }

        // Filtro por estado
        const statusFilter = state.statusFilter();
        if (statusFilter !== 'all') {
          services = services.filter(s => s.status === statusFilter);
        }

        // Filtro de búsqueda
        const searchQuery = state.searchQuery().toLowerCase().trim();
        if (searchQuery) {
          services = services.filter(s =>
            s.equipmentTag.toLowerCase().includes(searchQuery) ||
            s.operatorName.toLowerCase().includes(searchQuery) ||
            s.supervisorName.toLowerCase().includes(searchQuery)
          );
        }

        const pageSize = state.pageSize();
        return Math.ceil(services.length / pageSize);
      }),

      /**
       * Contador de servicios por estado (para filtros rápidos)
       */
      statusCounts: computed(() => {
        const roles = authStore.userRoles();
        const userId = authStore.userId();
        let services = state.enrichedServices();

        // Filtro por rol
        if (roles.some(r => r.name === RolesEnum.ROLE_OPERATOR) && userId) {
          services = services.filter(s => s.operatorId === userId);
        }

        return {
          all: services.length,
          created: services.filter(s => s.status === ServiceStatusEnum.CREATED).length,
          in_progress: services.filter(s => s.status === ServiceStatusEnum.IN_PROGRESS).length,
          paused: services.filter(s => s.status === ServiceStatusEnum.PAUSED).length
        };
      }),

      /**
       * Indica si hay servicios
       */
      hasServices: computed(() => state.enrichedServices().length > 0),

      /**
       * Indica si no hay resultados de búsqueda/filtro
       */
      hasNoResults: computed(() => {
        const roles = authStore.userRoles();
        const userId = authStore.userId();
        let services = state.enrichedServices();

        if (services.length === 0) return false;

        // Filtro por rol
        if (roles.some(r => r.name === RolesEnum.ROLE_OPERATOR) && userId) {
          services = services.filter(s => s.operatorId === userId);
        }

        // Filtro por estado
        const statusFilter = state.statusFilter();
        if (statusFilter !== 'all') {
          services = services.filter(s => s.status === statusFilter);
        }

        // Filtro de búsqueda
        const searchQuery = state.searchQuery().toLowerCase().trim();
        if (searchQuery) {
          services = services.filter(s =>
            s.equipmentTag.toLowerCase().includes(searchQuery) ||
            s.operatorName.toLowerCase().includes(searchQuery) ||
            s.supervisorName.toLowerCase().includes(searchQuery)
          );
        }

        return services.length === 0;
      })
    };
  }),

  withMethods((store) => {
    const serviceService = inject(EquipmentServiceService);
    const profileService = inject(ProfileService);
    const supervisorService = inject(SupervisorService);
    const cabinetService = inject(CabinetService);
    const panelService = inject(PanelService);

    return {
      /**
       * Cargar todos los servicios activos y enriquecerlos con nombres
       */
      async loadServices(): Promise<void> {
        patchState(store, {
          isLoadingServices: true,
          error: null
        });

        try {
          // 1. Cargar servicios
          const services = await firstValueFrom(serviceService.getAll());

          // TODO: Cuando el backend soporte filtros, descomentar esto:
          // const services = await firstValueFrom(
          //   serviceService.getAll({
          //     status: ['created', 'in_progress', 'paused']
          //   })
          // );

          // Filtrar solo servicios activos (excluir COMPLETED y CANCELLED)
          const activeServices = services.filter(s =>
            s.status !== ServiceStatusEnum.COMPLETED &&
            s.status !== ServiceStatusEnum.CANCELLED
          );

          patchState(store, {
            services: activeServices,
            isLoadingServices: false
          });

          // 2. Enriquecer con nombres (en paralelo)
          await this.enrichServicesWithNames();

        } catch (error: any) {
          console.error('❌ Error loading services:', error);
          patchState(store, {
            services: [],
            enrichedServices: [],
            isLoadingServices: false,
            error: error.message || 'Error al cargar los servicios'
          });
        }
      },

      /**
       * Enriquecer servicios con nombres de operadores, supervisores y equipos
       */
      async enrichServicesWithNames(): Promise<void> {
        const services = store.services();
        if (services.length === 0) {
          patchState(store, { enrichedServices: [] });
          return;
        }

        patchState(store, { isLoadingDetails: true });

        try {
          // Extraer IDs únicos
          const operatorIds = [...new Set(services.map(s => s.operatorId))];
          const supervisorIds = [...new Set(services.map(s => s.supervisorId))];
          const cabinetIds = [...new Set(
            services.filter(s => s.equipmentType === EquipmentTypeEnum.CABINET).map(s => s.equipmentId)
          )];
          const panelIds = [...new Set(
            services.filter(s => s.equipmentType === EquipmentTypeEnum.PANEL).map(s => s.equipmentId)
          )];

          // Batch requests en paralelo
          const [profiles, supervisors, cabinets, panels] = await firstValueFrom(
            forkJoin([
              profileService.getAllByUserIds(operatorIds),
              supervisorService.getAllByIds(supervisorIds),
              cabinetService.getAllByIds(cabinetIds),
              panelService.getAllByIds(panelIds)
            ])
          );

          // Crear Maps para lookup rápido
          const operatorNames = new Map<string, string>(
            profiles.map(p => [p.userId, `${p.names} ${p.firstSurname} ${p.secondSurname || ''}`])
          );

          const supervisorNames = new Map<string, string>(
            supervisors.map(s => [s.id, s.fullName])
          );

          const equipmentTags = new Map<string, string>();
          cabinets.forEach(c => equipmentTags.set(c.id, c.tag));
          panels.forEach(p => equipmentTags.set(p.id, p.tag));

          // Enriquecer servicios
          const enrichedServices: ServiceWithDetails[] = services.map(service => ({
            ...service,
            operatorName: operatorNames.get(service.operatorId) || `ID: ${service.operatorId}`,
            supervisorName: supervisorNames.get(service.supervisorId) || `ID: ${service.supervisorId}`,
            equipmentTag: equipmentTags.get(service.equipmentId) || `ID: ${service.equipmentId}`
          }));

          patchState(store, {
            enrichedServices,
            operatorNames,
            supervisorNames,
            equipmentTags,
            isLoadingDetails: false
          });

        } catch (error: any) {
          console.error('❌ Error enriching services:', error);
          // Si falla, mostrar servicios con IDs
          const enrichedServices: ServiceWithDetails[] = services.map(service => ({
            ...service,
            operatorName: `ID: ${service.operatorId}`,
            supervisorName: `ID: ${service.supervisorId}`,
            equipmentTag: `ID: ${service.equipmentId}`
          }));

          patchState(store, {
            enrichedServices,
            isLoadingDetails: false,
            error: 'No se pudieron cargar algunos detalles'
          });
        }
      },

      /**
       * Cancelar servicio (solo ADMIN)
       */
      async cancelService(serviceId: string): Promise<boolean> {
        if (!store.canManageServices()) {
          console.warn('⚠️ Solo administradores pueden cancelar servicios');
          return false;
        }

        try {
          const service = store.services().find(s => s.id === serviceId);
          if (!service) return false;

          await firstValueFrom(
            serviceService.update(serviceId, {
              ...service,
              status: ServiceStatusEnum.CANCELLED,
              cancelledAt: new Date()
            })
          );

          // Recargar servicios
          await this.loadServices();
          return true;

        } catch (error: any) {
          console.error('❌ Error cancelling service:', error);
          patchState(store, {
            error: error.message || 'Error al cancelar el servicio'
          });
          return false;
        }
      },

      /**
       * Reasignar operador (solo ADMIN)
       * TODO: Implementar cuando tengas el modal de reasignación
       */
      async reassignOperator(serviceId: string, newOperatorId: string): Promise<boolean> {
        if (!store.canManageServices()) {
          console.warn('⚠️ Solo administradores pueden reasignar operadores');
          return false;
        }

        try {
          const service = store.services().find(s => s.id === serviceId);
          if (!service) return false;

          await firstValueFrom(
            serviceService.update(serviceId, {
              ...service,
              operatorId: newOperatorId
            })
          );

          // Recargar servicios
          await this.loadServices();
          return true;

        } catch (error: any) {
          console.error('❌ Error reassigning operator:', error);
          patchState(store, {
            error: error.message || 'Error al reasignar el operador'
          });
          return false;
        }
      },

      /**
       * Establecer filtro de estado
       */
      setStatusFilter(status: ServiceStatusEnum | 'all'): void {
        patchState(store, {
          statusFilter: status,
          currentPage: 1 // Reset a página 1
        });
      },

      /**
       * Establecer búsqueda
       */
      setSearchQuery(query: string): void {
        patchState(store, {
          searchQuery: query,
          currentPage: 1 // Reset a página 1
        });
      },

      /**
       * Limpiar búsqueda
       */
      clearSearch(): void {
        patchState(store, { searchQuery: '', currentPage: 1 });
      },

      /**
       * Ir a página específica
       */
      goToPage(page: number): void {
        const totalPages = store.totalPages();
        if (page >= 1 && page <= totalPages) {
          patchState(store, { currentPage: page });
        }
      },

      /**
       * Página anterior
       */
      previousPage(): void {
        const currentPage = store.currentPage();
        if (currentPage > 1) {
          patchState(store, { currentPage: currentPage - 1 });
        }
      },

      /**
       * Página siguiente
       */
      nextPage(): void {
        const currentPage = store.currentPage();
        const totalPages = store.totalPages();
        if (currentPage < totalPages) {
          patchState(store, { currentPage: currentPage + 1 });
        }
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
