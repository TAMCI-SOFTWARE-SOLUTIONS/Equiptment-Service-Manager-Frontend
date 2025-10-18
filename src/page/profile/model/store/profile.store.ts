import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import {GenderEnum, ProfileEntity, ProfileService} from '../../../../entities/profile';
import {IdentityDocumentTypeEnum} from '../../../../entities/profile/model/enums/identity-document-type.enum';
import {AuthStore} from '../../../../shared/stores';
import {FileService} from '../../../../entities/file/api/file.service';

export interface ProfileFormData {
  names: string;
  firstSurname: string;
  secondSurname: string;
  gender: GenderEnum;
  identityDocumentType: IdentityDocumentTypeEnum;
  identityDocumentNumber: string;
  email: string;
  photoFileId: string | null;
}

export interface ProfileState {
  // Profile data
  profile: ProfileEntity | null;

  // Photo
  photoUrl: string | null;
  isLoadingPhoto: boolean;

  // Edit mode
  isEditMode: boolean;
  formData: ProfileFormData;

  // Photo upload
  selectedFile: File | null;
  uploadingPhoto: boolean;

  // Loading states
  isLoading: boolean;
  isSaving: boolean;

  // Validation
  validationErrors: {
    names?: string;
    firstSurname?: string;
    secondSurname?: string;
    identityDocumentNumber?: string;
  };

  error: string | null;
}

const initialFormData: ProfileFormData = {
  names: '',
  firstSurname: '',
  secondSurname: '',
  gender: GenderEnum.MALE,
  identityDocumentType: IdentityDocumentTypeEnum.DNI,
  identityDocumentNumber: '',
  email: '',
  photoFileId: null
};

const initialState: ProfileState = {
  profile: null,
  photoUrl: null,
  isLoadingPhoto: false,
  isEditMode: false,
  formData: initialFormData,
  selectedFile: null,
  uploadingPhoto: false,
  isLoading: false,
  isSaving: false,
  validationErrors: {},
  error: null
};

export const ProfileStore = signalStore(
  withState<ProfileState>(initialState),

  withComputed((state) => {
    const authStore = inject(AuthStore);

    return {
      /**
       * Full name
       */
      fullName: computed(() => {
        const profile = state.profile();
        if (!profile) return '';

        return `${profile.names} ${profile.firstSurname} ${profile.secondSurname}`.trim();
      }),

      /**
       * Initials for avatar
       */
      initials: computed(() => {
        const profile = state.profile();
        if (!profile) return '?';

        const firstInitial = profile.names.charAt(0).toUpperCase();
        const lastInitial = profile.firstSurname.charAt(0).toUpperCase();

        return `${firstInitial}${lastInitial}`;
      }),

      /**
       * Gender label
       */
      genderLabel: computed(() => {
        const gender = state.profile()?.gender || state.formData().gender;
        return gender === GenderEnum.MALE ? 'Masculino' : 'Femenino';
      }),

      /**
       * Document type label
       */
      documentTypeLabel: computed(() => {
        const docType = state.profile()?.identityDocumentType || state.formData().identityDocumentType;

        const labels: Record<IdentityDocumentTypeEnum, string> = {
          [IdentityDocumentTypeEnum.DNI]: 'DNI',
          [IdentityDocumentTypeEnum.FOREIGNER_ID_CARD]: 'Carné de Extranjería',
          [IdentityDocumentTypeEnum.PASSPORT]: 'Pasaporte',
          [IdentityDocumentTypeEnum.TEMPORARY_RESIDENCE_PERMIT]: 'Permiso Temporal de Residencia',
          [IdentityDocumentTypeEnum.TEMPORARY_RESIDENCE_CARD]: 'Carné de Residencia Temporal',
          [IdentityDocumentTypeEnum.OTHER]: 'Otro'
        };

        return labels[docType] || docType;
      }),

      /**
       * Can save
       */
      canSave: computed(() => {
        const data = state.formData();
        const errors = state.validationErrors();

        return data.names.trim().length > 0 &&
          data.firstSurname.trim().length > 0 &&
          data.secondSurname.trim().length > 0 &&
          data.identityDocumentNumber.trim().length > 0 &&
          Object.keys(errors).length === 0 &&
          !state.isSaving();
      }),

      /**
       * Has changes
       */
      hasChanges: computed(() => {
        const profile = state.profile();
        const formData = state.formData();

        if (!profile) return false;

        return profile.names !== formData.names ||
          profile.firstSurname !== formData.firstSurname ||
          profile.secondSurname !== formData.secondSurname ||
          profile.gender !== formData.gender ||
          profile.identityDocumentType !== formData.identityDocumentType ||
          profile.identityDocumentNumber !== formData.identityDocumentNumber ||
          state.selectedFile() !== null;
      }),

      /**
       * Current user ID
       */
      currentUserId: computed(() => authStore.userId())
    };
  }),

  withMethods((store) => {
    const profileService = inject(ProfileService);
    const fileService = inject(FileService);
    const authStore = inject(AuthStore);

    return {
      /**
       * Load profile
       */
      async loadProfile(): Promise<void> {
        const userId = authStore.userId();

        if (!userId) {
          patchState(store, {
            error: 'No hay usuario autenticado'
          });
          return;
        }

        patchState(store, {
          isLoading: true,
          error: null
        });

        try {
          const profile = await firstValueFrom(
            profileService.getByUserId(userId)
          );

          patchState(store, {
            profile,
            formData: {
              names: profile.names,
              firstSurname: profile.firstSurname,
              secondSurname: profile.secondSurname,
              gender: profile.gender,
              identityDocumentType: profile.identityDocumentType,
              identityDocumentNumber: profile.identityDocumentNumber,
              email: profile.email,
              photoFileId: profile.photoFileId
            },
            isLoading: false,
            error: null
          });

          // Load photo if exists
          if (profile.photoFileId) {
            this.loadPhoto(profile.photoFileId);
          }

        } catch (error: any) {
          console.error('❌ Error loading profile:', error);
          patchState(store, {
            profile: null,
            isLoading: false,
            error: error.message || 'Error al cargar el perfil'
          });
        }
      },

      /**
       * Load photo
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
       * Toggle edit mode
       */
      toggleEditMode(): void {
        const isEditMode = store.isEditMode();

        if (isEditMode) {
          // Cancelar: restaurar datos originales
          const profile = store.profile();
          if (profile) {
            patchState(store, {
              isEditMode: false,
              formData: {
                names: profile.names,
                firstSurname: profile.firstSurname,
                secondSurname: profile.secondSurname,
                gender: profile.gender,
                identityDocumentType: profile.identityDocumentType,
                identityDocumentNumber: profile.identityDocumentNumber,
                email: profile.email,
                photoFileId: profile.photoFileId
              },
              selectedFile: null,
              validationErrors: {}
            });
          }
        } else {
          // Entrar en modo edición
          patchState(store, { isEditMode: true });
        }
      },

      /**
       * Set form field
       */
      setNames(names: string): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, names }
        }));
        this.validateNames(names);
      },

      setFirstSurname(firstSurname: string): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, firstSurname }
        }));
        this.validateSurname(firstSurname, 'firstSurname');
      },

      setSecondSurname(secondSurname: string): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, secondSurname }
        }));
        this.validateSurname(secondSurname, 'secondSurname');
      },

      setGender(gender: GenderEnum): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, gender }
        }));
      },

      setIdentityDocumentType(identityDocumentType: IdentityDocumentTypeEnum): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, identityDocumentType }
        }));
        // Re-validar el número de documento con el nuevo tipo
        this.validateDocumentNumber(store.formData().identityDocumentNumber, identityDocumentType);
      },

      setIdentityDocumentNumber(identityDocumentNumber: string): void {
        // Convertir a mayúsculas automáticamente
        const upperValue = identityDocumentNumber.toUpperCase();

        patchState(store, (state) => ({
          formData: { ...state.formData, identityDocumentNumber: upperValue }
        }));
        this.validateDocumentNumber(upperValue, store.formData().identityDocumentType);
      },

      /**
       * Handle photo selection
       */
      selectPhoto(file: File): void {
        // Validar tamaño
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (file.size > maxSize) {
          patchState(store, {
            error: 'La imagen no puede superar los 5MB'
          });
          return;
        }

        // Validar tipo
        if (!file.type.startsWith('image/')) {
          patchState(store, {
            error: 'Solo se permiten archivos de imagen'
          });
          return;
        }

        patchState(store, {
          selectedFile: file,
          error: null
        });
      },

      removeSelectedPhoto(): void {
        patchState(store, {
          selectedFile: null
        });
      },

      // ==================== VALIDATIONS ====================

      validateNames(names: string): void {
        const errors = { ...store.validationErrors() };
        const trimmed = names.trim();

        if (!trimmed) {
          errors.names = 'Los nombres son requeridos';
        } else if (trimmed.length < 2) {
          errors.names = 'Debe tener al menos 2 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(trimmed)) {
          errors.names = 'Solo se permiten letras y espacios';
        } else {
          delete errors.names;
        }

        patchState(store, { validationErrors: errors });
      },

      validateSurname(surname: string, field: 'firstSurname' | 'secondSurname'): void {
        const errors = { ...store.validationErrors() };
        const trimmed = surname.trim();

        if (!trimmed) {
          errors[field] = 'El apellido es requerido';
        } else if (trimmed.length < 2) {
          errors[field] = 'Debe tener al menos 2 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(trimmed)) {
          errors[field] = 'Solo se permiten letras y espacios';
        } else {
          delete errors[field];
        }

        patchState(store, { validationErrors: errors });
      },

      validateDocumentNumber(value: string, type: IdentityDocumentTypeEnum): void {
        const errors = { ...store.validationErrors() };
        const trimmed = value.trim();

        if (!trimmed) {
          errors.identityDocumentNumber = 'El número de documento es requerido';
          patchState(store, { validationErrors: errors });
          return;
        }

        let pattern: RegExp;
        let errorMessage: string;

        switch (type) {
          case IdentityDocumentTypeEnum.DNI:
            pattern = /^\d{8}$/;
            errorMessage = 'El DNI debe tener exactamente 8 dígitos';
            break;

          case IdentityDocumentTypeEnum.FOREIGNER_ID_CARD:
            pattern = /^[A-Z0-9]{9,12}$/;
            errorMessage = 'Carné de Extranjería: alfanumérico 9-12 caracteres';
            break;

          case IdentityDocumentTypeEnum.PASSPORT:
            pattern = /^[A-Z]\d{7}$/;
            errorMessage = 'Pasaporte: 1 letra seguida de 7 dígitos (ej: A1234567)';
            break;

          case IdentityDocumentTypeEnum.TEMPORARY_RESIDENCE_PERMIT:
          case IdentityDocumentTypeEnum.TEMPORARY_RESIDENCE_CARD:
            pattern = /^[A-Z0-9]{9,15}$/;
            errorMessage = 'Permiso temporal: alfanumérico 9-15 caracteres';
            break;

          case IdentityDocumentTypeEnum.OTHER:
            pattern = /^[A-Z0-9-]{4,20}$/;
            errorMessage = 'Documento: alfanumérico con guiones, 4-20 caracteres';
            break;

          default:
            delete errors.identityDocumentNumber;
            patchState(store, { validationErrors: errors });
            return;
        }

        if (!pattern.test(trimmed)) {
          errors.identityDocumentNumber = errorMessage;
        } else {
          delete errors.identityDocumentNumber;
        }

        patchState(store, { validationErrors: errors });
      },

      // ==================== SAVE ====================

      async save(): Promise<boolean> {
        if (!store.canSave()) {
          return false;
        }

        patchState(store, {
          isSaving: true,
          error: null
        });

        try {
          const profile = store.profile();
          const formData = store.formData();
          const selectedFile = store.selectedFile();

          if (!profile) {
            throw new Error('No hay perfil cargado');
          }

          let photoFileId = formData.photoFileId;

          // Upload photo if selected
          if (selectedFile) {
            patchState(store, { uploadingPhoto: true });

            const uploadedFile = await firstValueFrom(fileService.upload(selectedFile));

            photoFileId = uploadedFile.id;

            patchState(store, { uploadingPhoto: false });
          }

          // Update profile
          const updatedProfile: ProfileEntity = {
            ...profile,
            names: formData.names.trim(),
            firstSurname: formData.firstSurname.trim(),
            secondSurname: formData.secondSurname.trim(),
            gender: formData.gender,
            identityDocumentType: formData.identityDocumentType,
            identityDocumentNumber: formData.identityDocumentNumber.trim(),
            photoFileId
          };

          const savedProfile = await firstValueFrom(
            profileService.update(profile.id, updatedProfile)
          );

          patchState(store, {
            profile: savedProfile,
            formData: {
              names: savedProfile.names,
              firstSurname: savedProfile.firstSurname,
              secondSurname: savedProfile.secondSurname,
              gender: savedProfile.gender,
              identityDocumentType: savedProfile.identityDocumentType,
              identityDocumentNumber: savedProfile.identityDocumentNumber,
              email: savedProfile.email,
              photoFileId: savedProfile.photoFileId
            },
            selectedFile: null,
            isSaving: false,
            isEditMode: false,
            error: null
          });

          // Reload photo if changed
          if (photoFileId) {
            this.loadPhoto(photoFileId);
          }

          return true;

        } catch (error: any) {
          console.error('❌ Error saving profile:', error);
          patchState(store, {
            isSaving: false,
            uploadingPhoto: false,
            error: error.message || 'Error al guardar el perfil'
          });

          return false;
        }
      },

      /**
       * Clear error
       */
      clearError(): void {
        patchState(store, { error: null });
      },

      /**
       * Reset
       */
      reset(): void {
        patchState(store, initialState);
      }
    };
  })
);
