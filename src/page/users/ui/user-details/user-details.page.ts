import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Ripple } from 'primeng/ripple';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { UsersStore } from '../../model/users.store';
import { UserService } from '../../../../entities/user/api';
import { AccountStatusEnum, UserEntity } from '../../../../entities/user/model';
import { RolesEnum } from '../../../../entities/role/model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule, Ripple, Menu],
  templateUrl: './user-details.page.html'
})
export class UserDetailsPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly userService = inject(UserService);
  readonly store = inject(UsersStore);

  // Expose enums
  readonly AccountStatusEnum = AccountStatusEnum;
  readonly RolesEnum = RolesEnum;

  // State
  readonly user = signal<UserEntity | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  // UI State
  readonly showActionConfirm = signal(false);
  readonly confirmAction = signal<{
    type: 'activate' | 'lock' | 'disable';
    user: UserEntity;
  } | null>(null);

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (!userId) {
      console.error('❌ No user ID provided');
      this.router.navigate(['/users']);
      return;
    }

    this.loadUser(userId);
  }

  // ==================== DATA LOADING ====================

  async loadUser(userId: string): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      console.log('📥 Loading user details:', userId);
      const user = await firstValueFrom(this.userService.getById(userId));

      this.user.set(user);
      this.isLoading.set(false);

      console.log('✅ User loaded:', user.email);

    } catch (error: any) {
      console.error('❌ Error loading user:', error);

      let errorMessage = 'Error al cargar usuario';

      if (error.status === 404) {
        errorMessage = 'Usuario no encontrado';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      this.error.set(errorMessage);
      this.isLoading.set(false);
    }
  }

  // ==================== NAVIGATION ====================

  onGoBack(): void {
    this.location.back();
  }

  onRefresh(): void {
    const user = this.user();
    if (user) {
      this.loadUser(user.id);
    }
  }

  // ==================== USER ACTIONS ====================

  /**
   * Construir menú de acciones según el estado del usuario
   */
  buildActionsMenu(user: UserEntity): MenuItem[] {
    const items: MenuItem[] = [];

    // Acciones según estado
    switch (user.accountStatus) {
      case AccountStatusEnum.ACTIVE:
        items.push({
          label: 'Bloquear Usuario',
          icon: 'pi pi-lock',
          command: () => {
            this.onRequestLockUser(user);
          }
        });
        items.push({
          label: 'Deshabilitar Usuario',
          icon: 'pi pi-ban',
          command: () => {
            this.onRequestDisableUser(user);
          }
        });
        break;

      case AccountStatusEnum.LOCKED:
      case AccountStatusEnum.DISABLED:
        items.push({
          label: 'Activar Usuario',
          icon: 'pi pi-check-circle',
          command: () => {
            this.onRequestActivateUser(user);
          }
        });
        break;

      case AccountStatusEnum.PENDING_ACTIVATION:
        items.push({
          label: 'Activar Usuario',
          icon: 'pi pi-check-circle',
          command: () => {
            this.onRequestActivateUser(user);
          }
        });
        break;
    }

    return items;
  }

  /**
   * Toggle menú de acciones
   */
  toggleActionsMenu(event: Event, menu: Menu, user: UserEntity): void {
    menu.model = this.buildActionsMenu(user);
    menu.toggle(event);
  }

  // ==================== ACTION REQUESTS ====================

  onRequestActivateUser(user: UserEntity): void {
    this.confirmAction.set({
      type: 'activate',
      user
    });
    this.showActionConfirm.set(true);
  }

  onRequestLockUser(user: UserEntity): void {
    this.confirmAction.set({
      type: 'lock',
      user
    });
    this.showActionConfirm.set(true);
  }

  onRequestDisableUser(user: UserEntity): void {
    this.confirmAction.set({
      type: 'disable',
      user
    });
    this.showActionConfirm.set(true);
  }

  async onConfirmAction(): Promise<void> {
    const action = this.confirmAction();
    if (!action) return;

    let success = false;

    switch (action.type) {
      case 'activate':
        success = await this.store.activateUser(action.user.id);
        break;
      case 'lock':
        success = await this.store.lockUser(action.user.id);
        break;
      case 'disable':
        success = await this.store.disableUser(action.user.id);
        break;
    }

    if (success) {
      // Refrescar usuario actual
      await this.loadUser(action.user.id);
    }

    this.showActionConfirm.set(false);
    this.confirmAction.set(null);
  }

  onCancelAction(): void {
    this.showActionConfirm.set(false);
    this.confirmAction.set(null);
  }

  // ==================== HELPERS ====================

  /**
   * Obtener label del estado
   */
  getStatusLabel(status: AccountStatusEnum): string {
    const labels: Record<AccountStatusEnum, string> = {
      [AccountStatusEnum.ACTIVE]: 'Activo',
      [AccountStatusEnum.LOCKED]: 'Bloqueado',
      [AccountStatusEnum.DISABLED]: 'Deshabilitado',
      [AccountStatusEnum.PENDING_ACTIVATION]: 'Pendiente Activación'
    };
    return labels[status] || status;
  }

  /**
   * Obtener clase CSS del estado
   */
  getStatusClass(status: AccountStatusEnum): string {
    const classes: Record<AccountStatusEnum, string> = {
      [AccountStatusEnum.ACTIVE]: 'bg-green-100 text-green-700 border-green-200',
      [AccountStatusEnum.LOCKED]: 'bg-red-100 text-red-700 border-red-200',
      [AccountStatusEnum.DISABLED]: 'bg-gray-100 text-gray-700 border-gray-300',
      [AccountStatusEnum.PENDING_ACTIVATION]: 'bg-amber-100 text-amber-700 border-amber-200'
    };
    return classes[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  }

  /**
   * Obtener icono del estado
   */
  getStatusIcon(status: AccountStatusEnum): string {
    const icons: Record<AccountStatusEnum, string> = {
      [AccountStatusEnum.ACTIVE]: 'pi-check-circle',
      [AccountStatusEnum.LOCKED]: 'pi-lock',
      [AccountStatusEnum.DISABLED]: 'pi-ban',
      [AccountStatusEnum.PENDING_ACTIVATION]: 'pi-clock'
    };
    return icons[status] || 'pi-circle';
  }

  /**
   * Obtener label del rol
   */
  getRoleLabel(role: RolesEnum): string {
    const labels: Record<RolesEnum, string> = {
      [RolesEnum.ROLE_ADMIN]: 'Administrador',
      [RolesEnum.ROLE_OPERATOR]: 'Operador',
      [RolesEnum.ROLE_CLIENT_VIEWER]: 'Visor de Cliente'
    };
    return labels[role] || role;
  }

  /**
   * Obtener clase CSS del rol
   */
  getRoleClass(role: RolesEnum): string {
    const classes: Record<RolesEnum, string> = {
      [RolesEnum.ROLE_ADMIN]: 'bg-sky-100 text-sky-700 border-sky-200',
      [RolesEnum.ROLE_OPERATOR]: 'bg-cyan-100 text-cyan-700 border-cyan-200',
      [RolesEnum.ROLE_CLIENT_VIEWER]: 'bg-blue-100 text-blue-700 border-blue-200',
    };
    return classes[role] || 'bg-gray-100 text-gray-700 border-gray-200';
  }

  /**
   * Formatear fecha
   */
  formatDate(date: Date | null): string {
    if (!date) return 'Nunca';

    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }

  /**
   * Formatear fecha corta (sin hora)
   */
  formatDateShort(date: Date | null): string {
    if (!date) return 'Nunca';

    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date));
  }

  /**
   * Obtener mensaje de confirmación
   */
  getConfirmMessage(): string {
    const action = this.confirmAction();
    if (!action) return '';

    const messages = {
      activate: `¿Estás seguro que deseas activar al usuario <strong>${action.user.email}</strong>?`,
      lock: `¿Estás seguro que deseas bloquear al usuario <strong>${action.user.email}</strong>? El usuario no podrá iniciar sesión.`,
      disable: `¿Estás seguro que deseas deshabilitar al usuario <strong>${action.user.email}</strong>? El usuario no podrá iniciar sesión.`
    };

    return messages[action.type];
  }

  /**
   * Obtener título de confirmación
   */
  getConfirmTitle(): string {
    const action = this.confirmAction();
    if (!action) return '';

    const titles = {
      activate: 'Activar Usuario',
      lock: 'Bloquear Usuario',
      disable: 'Deshabilitar Usuario'
    };

    return titles[action.type];
  }

  /**
   * Obtener icono de confirmación
   */
  getConfirmIcon(): string {
    const action = this.confirmAction();
    if (!action) return 'pi-question-circle';

    const icons = {
      activate: 'pi-check-circle',
      lock: 'pi-lock',
      disable: 'pi-ban'
    };

    return icons[action.type];
  }

  /**
   * Obtener color de confirmación
   */
  getConfirmColor(): string {
    const action = this.confirmAction();
    if (!action) return 'bg-gray-100';

    const colors = {
      activate: 'bg-green-100',
      lock: 'bg-red-100',
      disable: 'bg-gray-100'
    };

    return colors[action.type];
  }

  /**
   * Obtener color de texto de confirmación
   */
  getConfirmTextColor(): string {
    const action = this.confirmAction();
    if (!action) return 'text-gray-600';

    const colors = {
      activate: 'text-green-600',
      lock: 'text-red-600',
      disable: 'text-gray-600'
    };

    return colors[action.type];
  }
}
