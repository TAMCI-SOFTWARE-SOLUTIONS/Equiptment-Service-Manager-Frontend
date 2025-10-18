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
            loadComponent: () => import('../page/services/ui').then(m => m.ServicesHistoryPage)
          },
          {
            path: ':serviceId',
            title: 'Detalle de Servicio',
            loadComponent: () => import('../page/services/ui').then(m => m.ServiceDetailPage)
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
        loadComponent: () => import('../page/projects/ui').then(m => m.ProjectNewPage)
      },
      {
        path: 'projects/:projectId',
        title: 'Editar Proyecto',
        loadComponent: () => import('../page/projects/ui').then(m => m.ProjectEditPage)
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

      {
        path: 'collaborators',
        children: [
          {
            path: '',
            title: 'Colaboradores',
            loadComponent: () => import('../page/collaborators/ui/collaborators/collaborators.page').then(m => m.CollaboratorsPage)
          },
/*          {
            path: 'new',
            title: 'Agregar Colaborador',
            loadComponent: () => import('./pages/create-collaborator/ui/create-collaborator.page').then(m => m.CreateCollaboratorPage)
            // ⚠️ Esta página la crearemos después
          },
          {
            path: ':id',
            title: 'Detalle de Colaborador',
            loadComponent: () => import('./pages/collaborator-detail/ui/collaborator-detail.page').then(m => m.CollaboratorDetailPage)
            // ⚠️ Esta página la crearemos después
          }*/
        ]
      },

      // ==================== ADMINISTRATION ====================
      // 🔒 Only for administrators
      {
        path: 'admin',
        // canActivate: [adminGuard], // 🔒 Descomentar cuando tengas el guard
        children: [
          {
            path: '',
            redirectTo: 'users',
            pathMatch: 'full'
          },

          // --- Users Management ---
          {
            path: 'users',
            title: 'Gestión de Usuarios',
            loadComponent: () => import('../page/admin/ui').then(m => m.AdminUsersPage)
          },
          {
            path: 'users/new',
            title: 'Nuevo Usuario',
            loadComponent: () => import('../page/admin/ui').then(m => m.AdminUserFormPage)
          },
          {
            path: 'users/:userId',
            title: 'Editar Usuario',
            loadComponent: () => import('../page/admin/ui').then(m => m.AdminUserFormPage)
          },

          // --- Clients Management (CRUD) ---
          {
            path: 'clients',
            title: 'Gestión de Clientes',
            loadComponent: () => import('../page/admin/ui').then(m => m.AdminClientsPage)
          },
          {
            path: 'clients/new',
            title: 'Nuevo Cliente',
            loadComponent: () => import('../page/admin/ui').then(m => m.AdminClientFormPage)
          },
          {
            path: 'clients/:clientId',
            title: 'Editar Cliente',
            loadComponent: () => import('../page/admin/ui').then(m => m.AdminClientFormPage)
          },

/*          // --- Projects Management (CRUD) ---
          {
            path: 'projects',
            title: 'Gestión de Proyectos',
            loadComponent: () => import('../page/admin/ui').then(m => m.AdminProjectsPage)
          },
          {
            path: 'projects/new',
            title: 'Nuevo Proyecto',
            loadComponent: () => import('../page/admin/ui').then(m => m.AdminProjectFormPage)
          },
          {
            path: 'projects/:projectId',
            title: 'Editar Proyecto',
            loadComponent: () => import('../page/admin/ui').then(m => m.AdminProjectFormPage)
          },*/

          // --- Equipments Management (CRUD) ---
          {
            path: 'equipments',
            title: 'Gestión de Equipos',
            loadComponent: () => import('../page/admin/ui').then(m => m.AdminEquipmentsPage)
          },
          {
            path: 'equipments/new',
            title: 'Nuevo Equipo',
            loadComponent: () => import('../page/admin/ui').then(m => m.AdminEquipmentFormPage)
          },
          {
            path: 'equipments/:equipmentId',
            title: 'Editar Equipo',
            loadComponent: () => import('../page/admin/ui').then(m => m.AdminEquipmentFormPage)
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
