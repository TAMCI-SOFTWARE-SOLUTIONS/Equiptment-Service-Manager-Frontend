import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { UserEntity } from '../../entities/user/model';
import { StorageService } from '../services';
import { RolesEnum } from '../../entities/role/model';
import { AuthenticationService, SignInCredentials } from '../../entities/user/api';
import { EventBusService } from '../services';
import { EventNames } from '../events/event-names';
import { AuthLoginPayload, AuthLogoutPayload, AuthRestoredPayload, AuthRefreshPayload } from '../events/event-payloads';

export interface AuthState {
  user: UserEntity | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  tokenValidated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  tokenValidated: false
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>(initialState),

  withComputed((state) => ({
    userId: computed(() => state.user()?.id || null),
    username: computed(() => state.user()?.username || null),
    userRoles: computed(() => state.user()?.roles || []),
    isAdmin: computed(() => state.user()?.roles.some(role => role.name === RolesEnum.ROLE_MUNICIPAL_ADMINISTRATOR) || false),
  })),

  withMethods((store) => {
    const storageService = inject(StorageService);
    const authService = inject(AuthenticationService);
    const router = inject(Router);
    const eventBus = inject(EventBusService);

    return {
      hasRole(roleName: string) {
        return !!store.user()?.roles?.some(role => role.name === roleName);
      },

      /*
       * Initialize auth
       * Se ejecuta al iniciar la app para restaurar sesión desde storage
       */
      initializeAuth() {
        const token = storageService.getToken();
        const user = storageService.getUser();

        if (token && user) {
          patchState(store, {
            user,
            token,
            isAuthenticated: true,
            tokenValidated: false
          });

          const payload: AuthRestoredPayload = {
            userId: user.id,
            token: token,
            user: user,
            timestamp: new Date()
          };
          eventBus.emit(EventNames.AUTH_RESTORED, payload);

          this.validateToken().then(() => {});
        }
      },

      async validateToken() {
        if (!store.token()) return;

        try {
          const user = await firstValueFrom(authService.getCurrentUser());

          if (user) {
            storageService.setUser(user);
            patchState(store, {
              user,
              isAuthenticated: true,
              tokenValidated: true,
              error: null
            });
          }
        } catch (error) {
          this.handleTokenExpiration();
        }
      },

      handleTokenExpiration() {
        const currentUserId = store.user()?.id || null;

        storageService.clearAuthData();
        patchState(store, {
          user: null,
          token: null,
          isAuthenticated: false,
          tokenValidated: false,
          error: 'Sesión expirada. Por favor inicia sesión nuevamente.'
        });

        const payload: AuthLogoutPayload = {
          reason: 'token_expired',
          userId: currentUserId,
          timestamp: new Date()
        };
        eventBus.emit(EventNames.AUTH_LOGOUT, payload);

        router.navigate(['/login']).then(() => {});
      },

      /*
       * Sign In - Login desde formulario
       */
      async signIn(credentials: SignInCredentials) {
        patchState(store, {
          isLoading: true,
          error: null,
          tokenValidated: false
        });

        try {
          const user = await firstValueFrom(authService.signIn(credentials));

          if (user && user.token) {
            storageService.setToken(user.token);

            const completeUser = await firstValueFrom(authService.getCurrentUser());

            storageService.setUser(completeUser);

            console.log('✅ Usuario autenticado:', completeUser);

            patchState(store, {
              user: completeUser,
              token: user.token,
              isAuthenticated: true,
              isLoading: false,
              tokenValidated: true,
              error: null
            });

            const payload: AuthLoginPayload = {
              userId: completeUser.id,
              user: completeUser,
              token: user.token,
              timestamp: new Date()
            };
            eventBus.emit(EventNames.AUTH_LOGIN, payload);

            await router.navigate(['/dashboard']);
          } else {
            patchState(store, {
              isLoading: false,
              error: 'No se recibió token de autenticación'
            });
          }
        } catch (error: any) {
          patchState(store, {
            isLoading: false,
            error: error.message || 'Error durante el inicio de sesión'
          });
        }
      },

      /*
       * Sign Out - Cerrar sesión manual
       */
      signOut() {
        const currentUserId = store.user()?.id || null;

        storageService.clearAuthData();

        const payload: AuthLogoutPayload = {
          reason: 'manual',
          userId: currentUserId,
          timestamp: new Date()
        };
        eventBus.emit(EventNames.AUTH_LOGOUT, payload);

        patchState(store, {
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          tokenValidated: false
        });

        router.navigate(['/login']).then(() => {});
      },

      retryValidation() {
        if (store.token()) {
          patchState(store, { tokenValidated: false });
          this.validateToken().then(() => {});
        }
      },

      updateUser(updates: Partial<UserEntity>) {
        if (store.user()) {
          const updatedUser = { ...store.user()!, ...updates };
          storageService.setUser(updatedUser);
          patchState(store, { user: updatedUser });
        }
      },

      /*
       * Refresh User - Refrescar datos del usuario actual
       */
      async refreshUser() {
        patchState(store, {
          isLoading: true,
          error: null,
          tokenValidated: false
        });

        try {
          const user = await firstValueFrom(authService.getCurrentUser());

          if (user) {
            storageService.setUser(user);

            const currentToken = store.token();

            patchState(store, {
              user,
              isAuthenticated: true,
              isLoading: false,
              tokenValidated: true,
              error: null
            });

            const payload: AuthRefreshPayload = {
              userId: user.id,
              user: user,
              token: currentToken!,
              timestamp: new Date()
            };
            eventBus.emit(EventNames.AUTH_REFRESH, payload);

          } else {
            patchState(store, {
              isLoading: false,
              error: 'No se pudo recuperar el usuario autenticado'
            });
          }
        } catch (error: any) {
          patchState(store, {
            isLoading: false,
            error: error.message || 'Error al actualizar los datos del usuario'
          });
        }
      },

      clearError() {
        patchState(store, { error: null });
      }
    };
  })
);
