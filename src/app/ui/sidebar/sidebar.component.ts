import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Ripple } from 'primeng/ripple';
import { LayoutStore } from '../../../shared/model/layout.store';
import { AuthStore } from '../../../shared/stores';
import { RolesEnum } from '../../../entities/role/model';
import { Drawer } from 'primeng/drawer';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  badge?: number;
  children?: MenuItem[];
  expanded?: boolean;
  roles?: RolesEnum[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, Ripple, Drawer],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  readonly layoutStore = inject(LayoutStore);
  readonly router = inject(Router);
  readonly authStore = inject(AuthStore);
  readonly menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi-home', route: '/dashboard' },
    {
      label: 'Servicios',
      icon: 'pi-briefcase',
      children: [
        // TODO: Add badge for active services
        { label: 'Activos', icon: 'pi-play-circle', route: '/services/active' },
        { label: 'Crear Nuevo', icon: 'pi-plus-circle', route: '/services/new', roles: [RolesEnum.ROLE_OPERATOR] },
        { label: 'Historial', icon: 'pi-history', route: '/services/history' }
      ],
      expanded: true
    },
    { label: 'Clientes', icon: 'pi-users', route: '/clients', roles: [RolesEnum.ROLE_ADMIN, RolesEnum.ROLE_CLIENT_VIEWER] },
    { label: 'Proyectos', icon: 'pi-folder', route: '/projects', roles: [RolesEnum.ROLE_ADMIN, RolesEnum.ROLE_OPERATOR] },
    { label: 'Equipos', icon: 'pi-box', route: '/equipments' },
    { label: 'Tableros de alimentación eléctrica', icon: 'pi-bolt', route: '/power-distribution-panels' },
    { label: 'Marcas y Modelos', icon: 'pi-tags', route: '/brands' },
    {
      label: 'Configuración',
      icon: 'pi-cog',
      children: [
        { label: 'Supervisores', icon: 'pi-id-card', route: '/supervisors' },
        { label: 'Tipos de Tableros', icon: 'pi-th-large', route: '/panel-types' },
        { label: 'Tipos de Gabinete', icon: 'pi-server', route: '/cabinet-types' },
        { label: 'Protocolos de Comunicación', icon: 'pi-wifi', route: '/communication-protocols' }
      ]
    },
    {
      label: 'Reportes',
      icon: 'pi-chart-bar',
      roles: [RolesEnum.ROLE_ADMIN],
      children: [
        { label: 'Servicios', icon: 'pi-file', route: '/reports/services' },
      ]
    },
    {
      label: 'Organización',
      icon: 'pi-sitemap',
      children: [
        { label: 'Usuarios', icon: 'pi-user', route: '/users', roles: [RolesEnum.ROLE_ADMIN]},
        { label: 'Colaboradores', icon: 'pi-address-book', route: '/collaborators' }
      ]
    }
  ];

  visibleMenuItems = computed(() => {
    const filterByRoles = (items: MenuItem[]): MenuItem[] => {
      return items
        .filter(item => {
          if (!item.roles || item.roles.length === 0) return true;

          return item.roles.some(role => this.authStore.hasRole(role));
        })
        .map(item => {
          if (item.children) {
            return { ...item, children: filterByRoles(item.children) };
          }
          return item;
        });
    };

    return filterByRoles(this.menuItems);
  });

  toggleSection(item: MenuItem) {
    if (item.children) {
      item.expanded = !item.expanded;
    }
  }

  navigateAndClose(route?: string) {
    if (!route) return;

    if (this.layoutStore.isMobile()) {
      this.layoutStore.closeSidebar();
    }

    this.router.navigate([route]).then(() => {});
  }
}
