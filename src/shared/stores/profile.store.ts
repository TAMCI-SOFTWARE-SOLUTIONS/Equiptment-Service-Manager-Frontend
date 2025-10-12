import {computed, inject} from '@angular/core';
import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import {firstValueFrom} from 'rxjs';
import {ProfileEntity, ProfileService} from '../../entities/profile';
import {FileService} from '../../entities/file/api/file.service';
import {EventBusService} from '../services';
import {EventNames} from '../events/event-names';
import {ProfileClearedPayload, ProfileImageUpdatedPayload, ProfileUpdatedPayload} from '../events/event-payloads';

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

  withComputed((state) => ({
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

    userInitials: computed(() => {
      const profile = state.profile();
      if (!profile) return 'U';
      return `${profile.names.charAt(0)}${profile.firstSurname.charAt(0)}`.toUpperCase();
    }),

    hasProfile: computed(() => !!state.profile()),
    hasProfileImage: computed(() => !!state.profileImageUrl()),
    isProfileLoading: computed(() => state.isLoading())
  })),

  withMethods((store) => {
    const profileService = inject(ProfileService);
    const fileService = inject(FileService);
    const eventBus = inject(EventBusService);

    /*
     * Configure event listeners
     */
    void (() => {
      // Add Events when this is ready
      // Be careful with the order of these events
      // as they may depend on each other
    })();

    const methods = {
      /**
       * Cargar perfil del usuario por userId
       */
      async loadProfile(userId: string): Promise<void> {
        if (!userId) {
          console.warn('⚠️ ProfileStore - No se puede cargar perfil sin userId');
          patchState(store, {
            profile: null,
            profileImageUrl: null,
            error: null
          });
          return;
        }

        console.log('🔄 ProfileStore - Cargando perfil para userId:', userId);

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

          console.log('✅ ProfileStore - Perfil cargado exitosamente:', profile);

          // 🔥 Emitir evento de perfil actualizado
          const payload: ProfileUpdatedPayload = {
            userId: profile.userId,
            profile: profile,
            timestamp: new Date()
          };
          eventBus.emit(EventNames.PROFILE_UPDATED, payload);

          // Cargar imagen del perfil si existe photoFileId válido
          if (profile.photoFileId && profile.photoFileId.trim() !== '') {
            await methods.loadProfileImage(profile.photoFileId);
          } else {
            console.log('ℹ️ ProfileStore - No hay photoFileId, imagen nula');
            patchState(store, { profileImageUrl: null });
          }
        } catch (error: any) {
          console.error('❌ ProfileStore - Error al cargar perfil:', error);
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
        if (!photoFileId || photoFileId.trim() === '') {
          console.log('ℹ️ ProfileStore - photoFileId vacío, imagen nula');
          patchState(store, { profileImageUrl: null });
          return;
        }

        console.log('photo:', photoFileId);

        console.log('🔄 ProfileStore - Cargando imagen del perfil:', photoFileId);

        try {
          const imageUrl = await firstValueFrom(fileService.viewFileAsUrl(photoFileId));

          if (imageUrl) {
            patchState(store, { profileImageUrl: imageUrl });

            console.log('✅ ProfileStore - Imagen de perfil cargada exitosamente');

            // 🔥 Emitir evento de imagen actualizada
            const payload: ProfileImageUpdatedPayload = {
              userId: store.profile()?.userId,
              imageUrl: imageUrl,
              timestamp: new Date()
            };
            eventBus.emit(EventNames.PROFILE_IMAGE_UPDATED, payload);
          } else {
            console.warn('⚠️ ProfileStore - viewFileAsUrl retornó null/undefined');
            patchState(store, { profileImageUrl: null });
          }
        } catch (error: any) {
          console.warn('⚠️ ProfileStore - Error al cargar imagen del perfil:', error.message);
          patchState(store, { profileImageUrl: null });
        }
      },

      /**
       * Actualizar perfil completo (perfil + imagen)
       */
      async refreshProfile(userId: string): Promise<void> {
        console.log('🔄 ProfileStore - Refrescando perfil completo');
        await methods.loadProfile(userId);
      },

      /**
       * Actualizar solo la imagen del perfil
       */
      async refreshProfileImage(): Promise<void> {
        console.log('🔄 ProfileStore - Refrescando solo imagen del perfil');
        const profile = store.profile();
        if (profile?.photoFileId && profile.photoFileId.trim() !== '') {
          await methods.loadProfileImage(profile.photoFileId);
        } else {
          patchState(store, { profileImageUrl: null });
        }
      },

      /**
       * Limpiar estado del perfil (útil para logout)
       */
      clearProfile(): void {
        console.log('🧹 ProfileStore - Limpiando perfil');

        patchState(store, {
          profile: null,
          profileImageUrl: null,
          isLoading: false,
          error: null
        });

        // 🔥 Emitir evento de perfil limpiado
        const payload: ProfileClearedPayload = {
          reason: 'logout',
          timestamp: new Date()
        };
        eventBus.emit(EventNames.PROFILE_CLEARED, payload);
      },

      /**
       * Actualizar información del perfil localmente
       */
      updateProfile(updates: Partial<ProfileEntity>): void {
        console.log('🔄 ProfileStore - Actualizando perfil localmente:', updates);
        const currentProfile = store.profile();
        if (currentProfile) {
          const updatedProfile = { ...currentProfile, ...updates };
          patchState(store, { profile: updatedProfile });

          // Si cambió el photoFileId, recargar la imagen
          if (updates.photoFileId && updates.photoFileId !== currentProfile.photoFileId) {
            methods.loadProfileImage(updates.photoFileId).then(() => {});
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
       * Inicializar el store con un userId específico
       * NOTA: Este método ahora es principalmente para uso manual/testing
       * Ya que el store se inicializa automáticamente escuchando eventos
       */
      initialize(userId: string): void {
        console.log('🚀 ProfileStore - Initialize llamado manualmente con userId:', userId);
        if (userId) {
          methods.loadProfile(userId).then(() => {});
        } else {
          methods.clearProfile();
        }
      }
    };

    return methods;
  })
);
