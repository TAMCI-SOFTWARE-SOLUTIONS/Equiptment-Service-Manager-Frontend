import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LayoutStore } from '../../../shared/model/layout.store';
import { ContextStore } from '../../../shared/model/context.store';
import { MyProfileStore } from '../../../shared/stores';
import { AuthStore } from '../../../shared/stores';
import { Avatar } from 'primeng/avatar';
import { Ripple } from 'primeng/ripple';
import {RoleEntity, RolesEnum} from '../../../entities/role/model';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule, Avatar, Ripple],
  standalone: true,
  templateUrl: './topbar.component.html'
})
export class TopbarComponent {
  readonly layoutStore = inject(LayoutStore);
  readonly contextStore = inject(ContextStore);
  readonly profileStore = inject(MyProfileStore);
  readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  // Context signals
  clienteActual = this.contextStore.client;
  proyectoActual = this.contextStore.project;

  // User info con rol formateado
  usuarioActual = {
    nombre: this.profileStore.displayName,
    rol: computed(() => this.formatRoles(this.authStore.userRoles())),
    avatar: this.profileStore.profileImageUrl
  };

  // Loading states
  isProfileLoading = this.profileStore.isProfileLoading;
  hasProfile = this.profileStore.hasProfile;

  // UI state
  showContextSelector = signal(false);
  showUserMenu = signal(false);


  private formatRoles(roles: RoleEntity[] | undefined): string {
    if (!roles || roles.length === 0) return 'Usuario';

    console.log('Roles recibidos:', roles);

    const roleMap: Record<RolesEnum, string> = {
      [RolesEnum.ROLE_OPERATOR]: 'Operador',
      [RolesEnum.ROLE_ADMIN]: 'Administrador',
      [RolesEnum.ROLE_CLIENT_VIEWER]: 'Cliente',
    };

    const formattedRoles = roles
      .map(roleEntity => roleMap[roleEntity.name] || 'Usuario')
      .filter((role, index, self) => self.indexOf(role) === index);

    console.log('Roles formateados:', formattedRoles);

    return formattedRoles.join(', ');
  }

  onMenuClick(): void {
    this.layoutStore.openSidebar();
    // Cerrar dropdowns si están abiertos
    this.showContextSelector.set(false);
    this.showUserMenu.set(false);
  }

  toggleContextSelector(): void {
    this.showContextSelector.update(v => !v);
    this.showUserMenu.set(false);
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(v => !v);
    this.showContextSelector.set(false);
  }

  changeContext(): void {
    this.showContextSelector.set(false);
    this.router.navigate(['/select-context']).then(() => {});
  }

  logOut(): void {
    this.showUserMenu.set(false);
    this.contextStore.clearContext();
    this.profileStore.clearProfile();
    this.authStore.signOut();
  }

  onProfileClick(): void {
    this.showUserMenu.set(false);
    this.router.navigate(['/profile']).then(() => {});
  }

  /**
   * Cierra todos los dropdowns
   */
  closeAllDropdowns(): void {
    this.showContextSelector.set(false);
    this.showUserMenu.set(false);
  }
}
