import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Drawer } from 'primeng/drawer';
import { Button } from 'primeng/button';
import { LayoutStore } from '../../../shared/model/layout.store';
import { RouterLink, RouterLinkActive } from '@angular/router';
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
    Button,
    RouterLink,
    RouterLinkActive,
    Ripple
  ],
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  readonly layoutStore = inject(LayoutStore);

  // Estructura del menú - LABELS EN ESPAÑOL
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
          badge: 3 // Dinámico - actualizar desde service
        },
        {
          label: 'Crear Nuevo',
          icon: 'pi-plus-circle',
          route: '/services/new/type'
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
      label: 'Administración',
      icon: 'pi-shield',
      adminOnly: true,
      children: [
        {
          label: 'Usuarios',
          icon: 'pi-user',
          route: '/admin/users'
        },
        {
          label: 'Clientes',
          icon: 'pi-building',
          route: '/admin/clients'
        },
        {
          label: 'Proyectos',
          icon: 'pi-folder-open',
          route: '/admin/projects'
        },
        {
          label: 'Equipos',
          icon: 'pi-box',
          route: '/admin/equipments'
        }
      ]
    }
  ];

  // Mock - reemplaza con tu lógica real de auth
  isAdmin = true;

  toggleSection(item: MenuItem): void {
    if (item.children) {
      item.expanded = !item.expanded;
    }
  }

  navigateAndClose(route?: string): void {
    if (route) {
      this.layoutStore.closeSidebar();
    }
  }

  getVisibleMenuItems(): MenuItem[] {
    return this.isAdmin
      ? [...this.menuItems, ...this.adminMenuItems]
      : this.menuItems;
  }
}
