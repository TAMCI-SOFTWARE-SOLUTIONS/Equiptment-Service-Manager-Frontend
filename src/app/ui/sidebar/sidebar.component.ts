import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Drawer } from 'primeng/drawer';
import { LayoutStore } from '../../../shared/model/layout.store';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Ripple } from 'primeng/ripple';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  badge?: number;
  children?: MenuItem[];
  expanded?: boolean;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    Drawer,
    RouterLink,
    RouterLinkActive,
    Ripple
  ],
  standalone: true,
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  readonly layoutStore = inject(LayoutStore);
  private readonly router = inject(Router);

  // Estructura del menú
  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'pi-home',
      route: '/dashboard'
    },
    {
      label: 'Servicios',
      icon: 'pi-briefcase',
      children: [
        {
          label: 'Activos',
          icon: 'pi-play-circle',
          route: '/services/active',
          badge: 3
        },
        {
          label: 'Crear Nuevo',
          icon: 'pi-plus-circle',
          route: '/services/new'
        },
        {
          label: 'Historial',
          icon: 'pi-history',
          route: '/services/history'
        }
      ],
      expanded: true
    },
    {
      label: 'Clientes',
      icon: 'pi-users',
      route: '/clients'
    },
    {
      label: 'Proyectos',
      icon: 'pi-folder',
      route: '/projects'
    },
    {
      label: 'Equipos',
      icon: 'pi-box',
      route: '/equipments'
    },
    {
      label: 'Configuración',
      icon: 'pi-cog',
      children: [
        {
          label: 'Tipos de Panel',
          icon: 'pi-th-large',
          route: '/panel-types'
        },
        {
          label: 'Tipos de Gabinete',
          icon: 'pi-server',
          route: '/cabinet-types'
        },
        {
          label: 'Paneles de Distribución',
          icon: 'pi-bolt',
          route: '/power-distribution-panels'
        },
        {
          label: 'Protocolos de Comunicación',
          icon: 'pi-wifi',
          route: '/communication-protocols'
        }
      ]
    },
    {
      label: 'Reportes',
      icon: 'pi-chart-bar',
      children: [
        {
          label: 'Servicios',
          icon: 'pi-file',
          route: '/reports/services'
        },
        {
          label: 'Rendimiento',
          icon: 'pi-chart-line',
          route: '/reports/performance'
        }
      ]
    }
  ];

  adminMenuItems: MenuItem[] = [
    {
      label: 'Organización',
      icon: 'pi-sitemap',
      adminOnly: true,
      children: [
        {
          label: 'Usuarios',
          icon: 'pi-user',
          route: '/users'
        },
        {
          label: 'Colaboradores',
          icon: 'pi-address-book',
          route: '/collaborators'
        }
      ]
    }
  ];

  // TODO: Reemplazar con lógica real de auth
  isAdmin = true;

  toggleSection(item: MenuItem): void {
    if (item.children) {
      item.expanded = !item.expanded;
    }
  }

  navigateAndClose(route?: string): void {
    if (route) {
      // Solo cerrar sidebar en mobile
      if (this.layoutStore.isMobile()) {
        this.layoutStore.closeSidebar();
      }
      this.router.navigate([route]).then(() => {});
    }
  }

  getVisibleMenuItems(): MenuItem[] {
    return this.isAdmin
      ? [...this.menuItems, ...this.adminMenuItems]
      : this.menuItems;
  }
}
