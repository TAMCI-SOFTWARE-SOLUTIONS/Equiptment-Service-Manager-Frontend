import { Routes } from '@angular/router';
import { LoginPage } from '../page/login/ui';
import { MainLayoutLayout } from './ui';
import {authGuard} from '../shared/guards';

export const routes: Routes = [
  // ==================== AUTH ====================
  {
    path: 'login',
    title: 'Iniciar Sesión',
    component: LoginPage
  },
  // ==================== MAIN APP ====================
  {
    path: '',
    component: MainLayoutLayout,
    canActivate: [authGuard],
    children: [

      // --- Dashboard Principal ---
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        title: 'Dashboard',
        loadComponent: () => import('../page/dashboard/ui').then(m => m.DashboardPage)
      },

      // ==================== CONTEXT SELECTION ====================
      // 🎯 Páginas de selección de contexto (ya existentes)
      {
        path: 'select-context',
        title: 'Seleccionar Contexto',
        loadComponent: () => import('../page/select-context/ui').then(m => m.SelectContextPage)
      },

      // ==================== SERVICES ====================

      // Services list and detail
      {
        path: 'services',
        children: [
          {
            path: 'new',
            title: 'Crear Servicio',
            loadComponent: () => import('../page/new-service/ui/create-service/create-service.page').then(m => m.CreateServicePage)
          },
          {
            path: 'active',
            title: 'Servicios Activos',
            loadComponent: () => import('../page/services/ui').then(m => m.ServicesActivePage)
          },
          {
            path: 'history',
            title: 'Historial de Servicios',
            loadComponent: () => import('../page/services/ui').then(m => m.ServicesActivePage)
          },
          {
            path: ':id/details',
            title: 'Detalle de Servicio',
            loadComponent: () => import('../page/services/ui').then(m => m.ServiceDetailPage)
          },
          {
            path: 'work/:id',
            title: 'Orden de Trabajo',
            loadComponent: () => import('../page/services/ui').then(m => m.ServiceWorkPage)
          }
        ]
      },

      // ==================== EQUIPMENTS ====================
      {
        path: 'equipments',
        title: 'Equipos',
        loadComponent: () => import('../page/equipments/ui').then(m => m.EquipmentsPage)
      },
      {
        path: 'equipments/new',
        title: 'Nuevo Equipo',
        loadComponent: () => import('../page/equipments/ui/equipment-form/equipment-form.page').then(m => m.EquipmentFormPage)
      },
      {
        path: 'equipments/:type/new', // cabinet/new o panel/new
        title: 'Nuevo Equipo',
        loadComponent: () => import('../page/equipments/ui/equipment-form/equipment-form.page').then(m => m.EquipmentFormPage)
      },
      {
        path: 'equipments/cabinet/:id',
        title: 'Detalle Gabinete',
        loadComponent: () => import('../page/equipments/ui/equipment-detail/equipment-detail.page').then(m => m.EquipmentDetailPage)
      },
      {
        path: 'equipments/cabinet/:id/edit',
        title: 'Editar Gabinete',
        loadComponent: () => import('../page/equipments/ui/equipment-form/equipment-form.page').then(m => m.EquipmentFormPage)
      },
      {
        path: 'equipments/panel/:id',
        title: 'Detalle Panel',
        loadComponent: () => import('../page/equipments/ui/equipment-detail/equipment-detail.page').then(m => m.EquipmentDetailPage)
      },
      {
        path: 'equipments/panel/:id/edit',
        title: 'Editar Panel',
        loadComponent: () => import('../page/equipments/ui/equipment-form/equipment-form.page').then(m => m.EquipmentFormPage)
      },

      // ==================== EQUIPMENT TYPES ====================
      {
        path: 'panel-types',
        title: 'Tipos de Panel',
        loadComponent: () => import('../page/panel-types/ui/panel-types/panel-types.page').then(m => m.PanelTypesPage)
      },
      {
        path: 'panel-types/new',
        title: 'Nuevo Tipo de Panel',
        loadComponent: () => import('../page/panel-types/ui/panel-type-form/panel-type-form.page').then(m => m.PanelTypeFormPage)
      },
      {
        path: 'panel-types/:id/edit',
        title: 'Editar Tipo de Panel',
        loadComponent: () => import('../page/panel-types/ui/panel-type-form/panel-type-form.page').then(m => m.PanelTypeFormPage)
      },
      {
        path: 'cabinet-types',
        title: 'Tipos de Gabinete',
        loadComponent: () => import('../page/cabinet-types/ui/cabinet-types/cabinet-types.page').then(m => m.CabinetTypesPage)
      },
      {
        path: 'cabinet-types/new',
        title: 'Nuevo Tipo de Gabinete',
        loadComponent: () => import('../page/cabinet-types/ui/cabinet-type-form/cabinet-type-form.page').then(m => m.CabinetTypeFormPage)
      },
      {
        path: 'cabinet-types/:id/edit',
        title: 'Editar Tipo de Gabinete',
        loadComponent: () => import('../page/cabinet-types/ui/cabinet-type-form/cabinet-type-form.page').then(m => m.CabinetTypeFormPage)
      },

      // ==================== PROJECTS ====================
      {
        path: 'projects',
        title: 'Proyectos',
        loadComponent: () => import('../page/projects/ui').then(m => m.ProjectsPage)
      },
      {
        path: 'projects/new',
        title: 'Nuevo Proyecto',
        loadComponent: () => import('../page/projects/ui/project-form/project-form.page').then(m => m.ProjectFormPage)
      },
      {
        path: 'projects/:id',
        title: 'Detalle Proyecto',
        loadComponent: () => import('../page/projects/ui/project-detail/project-detail.page').then(m => m.ProjectDetailPage)
      },
      {
        path: 'projects/:id/edit',
        title: 'Editar Proyecto',
        loadComponent: () => import('../page/projects/ui/project-form/project-form.page').then(m => m.ProjectFormPage)
      },

      // ==================== REPORTS ====================
/*      {
        path: 'reports',
        children: [
          {
            path: 'services',
            title: 'Reporte de Servicios',
            loadComponent: () => import('../page/reports/services/ui').then(m => m.ReportServicesPage)
          },
          {
            path: 'performance',
            title: 'Reporte de Rendimiento',
            loadComponent: () => import('../page/reports/performance/ui').then(m => m.ReportPerformancePage)
          }
        ]
      },*/

      // ==================== CLIENTS ====================
      {
        path: 'clients',
        title: 'Clientes',
        loadComponent: () => import('../page/clients/ui/clients/clients.page').then(m => m.ClientsPage)
      },
      {
        path: 'clients/new',
        title: 'Nuevo Cliente',
        loadComponent: () => import('../page/clients/ui/client-form/client-form.page').then(m => m.ClientFormPage)
      },
      {
        path: 'clients/:clientId/edit',
        title: 'Editar Cliente',
        loadComponent: () => import('../page/clients/ui/client-form/client-form.page').then(m => m.ClientFormPage)
      },
      {
        path: 'clients/:clientId',
        title: 'Detalle Cliente',
        loadComponent: () => import('../page/clients/ui/client-detail/client-detail.page').then(m => m.ClientDetailPage)
      },

      // ==================== PLANTS ====================
      {
        path: 'clients/:clientId/plants/new',
        title: 'Nueva Planta',
        loadComponent: () => import('../page/plants/ui/plant-form/plant-form.page').then(m => m.PlantFormPage)
      },
      {
        path: 'clients/:clientId/plants/:plantId/edit',
        title: 'Editar Planta',
        loadComponent: () => import('../page/plants/ui/plant-form/plant-form.page').then(m => m.PlantFormPage)
      },
      {
        path: 'clients/:clientId/plants/:plantId',
        title: 'Detalle Planta',
        loadComponent: () => import('../page/plants/ui/plant-detail/plant-detail.page').then(m => m.PlantDetailPage)
      },

      // ==================== AREAS ====================
      {
        path: 'clients/:clientId/plants/:plantId/areas/new',
        title: 'Nueva Área',
        loadComponent: () => import('../page/areas/ui/area-form/area-form.page').then(m => m.AreaFormPage)
      },
      {
        path: 'clients/:clientId/plants/:plantId/areas/:areaId/edit',
        title: 'Editar Área',
        loadComponent: () => import('../page/areas/ui/area-form/area-form.page').then(m => m.AreaFormPage)
      },
      {
        path: 'clients/:clientId/plants/:plantId/areas/:areaId',
        title: 'Detalle Área',
        loadComponent: () => import('../page/areas/ui/area-detail/area-detail.page').then(m => m.AreaDetailPage)
      },

      // ==================== LOCATIONS ====================
      {
        path: 'clients/:clientId/plants/:plantId/areas/:areaId/locations/new',
        title: 'Nueva Ubicación',
        loadComponent: () => import('../page/locations/ui/location-form/location-form.page').then(m => m.LocationFormPage)
      },
      {
        path: 'clients/:clientId/plants/:plantId/areas/:areaId/locations/:locationId/edit',
        title: 'Editar Ubicación',
        loadComponent: () => import('../page/locations/ui/location-form/location-form.page').then(m => m.LocationFormPage)
      },
      {
        path: 'clients/:clientId/plants/:plantId/areas/:areaId/locations/:locationId',
        title: 'Detalle Ubicación',
        loadComponent: () => import('../page/locations/ui/location-detail/location-detail.page').then(m => m.LocationDetailPage)
      },

      // ==================== COMMUNICATION PROTOCOLS ====================
      {
        path: 'communication-protocols',
        title: 'Protocolos de Comunicación',
        loadComponent: () => import('../page/communication-protocols/ui/communication-protocols/communication-protocols.page').then(m => m.CommunicationProtocolsPage)
      },

      // ==================== POWER DISTRIBUTIONS PANELS ====================
      {
        path: 'power-distribution-panels',
        children: [
          {
            path: '',
            title: 'Paneles de Distribución Eléctrica',
            loadComponent: () => import('../page/power-distribution-panels/ui/power-distribution-panels/power-distribution-panels.page').then(m => m.PowerDistributionPanelsPage)
          },
          {
            path: 'new',
            title: 'Nuevo Panel de Distribución Eléctrica',
            loadComponent: () => import('../page/power-distribution-panels/ui/power-distribution-panel-form/power-distribution-panel-form.page').then(m => m.PowerDistributionPanelFormPage)
          },
          {
            path: ':id/edit',
            title: 'Editar Panel de Distribución Eléctrica',
            loadComponent: () => import('../page/power-distribution-panels/ui/power-distribution-panel-form/power-distribution-panel-form.page').then(m => m.PowerDistributionPanelFormPage)
          }
        ]
      },

      // ==================== SUPERVISORS ====================
      {
        path: 'supervisors',
        title: 'Supervisores',
        loadComponent: () => import('../page/supervisors/ui/supervisors/supervisors.page').then(m => m.SupervisorsPage)
      },

      // ==================== BRANDS & MODELS ====================
      {
        path: 'brands',
        title: 'Marcas y Modelos',
        loadComponent: () => import('../page/brands/ui/brands/brands.page').then(m => m.BrandsPage)
      },

      // ==================== COLLABORATORS ====================
      {
        path: 'collaborators',
        children: [
          {
            path: '',
            title: 'Colaboradores',
            loadComponent: () => import('../page/collaborators/ui/collaborators/collaborators.page').then(m => m.CollaboratorsPage)
          },
          {
            path: 'new',
            title: 'Agregar Colaborador',
            loadComponent: () => import('../page/collaborators/ui/collaborator-form/collaborator-form.page').then(m => m.CollaboratorFormPage)
            // ⚠️ Esta página la crearemos después
          },
          {
            path: ':id/edit',
            title: 'Editar Colaborador',
            loadComponent: () => import('../page/collaborators/ui/collaborator-form/collaborator-form.page').then(m => m.CollaboratorFormPage)
          },
          {
            path: ':id',
            title: 'Detalle de Colaborador',
            loadComponent: () => import('../page/collaborators/ui/collaborator-detail/collaborator-detail.page').then(m => m.CollaboratorDetailPage)
            // ⚠️ Esta página la crearemos después
          }
        ]
      },
      // --- Users Management ---
      {
        path: 'users',
        children: [
          {
            path: '',
            title: 'Usuarios',
            loadComponent: () => import('../page/users/ui/users/users.page').then(m => m.UsersPage)
          },
          {
            path: 'new',
            title: 'Crear Usuario',
            loadComponent: () => import('../page/users/ui/create-user/create-user.page').then(m => m.CreateUserPage)
          },
          {
            path: ':id',
            title: 'Detalle Usuario',
            loadComponent: () => import('../page/users/ui/user-details/user-details.page').then(m => m.UserDetailsPage)
          }
        ]
      },

      // ==================== PROFILE & SETTINGS ====================
      {
        path: 'profile',
        title: 'Mi Perfil',
        loadComponent: () => import('../page/profile/ui').then(m => m.ProfilePage)
      },
      {
        path: 'settings',
        title: 'Configuración',
        loadComponent: () => import('../page/settings/ui').then(m => m.SettingsPage)
      }
    ]
  },

  // ==================== 404 ====================
  {
    path: '**',
    redirectTo: 'login'
  }
];
