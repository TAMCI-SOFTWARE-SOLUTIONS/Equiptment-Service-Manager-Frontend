import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import {GenderEnum, ProfileEntity, ProfileService} from '../../../../entities/profile';
import {IdentityDocumentTypeEnum} from '../../../../entities/profile/model/enums/identity-document-type.enum';
import {FileService} from '../../../../entities/file/api/file.service';

export interface CollaboratorDetailState {
  profile: ProfileEntity | null;
  photoUrl: string | null;
  isLoading: boolean;
  isLoadingPhoto: boolean;
  error: string | null;
}

const initialState: CollaboratorDetailState = {
  profile: null,
  photoUrl: null,
  isLoading: false,
  isLoadingPhoto: false,
  error: null
};

export const CollaboratorDetailStore = signalStore(
  withState<CollaboratorDetailState>(initialState),

  withComputed((state) => ({
    /**
     * Indica si hay perfil cargado
     */
    hasProfile: computed(() => state.profile() !== null),

    /**
     * Nombre completo
     */
    fullName: computed(() => {
      const profile = state.profile();
      if (!profile) return '';
      return `${profile.names} ${profile.firstSurname} ${profile.secondSurname}`.trim();
    }),

    /**
     * Iniciales para avatar
     */
    initials: computed(() => {
      const profile = state.profile();
      if (!profile) return '';
      const firstInitial = profile.names.charAt(0).toUpperCase();
      const lastInitial = profile.firstSurname.charAt(0).toUpperCase();
      return `${firstInitial}${lastInitial}`;
    }),

    /**
     * Indica si tiene usuario asociado
     */
    hasUser: computed(() => {
      const profile = state.profile();
      return profile?.userId !== null &&
        profile?.userId !== undefined &&
        profile?.userId.trim() !== '';
    }),

    /**
     * Indica si tiene foto
     */
    hasPhoto: computed(() => {
      const profile = state.profile();
      return profile?.photoFileId !== null &&
        profile?.photoFileId !== undefined;
    }),

    /**
     * Label del género
     */
    genderLabel: computed(() => {
      const profile = state.profile();
      if (!profile) return '';

      const labels: Record<GenderEnum, string> = {
        [GenderEnum.MALE]: 'Masculino',
        [GenderEnum.FEMALE]: 'Femenino'
      };

      return labels[profile.gender] || profile.gender;
    }),

    /**
     * Label del tipo de documento
     */
    documentTypeLabel: computed(() => {
      const profile = state.profile();
      if (!profile) return '';

      const labels: Record<IdentityDocumentTypeEnum, string> = {
        [IdentityDocumentTypeEnum.DNI]: 'DNI',
        [IdentityDocumentTypeEnum.FOREIGNER_ID_CARD]: 'Carné de Extranjería',
        [IdentityDocumentTypeEnum.PASSPORT]: 'Pasaporte',
        [IdentityDocumentTypeEnum.TEMPORARY_RESIDENCE_PERMIT]: 'Permiso Temporal de Permanencia',
        [IdentityDocumentTypeEnum.TEMPORARY_RESIDENCE_CARD]: 'Carnet de Permiso Temporal',
        [IdentityDocumentTypeEnum.OTHER]: 'Otro'
      };

      return labels[profile.identityDocumentType] || profile.identityDocumentType;
    })
  })),

  withMethods((store) => {
    const profileService = inject(ProfileService);
    const fileService = inject(FileService);

    return {
      /**
       * Cargar perfil por ID
       */
      async loadProfile(profileId: string): Promise<void> {
        patchState(store, {
          isLoading: true,
          error: null
        });

        try {
          const profile = await firstValueFrom(profileService.getById(profileId));

          patchState(store, {
            profile,
            isLoading: false,
            error: null
          });

          // Cargar foto si existe
          if (profile.photoFileId) {
            this.loadPhoto(profile.photoFileId);
          }

        } catch (error: any) {
          console.error('❌ Error loading profile:', error);
          patchState(store, {
            profile: null,
            isLoading: false,
            error: error.message || 'Error al cargar el colaborador'
          });
        }
      },

      /**
       * Cargar foto del colaborador
       */
      async loadPhoto(fileId: string): Promise<void> {
        patchState(store, { isLoadingPhoto: true });

        try {
          const photoUrl = await firstValueFrom(fileService.viewFileAsUrl(fileId));

          patchState(store, {
            photoUrl,
            isLoadingPhoto: false
          });

        } catch (error: any) {
          console.error('❌ Error loading photo:', error);
          patchState(store, {
            photoUrl: null,
            isLoadingPhoto: false
          });
        }
      },

      /**
       * TODO: Generar usuario para el colaborador
       * Este método creará un usuario asociado al colaborador
       */
      async generateUser(): Promise<boolean> {
        const profile = store.profile();
        if (!profile) return false;

        console.log('🚧 TODO: Implementar generación de usuario');
        console.log('Perfil:', profile);

        // TODO: Implementar cuando el backend esté listo
        // const result = await firstValueFrom(profileService.generateUser(profile.id));

        return false;
      },

      /**
       * TODO: Suspender colaborador
       * Este método desactivará temporalmente al colaborador
       */
      async suspendCollaborator(): Promise<boolean> {
        const profile = store.profile();
        if (!profile) return false;

        console.log('🚧 TODO: Implementar suspensión de colaborador');
        console.log('Perfil:', profile);

        // TODO: Implementar cuando el backend esté listo
        // const result = await firstValueFrom(profileService.suspend(profile.id));

        return false;
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
        // Cleanup photo URL
        if (store.photoUrl()) {
          URL.revokeObjectURL(store.photoUrl()!);
        }

        patchState(store, initialState);
      }
    };
  })
);
