import {computed, inject} from '@angular/core';
import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import {firstValueFrom, forkJoin} from 'rxjs';
import {EquipmentServiceEntity, EquipmentServiceService, ServiceStatusEnum} from '../../../entities/equipment-service';
import {ProfileService} from '../../../entities/profile';
import {SupervisorService} from '../../../entities/supervisor';
import {EquipmentTypeEnum} from '../../../shared/model';
import {AuthStore} from '../../../shared/stores';
import {CabinetService} from '../../../entities/cabinet/api';
import {PanelService} from '../../../entities/panel/api';
import {ContextStore} from '../../../shared/model/context.store';

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
  pageSize: 5
};

export const ServicesActiveStore = signalStore(
  withState<ServicesActiveState>(initialState),

  withComputed((store) => {
    const authStore = inject(AuthStore);

    return {
      // Auth state
      isAdmin: computed(() => authStore.isAdmin()),
      isOperator: computed(() => authStore.isOperator()),
      isClient: computed(() => authStore.isClient()),
      currentUserId: computed(() => authStore.userId()),
      userRoles: computed(() => authStore.userRoles()),

      // Loading state
      isLoading: computed(() =>
        store.isLoadingServices() || store.isLoadingDetails()
      ),

      // Basic checks
      hasServices: computed(() => store.enrichedServices().length > 0),

      // Search query normalizado
      normalizedSearchQuery: computed(() =>
        store.searchQuery().toLowerCase().trim()
      )
    };
  }),

  withComputed((store) => ({
    filteredServices: computed(() => {
      let services = store.enrichedServices();

      const statusFilter = store.statusFilter();
      if (statusFilter !== 'all') {
        services = services.filter(s => s.status === statusFilter);
      }

      const searchQuery = store.normalizedSearchQuery();
      if (searchQuery) {
        services = services.filter(s =>
          s.equipmentTag.toLowerCase().includes(searchQuery) ||
          s.operatorName.toLowerCase().includes(searchQuery) ||
          s.supervisorName.toLowerCase().includes(searchQuery)
        );
      }

      return services;
    })
  })),

  withComputed((store) => ({
    paginatedServices: computed(() => {
      const services = store.filteredServices();
      const page = store.currentPage();
      const pageSize = store.pageSize();
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;

      return services.slice(startIndex, endIndex);
    }),

    totalPages: computed(() => {
      const services = store.filteredServices();
      const pageSize = store.pageSize();
      return Math.ceil(services.length / pageSize);
    }),

    totalFilteredResults: computed(() => store.filteredServices().length),

    hasNoResults: computed(() => {
      const hasData = store.hasServices();
      const filteredCount = store.filteredServices().length;
      return hasData && filteredCount === 0;
    }),

    statusCounts: computed(() => {
      let services = store.enrichedServices();

      if (store.isOperator() && store.currentUserId()) {
        services = services.filter(s => s.operatorId === store.currentUserId());
      }

      return {
        all: services.length,
        created: services.filter(s => s.status === ServiceStatusEnum.CREATED).length,
        inProgress: services.filter(s => s.status === ServiceStatusEnum.IN_PROGRESS).length,
        completed: services.filter(s => s.status === ServiceStatusEnum.COMPLETED).length,
        cancelled: services.filter(s => s.status === ServiceStatusEnum.CANCELLED).length
      };
    }),

    paginationInfo: computed(() => {
      const page = store.currentPage();
      const pageSize = store.pageSize();
      const total = store.filteredServices().length;
      const totalPages = Math.ceil(total / pageSize);
      const startIndex = (page - 1) * pageSize + 1;
      const endIndex = Math.min(page * pageSize, total);

      return {
        currentPage: page,
        pageSize,
        totalPages,
        totalResults: total,
        startIndex: total > 0 ? startIndex : 0,
        endIndex: total > 0 ? endIndex : 0,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages
      };
    }),
  })),

  withComputed((store) => ({
    visiblePages: computed(() => {
      const current = store.currentPage();
      const total = store.totalPages();

      if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
      }

      const pages: (number | 'ellipsis')[] = [];

      pages.push(1);

      if (current > 3) {
        pages.push('ellipsis');
      }

      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < total - 2) {
        pages.push('ellipsis');
      }

      if (total > 1) {
        pages.push(total);
      }

      return pages;
    })
  })),

  withMethods((store) => {
    const contextStore = inject(ContextStore);
    const authStore = inject(AuthStore);
    const serviceService = inject(EquipmentServiceService);
    const profileService = inject(ProfileService);
    const supervisorService = inject(SupervisorService);
    const cabinetService = inject(CabinetService);
    const panelService = inject(PanelService);

    return {
      async loadServices(): Promise<void> {
        patchState(store, {
          isLoadingServices: true,
          error: null
        });

        try {
          const activeServices = await firstValueFrom(serviceService.getAll({
            projectId: contextStore.projectId() ?? "",
            operatorId: !store.isOperator() ? "" : authStore.userId() ?? "",
            statuses: [ServiceStatusEnum.CREATED, ServiceStatusEnum.IN_PROGRESS]
          }));

          patchState(store, {
            services: activeServices,
            isLoadingServices: false
          });

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

          const [profiles, supervisors, cabinets, panels] = await firstValueFrom(
            forkJoin([
              profileService.getAllByUserIds(operatorIds),
              supervisorService.getAllByIds(supervisorIds),
              cabinetService.getAllByIds(cabinetIds),
              panelService.getAllByIds(panelIds)
            ])
          );

          const operatorNames = new Map<string, string>(
            profiles.map(p => [p.userId, `${p.names} ${p.firstSurname} ${p.secondSurname || ''}`])
          );

          const supervisorNames = new Map<string, string>(
            supervisors.map(s => [s.id, s.fullName])
          );

          const equipmentTags = new Map<string, string>();
          cabinets.forEach(c => equipmentTags.set(c.id, c.tag));
          panels.forEach(p => equipmentTags.set(p.id, p.tag));

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

      async cancelService(serviceId: string): Promise<boolean> {
        if (!store.isAdmin()) {
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

      setStatusFilter(status: ServiceStatusEnum | 'all'): void {
        patchState(store, {
          statusFilter: status,
          currentPage: 1 // Reset a página 1
        });
      },

      setSearchQuery(query: string): void {
        patchState(store, {
          searchQuery: query,
          currentPage: 1 // Reset a página 1
        });
      },

      clearSearch(): void {
        patchState(store, { searchQuery: '', currentPage: 1 });
      },

      setPageSize(size: number): void {
        patchState(store, {
          pageSize: size,
          currentPage: 1
        });
      },

      goToPage(page: number): void {
        const totalPages = store.totalPages();
        if (page >= 1 && page <= totalPages) {
          patchState(store, { currentPage: page });
        }
      },

      previousPage(): void {
        const currentPage = store.currentPage();
        if (currentPage > 1) {
          patchState(store, { currentPage: currentPage - 1 });
        }
      },

      nextPage(): void {
        const currentPage = store.currentPage();
        const totalPages = store.totalPages();
        if (currentPage < totalPages) {
          patchState(store, { currentPage: currentPage + 1 });
        }
      },

      clearError(): void {
        patchState(store, { error: null });
      },

      reset(): void {
        patchState(store, initialState);
      }
    };
  })
);
