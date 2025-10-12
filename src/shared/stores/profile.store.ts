import {computed, inject} from '@angular/core';
import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import {firstValueFrom} from 'rxjs';
import {AuthStore} from './auth.store';
import {ProfileEntity, ProfileService} from '../../entities/profile';
import {FileService} from '../../entities/file/api/file.service';

export interface ProfileState {
  profile: ProfileEntity | null;
  profileImageUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  profile: null,
  profileImageUrl: null,
  isLoading: false,
  error: null
};

export const ProfileStore = signalStore(
  { providedIn: 'root' },
  withState<ProfileState>(initialState),

  withComputed((state) => {
    const authStore = inject(AuthStore);
    return {
      // Computed properties
      fullName: computed(() => {
        const profile = state.profile();
        if (!profile) return null;
        return `${profile.names} ${profile.firstSurname} ${profile.secondSurname}`.trim();
      }),

      displayName: computed(() => {
        const profile = state.profile();
        if (!profile) return null;
        return `${profile.names} ${profile.firstSurname}`.trim();
      }),

      userRole: computed(() => {
        const profile = state.profile();
        if (!profile) return 'Usuario';
        // Aquí puedes mapear el género o algún campo del perfil a un rol
        // Por ahora devolveremos un rol por defecto
        return 'Usuario';
      }),

      userInitials: computed(() => {
        const profile = state.profile();
        if (!profile) return 'U';
        return `${profile.names.charAt(0)}${profile.firstSurname.charAt(0)}`.toUpperCase();
      }),

      hasProfile: computed(() => !!state.profile()),
      hasProfileImage: computed(() => !!state.profileImageUrl()),
      isProfileLoading: computed(() => state.isLoading()),

      // Computed que depende del AuthStore
      userId: computed(() => authStore.userId()),
      isAuthenticated: computed(() => authStore.isAuthenticated())
    };
  }),

  withMethods((store) => {
    const profileService = inject(ProfileService);
    const fileService = inject(FileService);
    const authStore = inject(AuthStore);

    return {
      /**
       * Cargar perfil del usuario actual
       * Se ejecuta automáticamente cuando el usuario está autenticado
       */
      async loadProfile(): Promise<void> {
        const userId = authStore.userId();

        if (!userId) {
          patchState(store, {
            profile: null,
            profileImageUrl: null,
            error: null
          });
          return;
        }

        patchState(store, {
          isLoading: true,
          error: null
        });

        try {
          // Obtener perfil usando el userId del AuthStore
          const profile = await firstValueFrom(profileService.getByUserId(userId));

          patchState(store, {
            profile,
            isLoading: false,
            error: null
          });

          // Cargar imagen del perfil si existe photoFileId
          if (profile.photoFileId) {
            await this.loadProfileImage(profile.photoFileId);
          } else {
            patchState(store, { profileImageUrl: null });
          }
        } catch (error: any) {
          patchState(store, {
            profile: null,
            profileImageUrl: null,
            isLoading: false,
            error: error.message || 'Error al cargar el perfil'
          });
        }
      },

      /**
       * Cargar imagen del perfil usando el photoFileId
       */
      async loadProfileImage(photoFileId: string): Promise<void> {
        if (!photoFileId) {
          patchState(store, { profileImageUrl: null });
          return;
        }

        try {
          // Verificar si el archivo existe primero
          const fileExists = await firstValueFrom(fileService.fileExists(photoFileId));

          if (fileExists) {
            const imageUrl = await firstValueFrom(fileService.viewFileAsUrl(photoFileId));
            patchState(store, { profileImageUrl: imageUrl });
          } else {
            patchState(store, { profileImageUrl: null });
          }
        } catch (error: any) {
          console.warn('Error al cargar imagen del perfil:', error.message);
          patchState(store, { profileImageUrl: null });
        }
      },

      /**
       * Actualizar perfil completo (perfil + imagen)
       */
      async refreshProfile(): Promise<void> {
        await this.loadProfile();
      },

      /**
       * Actualizar solo la imagen del perfil
       */
      async refreshProfileImage(): Promise<void> {
        const profile = store.profile();
        if (profile?.photoFileId) {
          await this.loadProfileImage(profile.photoFileId);
        }
      },

      /**
       * Limpiar estado del perfil (útil para logout)
       */
      clearProfile(): void {
        patchState(store, {
          profile: null,
          profileImageUrl: null,
          isLoading: false,
          error: null
        });
      },

      /**
       * Actualizar información del perfil localmente
       */
      updateProfile(updates: Partial<ProfileEntity>): void {
        const currentProfile = store.profile();
        if (currentProfile) {
          const updatedProfile = { ...currentProfile, ...updates };
          patchState(store, { profile: updatedProfile });

          // Si cambió el photoFileId, recargar la imagen
          if (updates.photoFileId && updates.photoFileId !== currentProfile.photoFileId) {
            this.loadProfileImage(updates.photoFileId).then(() => {});
          }
        }
      },

      /**
       * Limpiar error
       */
      clearError(): void {
        patchState(store, { error: null });
      },

      /**
       * Inicializar el store (se llama cuando el usuario se autentica)
       */
      initialize(): void {
        // Suscribirse a cambios en la autenticación
        authStore.isAuthenticated;

        // Si el usuario está autenticado, cargar el perfil
        if (authStore.isAuthenticated()) {
          this.loadProfile().then(() => {});
        } else {
          this.clearProfile();
        }
      }
    };
  })
);
