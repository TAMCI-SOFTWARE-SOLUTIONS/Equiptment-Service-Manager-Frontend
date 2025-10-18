import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import {IdentityDocumentTypeEnum} from '../../../../entities/profile/model/enums/identity-document-type.enum';
import {GenderEnum, ProfileEntity, ProfileService} from '../../../../entities/profile';
import {FileService} from '../../../../entities/file/api/file.service';

export interface CollaboratorFormData {
  names: string;
  firstSurname: string;
  secondSurname: string;
  gender: GenderEnum | null;
  identityDocumentType: IdentityDocumentTypeEnum | null;
  identityDocumentNumber: string;
  email: string;
  shouldCreateUser: boolean;
  photoFile: File | null;
}

export interface CollaboratorFormState {
  // Stepper
  currentStep: number;
  totalSteps: number;

  // Form data
  formData: CollaboratorFormData;

  // Photo
  photoFileId: string | null;
  photoPreviewUrl: string | null;
  isUploadingPhoto: boolean;

  // Loading & submission
  isSubmitting: boolean;

  // Validation
  validationErrors: {
    names?: string;
    firstSurname?: string;
    secondSurname?: string;
    gender?: string;
    identityDocumentType?: string;
    identityDocumentNumber?: string;
    email?: string;
    photoFile?: string;
  };

  error: string | null;
}

const initialState: CollaboratorFormState = {
  currentStep: 1,
  totalSteps: 2,
  formData: {
    names: '',
    firstSurname: '',
    secondSurname: '',
    gender: null,
    identityDocumentType: null,
    identityDocumentNumber: '',
    email: '',
    shouldCreateUser: false,
    photoFile: null
  },
  photoFileId: null,
  photoPreviewUrl: null,
  isUploadingPhoto: false,
  isSubmitting: false,
  validationErrors: {},
  error: null
};

export const CollaboratorFormStore = signalStore(
  withState<CollaboratorFormState>(initialState),

  withComputed((state) => ({
    /**
     * Validación Step 1
     */
    isStep1Valid: computed(() => {
      const data = state.formData();
      const errors = state.validationErrors();

      return data.names.trim().length >= 2 &&
        data.firstSurname.trim().length >= 2 &&
        data.secondSurname.trim().length >= 2 &&
        data.gender !== null &&
        data.identityDocumentType !== null &&
        data.identityDocumentNumber.trim().length > 0 &&
        !errors.names &&
        !errors.firstSurname &&
        !errors.secondSurname &&
        !errors.identityDocumentNumber;
    }),

    /**
     * Validación Step 2
     */
    isStep2Valid: computed(() => {
      const data = state.formData();
      const errors = state.validationErrors();

      return data.email.trim().length > 0 &&
        !errors.email &&
        !errors.photoFile;
    }),

    /**
     * Puede avanzar al siguiente step
     */
    canGoNext: computed(() => {
      const currentStep = state.currentStep();
      const data = state.formData();
      const errors = state.validationErrors();

      if (currentStep === 1) {
        // Duplicar lógica de isStep1Valid
        return data.names.trim().length >= 2 &&
          data.firstSurname.trim().length >= 2 &&
          data.secondSurname.trim().length >= 2 &&
          data.gender !== null &&
          data.identityDocumentType !== null &&
          data.identityDocumentNumber.trim().length > 0 &&
          !errors.names &&
          !errors.firstSurname &&
          !errors.secondSurname &&
          !errors.identityDocumentNumber;
      }

      return false;
    }),

    /**
     * Puede enviar el formulario
     */
    canSubmit: computed(() => {
      const data = state.formData();
      const errors = state.validationErrors();

      // Duplicar lógica de isStep1Valid
      const step1Valid = data.names.trim().length >= 2 &&
        data.firstSurname.trim().length >= 2 &&
        data.secondSurname.trim().length >= 2 &&
        data.gender !== null &&
        data.identityDocumentType !== null &&
        data.identityDocumentNumber.trim().length > 0 &&
        !errors.names &&
        !errors.firstSurname &&
        !errors.secondSurname &&
        !errors.identityDocumentNumber;

      // Duplicar lógica de isStep2Valid
      const step2Valid = data.email.trim().length > 0 &&
        !errors.email &&
        !errors.photoFile;

      return step1Valid &&
        step2Valid &&
        !state.isSubmitting() &&
        !state.isUploadingPhoto();
    }),

    /**
     * Progreso del stepper
     */
    progress: computed(() => (state.currentStep() / state.totalSteps()) * 100),

    /**
     * Título del step actual
     */
    currentStepTitle: computed(() => {
      const titles: Record<number, string> = {
        1: 'Datos Personales',
        2: 'Configuración y Confirmación'
      };
      return titles[state.currentStep()] || '';
    }),

    /**
     * Descripción del step actual
     */
    currentStepDescription: computed(() => {
      const descriptions: Record<number, string> = {
        1: 'Información básica del colaborador',
        2: 'Email, usuario y foto de perfil'
      };
      return descriptions[state.currentStep()] || '';
    }),

    /**
     * Nombre completo
     */
    fullName: computed(() => {
      const data = state.formData();
      return `${data.names} ${data.firstSurname} ${data.secondSurname}`.trim();
    })
  })),

  withMethods((store) => {
    const profileService = inject(ProfileService);
    const fileService = inject(FileService);

    return {
      /**
       * Inicializar formulario
       */
      initialize(): void {
        patchState(store, initialState);
      },

      // ==================== NAVIGATION ====================

      goToNextStep(): void {
        const currentStep = store.currentStep();

        if (currentStep < store.totalSteps() && store.canGoNext()) {
          patchState(store, {
            currentStep: currentStep + 1
          });
        }
      },

      goToPreviousStep(): void {
        const currentStep = store.currentStep();

        if (currentStep > 1) {
          patchState(store, {
            currentStep: currentStep - 1
          });
        }
      },

      goToStep(step: number): void {
        if (step >= 1 && step <= store.totalSteps()) {
          patchState(store, { currentStep: step });
        }
      },

      // ==================== SETTERS ====================

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
        this.validateFirstSurname(firstSurname);
      },

      setSecondSurname(secondSurname: string): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, secondSurname }
        }));
        this.validateSecondSurname(secondSurname);
      },

      setGender(gender: GenderEnum | null): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, gender }
        }));
      },

      setIdentityDocumentType(type: IdentityDocumentTypeEnum | null): void {
        patchState(store, (state) => ({
          formData: {
            ...state.formData,
            identityDocumentType: type,
            identityDocumentNumber: '' // Reset number when type changes
          }
        }));
      },

      setIdentityDocumentNumber(number: string): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, identityDocumentNumber: number }
        }));
        this.validateIdentityDocumentNumber(number, store.formData().identityDocumentType);
      },

      setEmail(email: string): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, email }
        }));
        this.validateEmail(email);
      },

      setShouldCreateUser(shouldCreateUser: boolean): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, shouldCreateUser }
        }));
      },

      async setPhotoFile(file: File | null): Promise<void> {
        if (!file) {
          patchState(store, (state) => ({
            formData: { ...state.formData, photoFile: null },
            photoPreviewUrl: null,
            photoFileId: null
          }));
          return;
        }

        // Validar tamaño (máx 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
          const errors = { ...store.validationErrors() };
          errors.photoFile = 'La foto no puede superar 5MB';
          patchState(store, { validationErrors: errors });
          return;
        }

        // Validar tipo
        if (!file.type.startsWith('image/')) {
          const errors = { ...store.validationErrors() };
          errors.photoFile = 'Solo se permiten imágenes';
          patchState(store, { validationErrors: errors });
          return;
        }

        // Clear error
        const errors = { ...store.validationErrors() };
        delete errors.photoFile;

        // Preview URL
        const previewUrl = URL.createObjectURL(file);

        patchState(store, (state) => ({
          formData: { ...state.formData, photoFile: file },
          photoPreviewUrl: previewUrl,
          validationErrors: errors
        }));
      },

      clearPhoto(): void {
        // Revoke preview URL
        if (store.photoPreviewUrl()) {
          URL.revokeObjectURL(store.photoPreviewUrl()!);
        }

        patchState(store, (state) => ({
          formData: { ...state.formData, photoFile: null },
          photoPreviewUrl: null,
          photoFileId: null
        }));
      },

      // ==================== VALIDATIONS ====================

      validateNames(names: string): void {
        const errors = { ...store.validationErrors() };

        if (!names.trim()) {
          errors.names = 'Los nombres son requeridos';
        } else if (names.trim().length < 2) {
          errors.names = 'Debe tener al menos 2 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(names)) {
          errors.names = 'Solo se permiten letras y espacios';
        } else {
          delete errors.names;
        }

        patchState(store, { validationErrors: errors });
      },

      validateFirstSurname(surname: string): void {
        const errors = { ...store.validationErrors() };

        if (!surname.trim()) {
          errors.firstSurname = 'El apellido paterno es requerido';
        } else if (surname.trim().length < 2) {
          errors.firstSurname = 'Debe tener al menos 2 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(surname)) {
          errors.firstSurname = 'Solo se permiten letras y espacios';
        } else {
          delete errors.firstSurname;
        }

        patchState(store, { validationErrors: errors });
      },

      validateSecondSurname(surname: string): void {
        const errors = { ...store.validationErrors() };

        if (!surname.trim()) {
          errors.secondSurname = 'El apellido materno es requerido';
        } else if (surname.trim().length < 2) {
          errors.secondSurname = 'Debe tener al menos 2 caracteres';
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(surname)) {
          errors.secondSurname = 'Solo se permiten letras y espacios';
        } else {
          delete errors.secondSurname;
        }

        patchState(store, { validationErrors: errors });
      },

      validateIdentityDocumentNumber(number: string, type: IdentityDocumentTypeEnum | null): void {
        const errors = { ...store.validationErrors() };

        if (!number.trim()) {
          errors.identityDocumentNumber = 'El número de documento es requerido';
          patchState(store, { validationErrors: errors });
          return;
        }

        if (!type) {
          delete errors.identityDocumentNumber;
          patchState(store, { validationErrors: errors });
          return;
        }

        // Patrones según tipo de documento
        const patterns: Record<IdentityDocumentTypeEnum, { regex: RegExp; message: string }> = {
          [IdentityDocumentTypeEnum.DNI]: {
            regex: /^\d{8}$/,
            message: 'DNI debe tener 8 dígitos'
          },
          [IdentityDocumentTypeEnum.FOREIGNER_ID_CARD]: {
            regex: /^[A-Z0-9]{9,12}$/,
            message: 'Carné de extranjería: 9-12 caracteres alfanuméricos'
          },
          [IdentityDocumentTypeEnum.PASSPORT]: {
            regex: /^[A-Z]\d{7}$/,
            message: 'Pasaporte: 1 letra + 7 dígitos'
          },
          [IdentityDocumentTypeEnum.TEMPORARY_RESIDENCE_PERMIT]: {
            regex: /^[A-Z0-9]{9,15}$/,
            message: 'PTP: 9-15 caracteres alfanuméricos'
          },
          [IdentityDocumentTypeEnum.TEMPORARY_RESIDENCE_CARD]: {
            regex: /^[A-Z0-9]{9,15}$/,
            message: 'CPP: 9-15 caracteres alfanuméricos'
          },
          [IdentityDocumentTypeEnum.OTHER]: {
            regex: /^[A-Z0-9-]{4,20}$/,
            message: 'Otro: 4-20 caracteres alfanuméricos con guiones'
          }
        };

        const pattern = patterns[type];
        if (pattern && !pattern.regex.test(number.toUpperCase())) {
          errors.identityDocumentNumber = pattern.message;
        } else {
          delete errors.identityDocumentNumber;
        }

        patchState(store, { validationErrors: errors });
      },

      validateEmail(email: string): void {
        const errors = { ...store.validationErrors() };

        if (!email.trim()) {
          errors.email = 'El email es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          errors.email = 'Formato de email inválido';
        } else {
          delete errors.email;
        }

        patchState(store, { validationErrors: errors });
      },

      // ==================== SUBMIT ====================

      async submit(): Promise<ProfileEntity | null> {
        // Validar todo
        this.validateNames(store.formData().names);
        this.validateFirstSurname(store.formData().firstSurname);
        this.validateSecondSurname(store.formData().secondSurname);
        this.validateIdentityDocumentNumber(
          store.formData().identityDocumentNumber,
          store.formData().identityDocumentType
        );
        this.validateEmail(store.formData().email);

        if (!store.canSubmit()) {
          return null;
        }

        patchState(store, {
          isSubmitting: true,
          error: null
        });

        try {
          let photoFileId: string | null = null;

          // Upload photo if exists
          if (store.formData().photoFile) {
            patchState(store, { isUploadingPhoto: true });

            const uploadedFile = await firstValueFrom(
              fileService.upload(store.formData().photoFile!)
            );

            photoFileId = uploadedFile.id;

            patchState(store, {
              photoFileId,
              isUploadingPhoto: false
            });
          }

          // Create profile
          const profileData: ProfileEntity = {
            id: '', // Backend generates
            userId: '', // Not needed for creation
            names: store.formData().names.trim(),
            firstSurname: store.formData().firstSurname.trim(),
            secondSurname: store.formData().secondSurname.trim(),
            gender: store.formData().gender!,
            identityDocumentType: store.formData().identityDocumentType!,
            identityDocumentNumber: store.formData().identityDocumentNumber.trim().toUpperCase(),
            email: store.formData().email.trim().toLowerCase(),
            shouldCreateUser: store.formData().shouldCreateUser,
            photoFileId
          };

          const result = await firstValueFrom(
            profileService.create(profileData)
          );

          console.log('✅ Collaborator created:', result);

          patchState(store, {
            isSubmitting: false,
            error: null
          });

          return result;

        } catch (error: any) {
          console.error('❌ Error creating collaborator:', error);

          patchState(store, {
            isSubmitting: false,
            isUploadingPhoto: false,
            error: error.message || 'Error al crear el colaborador'
          });

          return null;
        }
      },

      clearError(): void {
        patchState(store, { error: null });
      },

      reset(): void {
        // Cleanup preview URL
        if (store.photoPreviewUrl()) {
          URL.revokeObjectURL(store.photoPreviewUrl()!);
        }

        patchState(store, initialState);
      }
    };
  })
);
