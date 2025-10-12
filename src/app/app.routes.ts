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
        path: 'select/client',
        title: 'Seleccionar Cliente',
        loadComponent: () => import('../page/select-client/ui').then(m => m.SelectClientPage)
      },
      {
        path: 'select/client/:clientId/projects',
        title: 'Seleccionar Proyecto',
        loadComponent: () => import('../page/select-project/ui').then(m => m.SelectProjectPage)
      },

      // ==================== SERVICES ====================

      // Services list and detail
      {
        path: 'services',
        children: [
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

      // Create new service flow (3 steps)
      {
        path: 'services/new',
        children: [
          {
            path: '',
            redirectTo: 'type',
            pathMatch: 'full'
          },
          {
            // Step 1: Select service type (Maintenance, Inspection, Observation)
            path: 'type',
            title: 'Tipo de Servicio',
            loadComponent: () => import('../page/new-service/ui').then(m => m.SelectServiceTypePage)
          },
          {
            // Step 2: Select equipment
            path: 'equipment',
            title: 'Seleccionar Equipo',
            loadComponent: () => import('../page/new-service/ui').then(m => m.SelectEquipmentPage)
          },
          {
            // Step 3: Confirm and assign supervisor
            path: 'confirm',
            title: 'Confirmar Servicio',
            loadComponent: () => import('../page/new-service/ui').then(m => m.ConfirmServicePage)
          }
        ]
      },

      // ==================== EQUIPMENTS ====================
      {
        path: 'equipments',
        title: 'Equipos',
        loadComponent: () => import('../page/equipments/ui').then(m => m.EquipmentsListPage)
      },
      {
        path: 'equipments/:equipmentId',
        title: 'Detalle Equipo',
        loadComponent: () => import('../page/equipments/ui').then(m => m.EquipmentDetailPage)
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
        loadComponent: () => import('../page/clients/ui/client-new/client-new.page').then(m => m.ClientNewPage)
      },
      {
        path: 'clients/:clientId/edit',
        title: 'Editar Cliente',
        loadComponent: () => import('../page/clients/ui/client-edit/client-edit.page').then(m => m.ClientEditPage)
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

          // --- Projects Management (CRUD) ---
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
          },

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
