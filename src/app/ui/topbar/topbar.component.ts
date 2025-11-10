import {Component, computed, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {LayoutStore} from '../../../shared/model/layout.store';
import {ContextStore} from '../../../shared/model/context.store';
import {AuthStore, MyProfileStore} from '../../../shared/stores';
import {Avatar} from 'primeng/avatar';
import {Ripple} from 'primeng/ripple';
import {RoleEntity, RolesEnum} from '../../../entities/role/model';
import {EntityIconComponent} from '../../../shared/ui/entity-icon/entity-icon.component';
import {IconEntity} from '../../../shared/model/enums/icon-entity.enum';
import {IconSize} from '../../../shared/model/enums/icon-size.enum';
import {IconRounded} from '../../../shared/model/enums/icon.rounded';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule, Avatar, Ripple, EntityIconComponent],
  standalone: true,
  templateUrl: './topbar.component.html'
})
export class TopbarComponent {
  readonly layoutStore = inject(LayoutStore);
  readonly contextStore = inject(ContextStore);
  readonly profileStore = inject(MyProfileStore);
  readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  readonly IconEntity = IconEntity;
  readonly IconSize = IconSize;
  readonly IconRounded = IconRounded;

  // Context signals
  clienteActual = this.contextStore.client;
  proyectoActual = this.contextStore.project;

  // User info con rol formateado
  usuarioActual = {
    nombre: this.authStore.username,
    rol: computed(() => this.formatRoles(this.authStore.userRoles())),
    avatar: this.profileStore.profileImageUrl
  };

  // Loading states
  isProfileLoading = this.profileStore.isProfileLoading;

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
