import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import {firstValueFrom} from 'rxjs';
import {UserEntity} from '../../entities/user/model';
import {StorageService} from '../services';
import {RolesEnum} from '../../entities/role/model';
import {AuthenticationService, SignInCredentials} from '../../entities/user/api';
import {ProfileStore} from './profile.store';

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
    const profileStore = inject(ProfileStore);
    return {
      /*
       * Check if authenticated
       * This method is used to check if the user is authenticated
       * For example, when the app starts or when the user logs in
       */
      hasRole(roleName: string) {
        return !!store.user()?.roles?.some(role => role.name === roleName);
      },

      /*
       * Initialize auth
       * This method is used to initialize the auth state
       * For example, when the app starts or when the user logs in
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

          // Validate token after initialization
          this.validateToken().then(() => {});
        }
      },

      /*
       * Validate token
       * This method is used to validate the token
       * For example, after a token expiration or when the user logs in
       */
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
          // This will be handled by the interceptor
          this.handleTokenExpiration();
        }
      },

      /*
       * Handle token expiration
       * This method is used to handle token expiration
       * For example, after a token expiration or when the user logs in
       */
      handleTokenExpiration() {
        storageService.clearAuthData();
        patchState(store, {
          user: null,
          token: null,
          isAuthenticated: false,
          tokenValidated: false,
          error: 'Sesión expirada. Por favor inicia sesión nuevamente.'
        });
        router.navigate(['/login']).then(() => {});
      },

      /*
       * Sign In
       * This method is used to sign in the user
       * For example, after a user clicks on the "Sign In" button
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

            console.log(completeUser);

            patchState(store, {
              user,
              token: user.token,
              isAuthenticated: true,
              isLoading: false,
              tokenValidated: true,
              error: null
            });

            // Initialize profile store after successful login
            profileStore.initialize(user.id);

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
       * Sign Out
       * This method is used to sign out the user
       * For example, after a user clicks on the "Sign Out" button
       */
      signOut() {
        storageService.clearAuthData();
        // Clear profile store
        profileStore.clearProfile();
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

      /*
       * Retry validation
       * This method is used to retry token validation if it fails
       * For example, after a token expiration or when the user logs in
       */
      retryValidation() {
        if (store.token()) {
          patchState(store, { tokenValidated: false });
          this.validateToken().then(() => {});
        }
      },

      /*
       * Update user data
       * This method is used to update the user data in the store
       * For example, after a successful sign-in or sign-out
       */
      updateUser(updates: Partial<UserEntity>) {
        if (store.user()) {
          const updatedUser = { ...store.user()!, ...updates };
          storageService.setUser(updatedUser);
          patchState(store, { user: updatedUser });
        }
      },

      /*
       * Refresh user data
       * This method is used to refresh the user data when needed
       * For example, after a token expiration or when the user logs in
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
            patchState(store, {
              user,
              isAuthenticated: true,
              isLoading: false,
              tokenValidated: true,
              error: null
            });

            // Initialize profile store after user refresh
            profileStore.initialize(user.id);

            await router.navigate(['/dashboard']);
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

      /*
       * Clear error
       * This method is used to clear the error state when an action is successful
       * For example, after a successful sign-in or sign-out
       */
      clearError() {
        patchState(store, { error: null });
      }
    };
  })
);
