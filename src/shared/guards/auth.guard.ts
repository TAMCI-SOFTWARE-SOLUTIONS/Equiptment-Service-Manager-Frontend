import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {AuthStore} from '../stores';
import {RolesEnum} from '../../entities/role/model';
import {ContextStore} from '../model/context.store';

/*
 * Auth guard
 * This guard checks if the user is authenticated
 * If not, it redirects to the login page
 */
export const authGuard: CanActivateFn = (_, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login'], {
    queryParams: {returnUrl: state.url}
  }).then(() =>{});

  return false;
};

/*
 * Role guard
 * This guard checks if the user is authenticated and has the required role
 * If not, it redirects to the unauthorized page
 */
export const roleGuard = (allowedRoles: RolesEnum[]): CanActivateFn => {
  return () => {
    const authStore = inject(AuthStore);
    const router = inject(Router);

    if (!authStore.isAuthenticated()) {
      router.navigate(['/login']).then(() => {});
      return false;
    }

    const hasRequiredRole = authStore.hasAllowedRoles(allowedRoles);

    if (hasRequiredRole) {
      return true;
    }

    router.navigate(['/unauthorized']).then();
    return false;
  };
};

/**
 * Context preference guard
 * Tries to autoload context from user preferences before checking
 * Should be used AFTER authGuard
 */
export const contextPreferenceGuard: CanActivateFn = async (_, state) => {
  const contextStore = inject(ContextStore);
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (contextStore.hasContext()) {
    return true;
  }

  const prefs = authStore.userPreferences();

  if (prefs?.lastSelectedClientId && prefs?.lastSelectedProjectId) {
    try {
      await contextStore.loadContext(
        prefs.lastSelectedClientId,
        prefs.lastSelectedProjectId
      );

      if (contextStore.hasContext()) {
        return true;
      }
    } catch (error) {
      console.error('Error loading context from preferences:', error);
    }
  }
  router.navigate(['/select-context'], {
    queryParams: { returnUrl: state.url }
  }).then();

  return false;
};
