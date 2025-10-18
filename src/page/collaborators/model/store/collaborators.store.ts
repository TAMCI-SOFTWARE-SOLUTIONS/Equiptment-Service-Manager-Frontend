import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import {GenderEnum, ProfileEntity, ProfileService} from '../../../../entities/profile';
import {IdentityDocumentTypeEnum} from '../../../../entities/profile/model/enums/identity-document-type.enum';
import {FileService} from '../../../../entities/file/api/file.service';

export interface CollaboratorWithPhoto extends ProfileEntity {
  photoUrl: string | null;
  initials: string;
  fullName: string;
}

export interface CollaboratorsState {
  // Data
  collaborators: CollaboratorWithPhoto[];

  // Filters
  searchTerm: string;
  filterByGender: GenderEnum | null;
  filterByDocumentType: IdentityDocumentTypeEnum | null;

  // Pagination
  currentPage: number;
  itemsPerPage: number;

  // Sorting
  sortBy: 'name' | 'email' | 'document' | null;
  sortOrder: 'asc' | 'desc';

  // Loading states
  isLoading: boolean;
  isLoadingPhotos: boolean;

  error: string | null;
}

const initialState: CollaboratorsState = {
  collaborators: [],
  searchTerm: '',
  filterByGender: null,
  filterByDocumentType: null,
  currentPage: 1,
  itemsPerPage: 10,
  sortBy: 'name',
  sortOrder: 'asc',
  isLoading: false,
  isLoadingPhotos: false,
  error: null
};

export const CollaboratorsStore = signalStore(
  withState<CollaboratorsState>(initialState),

  withComputed((state) => {
    return {
      /**
       * Filtered collaborators
       */
      filteredCollaborators: computed(() => {
        let collaborators = state.collaborators();
        const term = state.searchTerm().toLowerCase();
        const gender = state.filterByGender();
        const docType = state.filterByDocumentType();

        // Search
        if (term) {
          collaborators = collaborators.filter(c =>
            c.fullName.toLowerCase().includes(term) ||
            c.email.toLowerCase().includes(term) ||
            c.identityDocumentNumber.toLowerCase().includes(term)
          );
        }

        // Filter by gender
        if (gender) {
          collaborators = collaborators.filter(c => c.gender === gender);
        }

        // Filter by document type
        if (docType) {
          collaborators = collaborators.filter(c => c.identityDocumentType === docType);
        }

        return collaborators;
      }),

      /**
       * Sorted collaborators
       */
      sortedCollaborators: computed(() => {
        // ✅ FIX: Usar state en lugar de referencia circular
        const collaborators = [...state.collaborators()];
        const term = state.searchTerm().toLowerCase();
        const gender = state.filterByGender();
        const docType = state.filterByDocumentType();

        // Apply filters inline
        let filtered = collaborators;

        if (term) {
          filtered = filtered.filter(c =>
            c.fullName.toLowerCase().includes(term) ||
            c.email.toLowerCase().includes(term) ||
            c.identityDocumentNumber.toLowerCase().includes(term)
          );
        }

        if (gender) {
          filtered = filtered.filter(c => c.gender === gender);
        }

        if (docType) {
          filtered = filtered.filter(c => c.identityDocumentType === docType);
        }

        // Apply sorting
        const sortBy = state.sortBy();
        const sortOrder = state.sortOrder();

        if (sortBy) {
          filtered.sort((a, b) => {
            let aValue: string;
            let bValue: string;

            switch (sortBy) {
              case 'name':
                aValue = a.fullName;
                bValue = b.fullName;
                break;
              case 'email':
                aValue = a.email;
                bValue = b.email;
                break;
              case 'document':
                aValue = a.identityDocumentNumber;
                bValue = b.identityDocumentNumber;
                break;
              default:
                return 0;
            }

            const comparison = aValue.localeCompare(bValue);
            return sortOrder === 'asc' ? comparison : -comparison;
          });
        }

        return filtered;
      }),

      /**
       * Paginated collaborators
       */
      paginatedCollaborators: computed(() => {
        // ✅ FIX: Recalcular filtrado y ordenamiento inline
        const collaborators = [...state.collaborators()];
        const term = state.searchTerm().toLowerCase();
        const gender = state.filterByGender();
        const docType = state.filterByDocumentType();

        // Apply filters
        let filtered = collaborators;

        if (term) {
          filtered = filtered.filter(c =>
            c.fullName.toLowerCase().includes(term) ||
            c.email.toLowerCase().includes(term) ||
            c.identityDocumentNumber.toLowerCase().includes(term)
          );
        }

        if (gender) {
          filtered = filtered.filter(c => c.gender === gender);
        }

        if (docType) {
          filtered = filtered.filter(c => c.identityDocumentType === docType);
        }

        // Apply sorting
        const sortBy = state.sortBy();
        const sortOrder = state.sortOrder();

        if (sortBy) {
          filtered.sort((a, b) => {
            let aValue: string;
            let bValue: string;

            switch (sortBy) {
              case 'name':
                aValue = a.fullName;
                bValue = b.fullName;
                break;
              case 'email':
                aValue = a.email;
                bValue = b.email;
                break;
              case 'document':
                aValue = a.identityDocumentNumber;
                bValue = b.identityDocumentNumber;
                break;
              default:
                return 0;
            }

            const comparison = aValue.localeCompare(bValue);
            return sortOrder === 'asc' ? comparison : -comparison;
          });
        }

        // Apply pagination
        const page = state.currentPage();
        const perPage = state.itemsPerPage();
        const start = (page - 1) * perPage;
        const end = start + perPage;

        return filtered.slice(start, end);
      }),

      /**
       * Total pages
       */
      totalPages: computed(() => {
        // ✅ FIX: Recalcular filtrado inline
        const collaborators = state.collaborators();
        const term = state.searchTerm().toLowerCase();
        const gender = state.filterByGender();
        const docType = state.filterByDocumentType();

        let filtered = collaborators;

        if (term) {
          filtered = filtered.filter(c =>
            c.fullName.toLowerCase().includes(term) ||
            c.email.toLowerCase().includes(term) ||
            c.identityDocumentNumber.toLowerCase().includes(term)
          );
        }

        if (gender) {
          filtered = filtered.filter(c => c.gender === gender);
        }

        if (docType) {
          filtered = filtered.filter(c => c.identityDocumentType === docType);
        }

        const total = filtered.length;
        const perPage = state.itemsPerPage();
        return Math.ceil(total / perPage);
      }),

      /**
       * Total count
       */
      totalCount: computed(() => {
        // ✅ FIX: Recalcular filtrado inline
        const collaborators = state.collaborators();
        const term = state.searchTerm().toLowerCase();
        const gender = state.filterByGender();
        const docType = state.filterByDocumentType();

        let filtered = collaborators;

        if (term) {
          filtered = filtered.filter(c =>
            c.fullName.toLowerCase().includes(term) ||
            c.email.toLowerCase().includes(term) ||
            c.identityDocumentNumber.toLowerCase().includes(term)
          );
        }

        if (gender) {
          filtered = filtered.filter(c => c.gender === gender);
        }

        if (docType) {
          filtered = filtered.filter(c => c.identityDocumentType === docType);
        }

        return filtered.length;
      }),

      /**
       * Has filters active
       */
      hasActiveFilters: computed(() => {
        return state.searchTerm().length > 0 ||
          state.filterByGender() !== null ||
          state.filterByDocumentType() !== null;
      }),

      /**
       * Pagination info
       */
      paginationInfo: computed(() => {
        const page = state.currentPage();
        const perPage = state.itemsPerPage();

        // ✅ FIX: Usar totalCount calculado inline
        const collaborators = state.collaborators();
        const term = state.searchTerm().toLowerCase();
        const gender = state.filterByGender();
        const docType = state.filterByDocumentType();

        let filtered = collaborators;

        if (term) {
          filtered = filtered.filter(c =>
            c.fullName.toLowerCase().includes(term) ||
            c.email.toLowerCase().includes(term) ||
            c.identityDocumentNumber.toLowerCase().includes(term)
          );
        }

        if (gender) {
          filtered = filtered.filter(c => c.gender === gender);
        }

        if (docType) {
          filtered = filtered.filter(c => c.identityDocumentType === docType);
        }

        const total = filtered.length;
        const start = (page - 1) * perPage + 1;
        const end = Math.min(page * perPage, total);

        return { start, end, total };
      })
    };
  }),

  withMethods((store) => {
    const profileService = inject(ProfileService);
    const fileService = inject(FileService);

    return {
      /**
       * Load all collaborators
       */
      async loadCollaborators(): Promise<void> {
        patchState(store, {
          isLoading: true,
          error: null
        });

        try {
          const profiles = await firstValueFrom(profileService.getAll());

          // Map profiles to collaborators with initial data
          const collaborators: CollaboratorWithPhoto[] = profiles.map(profile => ({
            ...profile,
            photoUrl: null,
            fullName: `${profile.names} ${profile.firstSurname} ${profile.secondSurname}`.trim(),
            initials: this.generateInitials(profile.names, profile.firstSurname)
          }));

          patchState(store, {
            collaborators,
            isLoading: false,
            error: null
          });

          // Load photos in background
          this.loadPhotos(collaborators);

        } catch (error: any) {
          console.error('❌ Error loading collaborators:', error);
          patchState(store, {
            collaborators: [],
            isLoading: false,
            error: error.message || 'Error al cargar los colaboradores'
          });
        }
      },

      /**
       * Load photos for collaborators
       */
      async loadPhotos(collaborators: CollaboratorWithPhoto[]): Promise<void> {
        patchState(store, { isLoadingPhotos: true });

        const collaboratorsWithPhotos = await Promise.all(
          collaborators.map(async (collaborator) => {
            if (!collaborator.photoFileId) {
              return collaborator;
            }

            try {
              const photoUrl = await firstValueFrom(
                fileService.viewFileAsUrl(collaborator.photoFileId)
              );

              return { ...collaborator, photoUrl };
            } catch (error) {
              console.warn(`⚠️ Error loading photo for ${collaborator.fullName}`);
              return collaborator;
            }
          })
        );

        patchState(store, {
          collaborators: collaboratorsWithPhotos,
          isLoadingPhotos: false
        });
      },

      /**
       * Generate initials from names
       */
      generateInitials(names: string, firstSurname: string): string {
        const firstInitial = names.charAt(0).toUpperCase();
        const lastInitial = firstSurname.charAt(0).toUpperCase();
        return `${firstInitial}${lastInitial}`;
      },

      // ==================== SEARCH & FILTERS ====================

      setSearchTerm(term: string): void {
        patchState(store, {
          searchTerm: term,
          currentPage: 1 // Reset to first page
        });
      },

      setGenderFilter(gender: GenderEnum | null): void {
        patchState(store, {
          filterByGender: gender,
          currentPage: 1
        });
      },

      setDocumentTypeFilter(docType: IdentityDocumentTypeEnum | null): void {
        patchState(store, {
          filterByDocumentType: docType,
          currentPage: 1
        });
      },

      clearFilters(): void {
        patchState(store, {
          searchTerm: '',
          filterByGender: null,
          filterByDocumentType: null,
          currentPage: 1
        });
      },

      // ==================== SORTING ====================

      setSorting(sortBy: 'name' | 'email' | 'document'): void {
        const currentSortBy = store.sortBy();
        const currentOrder = store.sortOrder();

        // Toggle order if clicking same column
        if (currentSortBy === sortBy) {
          patchState(store, {
            sortOrder: currentOrder === 'asc' ? 'desc' : 'asc'
          });
        } else {
          patchState(store, {
            sortBy,
            sortOrder: 'asc'
          });
        }
      },

      // ==================== PAGINATION ====================

      setPage(page: number): void {
        const totalPages = store.totalPages();

        if (page >= 1 && page <= totalPages) {
          patchState(store, { currentPage: page });
        }
      },

      nextPage(): void {
        const currentPage = store.currentPage();
        const totalPages = store.totalPages();

        if (currentPage < totalPages) {
          patchState(store, { currentPage: currentPage + 1 });
        }
      },

      previousPage(): void {
        const currentPage = store.currentPage();

        if (currentPage > 1) {
          patchState(store, { currentPage: currentPage - 1 });
        }
      },

      setItemsPerPage(items: number): void {
        patchState(store, {
          itemsPerPage: items,
          currentPage: 1
        });
      },

      // ==================== UTILS ====================

      getGenderLabel(gender: GenderEnum): string {
        return gender === GenderEnum.MALE ? 'Masculino' : 'Femenino';
      },

      getDocumentTypeLabel(docType: IdentityDocumentTypeEnum): string {
        const labels: Record<IdentityDocumentTypeEnum, string> = {
          [IdentityDocumentTypeEnum.DNI]: 'DNI',
          [IdentityDocumentTypeEnum.FOREIGNER_ID_CARD]: 'C. Extranjería',
          [IdentityDocumentTypeEnum.PASSPORT]: 'Pasaporte',
          [IdentityDocumentTypeEnum.TEMPORARY_RESIDENCE_PERMIT]: 'Permiso Temporal',
          [IdentityDocumentTypeEnum.TEMPORARY_RESIDENCE_CARD]: 'C. Residencia Temporal',
          [IdentityDocumentTypeEnum.OTHER]: 'Otro'
        };
        return labels[docType] || docType;
      },

      clearError(): void {
        patchState(store, { error: null });
      },

      reset(): void {
        patchState(store, initialState);
      }
    };
  })
);
