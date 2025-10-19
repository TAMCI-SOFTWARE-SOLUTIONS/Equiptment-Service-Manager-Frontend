import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { UserEntity } from '../../../entities/user/model';
import { AccountStatusEnum } from '../../../entities/user/model';
import { RolesEnum } from '../../../entities/role/model';
import { firstValueFrom } from 'rxjs';
import {UserService} from '../../../entities/user/api';

export interface UsersState {
  users: UserEntity[];
  isLoading: boolean;
  error: string | null;

  // Filtros
  searchQuery: string;
  statusFilter: AccountStatusEnum | 'all';
  roleFilter: RolesEnum | 'all';
}

const initialState: UsersState = {
  users: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  statusFilter: 'all',
  roleFilter: 'all'
};

export const UsersStore = signalStore(
  { providedIn: 'root' },

  withState<UsersState>(initialState),

  withComputed((state) => ({
    /**
     * Usuarios filtrados por búsqueda, estado y rol
     */
    filteredUsers: computed(() => {
      let filtered = state.users();

      // Filtrar por búsqueda (email)
      const query = state.searchQuery().toLowerCase().trim();
      if (query) {
        filtered = filtered.filter(user =>
          user.email.toLowerCase().includes(query)
        );
      }

      // Filtrar por estado
      if (state.statusFilter() !== 'all') {
        filtered = filtered.filter(user =>
          user.accountStatus === state.statusFilter()
        );
      }

      // Filtrar por rol
      if (state.roleFilter() !== 'all') {
        filtered = filtered.filter(user =>
          user.roles.some(role => role.name === state.roleFilter())
        );
      }

      return filtered;
    }),

    /**
     * Contadores por estado
     */
    activeCount: computed(() =>
      state.users().filter(u => u.accountStatus === AccountStatusEnum.ACTIVE).length
    ),

    lockedCount: computed(() =>
      state.users().filter(u => u.accountStatus === AccountStatusEnum.LOCKED).length
    ),

    disabledCount: computed(() =>
      state.users().filter(u => u.accountStatus === AccountStatusEnum.DISABLED).length
    ),

    pendingCount: computed(() =>
      state.users().filter(u => u.accountStatus === AccountStatusEnum.PENDING_ACTIVATION).length
    ),

    /**
     * ¿Tiene filtros activos?
     */
    hasActiveFilters: computed(() =>
      state.searchQuery().trim() !== '' ||
      state.statusFilter() !== 'all' ||
      state.roleFilter() !== 'all'
    )
  })),

  withMethods((store) => {
    const userService = inject(UserService);

    return {
      /**
       * Cargar todos los usuarios
       */
      async loadUsers(): Promise<void> {
        patchState(store, {
          isLoading: true,
          error: null
        });

        try {
          const users = await firstValueFrom(userService.getAll());

          patchState(store, {
            users: users.sort((a, b) => a.email.localeCompare(b.email)),
            isLoading: false,
            error: null
          });

        } catch (error: any) {
          console.error('❌ Error loading users:', error);
          patchState(store, {
            users: [],
            isLoading: false,
            error: error.message || 'Error al cargar usuarios'
          });
        }
      },

      /**
       * Refrescar usuarios
       */
      async refresh(): Promise<void> {
        await this.loadUsers();
      },

      // ==================== FILTROS ====================

      setSearchQuery(query: string): void {
        patchState(store, { searchQuery: query });
      },

      setStatusFilter(status: AccountStatusEnum | 'all'): void {
        patchState(store, { statusFilter: status });
      },

      setRoleFilter(role: RolesEnum | 'all'): void {
        patchState(store, { roleFilter: role });
      },

      clearFilters(): void {
        patchState(store, {
          searchQuery: '',
          statusFilter: 'all',
          roleFilter: 'all'
        });
      },

      // ==================== ACCIONES DE USUARIO ====================

      /**
       * TODO: Activar usuario (LOCKED o DISABLED → ACTIVE)
       */
      async activateUser(userId: string): Promise<boolean> {
        console.log('🚧 TODO: Implementar activación de usuario');
        console.log('User ID:', userId);

        // TODO: Descomentar cuando el backend esté listo
        // try {
        //   const updatedUser = await firstValueFrom(
        //     userService.updateStatus(userId, AccountStatusEnum.ACTIVE)
        //   );
        //
        //   // Actualizar en el store
        //   const users = store.users().map(u =>
        //     u.id === userId ? updatedUser : u
        //   );
        //   patchState(store, { users });
        //
        //   return true;
        // } catch (error) {
        //   console.error('Error activating user:', error);
        //   return false;
        // }

        return false;
      },

      /**
       * TODO: Bloquear usuario (ACTIVE → LOCKED)
       */
      async lockUser(userId: string): Promise<boolean> {
        console.log('🚧 TODO: Implementar bloqueo de usuario');
        console.log('User ID:', userId);

        // TODO: Descomentar cuando el backend esté listo
        // try {
        //   const updatedUser = await firstValueFrom(
        //     userService.updateStatus(userId, AccountStatusEnum.LOCKED)
        //   );
        //
        //   // Actualizar en el store
        //   const users = store.users().map(u =>
        //     u.id === userId ? updatedUser : u
        //   );
        //   patchState(store, { users });
        //
        //   return true;
        // } catch (error) {
        //   console.error('Error locking user:', error);
        //   return false;
        // }

        return false;
      },

      /**
       * TODO: Deshabilitar usuario (ACTIVE → DISABLED)
       */
      async disableUser(userId: string): Promise<boolean> {
        console.log('🚧 TODO: Implementar deshabilitación de usuario');
        console.log('User ID:', userId);

        // TODO: Descomentar cuando el backend esté listo
        // try {
        //   const updatedUser = await firstValueFrom(
        //     userService.updateStatus(userId, AccountStatusEnum.DISABLED)
        //   );
        //
        //   // Actualizar en el store
        //   const users = store.users().map(u =>
        //     u.id === userId ? updatedUser : u
        //   );
        //   patchState(store, { users });
        //
        //   return true;
        // } catch (error) {
        //   console.error('Error disabling user:', error);
        //   return false;
        // }

        return false;
      },

      /**
       * Actualizar usuario en el store (para cuando venga de otro componente)
       */
      updateUser(updatedUser: UserEntity): void {
        const users = store.users().map(u =>
          u.id === updatedUser.id ? updatedUser : u
        );
        patchState(store, { users });
      },

      /**
       * Agregar usuario nuevo al store
       */
      addUser(newUser: UserEntity): void {
        const users = [...store.users(), newUser].sort((a, b) =>
          a.email.localeCompare(b.email)
        );
        patchState(store, { users });
      },

      /**
       * Limpiar error
       */
      clearError(): void {
        patchState(store, { error: null });
      },

      /**
       * Reset del store
       */
      reset(): void {
        patchState(store, initialState);
      }
    };
  })
);
