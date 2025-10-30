import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import {BrandEntity, BrandService} from '../../../entities/brand';
import {ModelEntity, ModelService} from '../../../entities/model';
import { InspectableItemTypeEnum } from '../../../shared/model/enums';
import { firstValueFrom } from 'rxjs';

// ==================== CONFIGURACIÓN DE GRUPOS Y TIPOS ====================

interface TypeConfig {
  enum: InspectableItemTypeEnum;
  label: string;
  icon: string;
  color: string;
}

interface GroupConfig {
  id: string;
  label: string;
  icon: string;
  types: TypeConfig[];
}

const CATEGORY_GROUPS: GroupConfig[] = [
  {
    id: 'COMPONENTES',
    label: 'Componentes',
    icon: 'pi-microchip',
    types: [
      {
        enum: InspectableItemTypeEnum.COMMUNICATION,
        label: 'Comunicación',
        icon: 'pi-wifi',
        color: 'sky'
      },
      {
        enum: InspectableItemTypeEnum.STATE,
        label: 'Estado',
        icon: 'pi-circle',
        color: 'cyan'
      }
    ]
  },
  {
    id: 'DISPOSITIVOS',
    label: 'Dispositivos',
    icon: 'pi-bolt',
    types: [
      {
        enum: InspectableItemTypeEnum.POWER_SUPPLY,
        label: 'Fuentes',
        icon: 'pi-bolt',
        color: 'sky'
      },
      {
        enum: InspectableItemTypeEnum.POWER_120VAC,
        label: 'Alimentación 120VAC',
        icon: 'pi-lightbulb\n',
        color: 'cyan'
      }
    ]
  },
  {
    id: 'ADICIONALES',
    label: 'Adicionales',
    icon: 'pi-ellipsis-h',
    types: [
      {
        enum: InspectableItemTypeEnum.ORDER_AND_CLEANLINESS,
        label: 'Orden y Limpieza',
        icon: 'pi-check-circle',
        color: 'sky'
      },
      {
        enum: InspectableItemTypeEnum.OTHERS,
        label: 'Otros',
        icon: 'pi-folder',
        color: 'cyan'
      }
    ]
  }
];

// ==================== STATE INTERFACES ====================

interface BrandWithModels extends BrandEntity {
  models: ModelEntity[];
  isLoadingModels: boolean;
  modelsLoaded: boolean;
}

export interface BrandsState {
  // Data
  brands: BrandWithModels[];

  // Loading
  isLoadingBrands: boolean;
  error: string | null;

  // UI State - Accordion expansion
  expandedGroups: Set<string>;
  expandedTypes: Set<InspectableItemTypeEnum>;
  expandedBrands: Set<string>;

  // Editing state
  editingBrandId: string | null;
  editingModelId: string | null;

  // Creating state
  creatingBrandForType: InspectableItemTypeEnum | null;
  creatingModelForBrandId: string | null;

  // Search
  searchQuery: string;

  // Form values
  editBrandName: string;
  editModelName: string;
  newBrandName: string;
  newModelName: string;
}

const initialState: BrandsState = {
  brands: [],
  isLoadingBrands: false,
  error: null,
  expandedGroups: new Set(),
  expandedTypes: new Set(),
  expandedBrands: new Set(),
  editingBrandId: null,
  editingModelId: null,
  creatingBrandForType: null,
  creatingModelForBrandId: null,
  searchQuery: '',
  editBrandName: '',
  editModelName: '',
  newBrandName: '',
  newModelName: ''
};

// ==================== STORE ====================

export const BrandsStore = signalStore(
  withState<BrandsState>(initialState),

  withComputed((state) => ({
    /**
     * Configuración de grupos (inmutable)
     */
    groups: computed(() => CATEGORY_GROUPS),

    /**
     * Marcas filtradas por búsqueda
     */
    filteredBrands: computed(() => {
      const query = state.searchQuery().toLowerCase().trim();
      const brands = state.brands();

      if (!query) return brands;

      // Buscar en nombre de marca O en nombres de modelos
      return brands.filter(brand => {
        const brandNameMatch = brand.name.toLowerCase().includes(query);
        const modelNameMatch = brand.models.some(model =>
          model.name.toLowerCase().includes(query)
        );
        return brandNameMatch || modelNameMatch;
      });
    }),

    /**
     * Obtener marcas por tipo (DUPLICA lógica de filteredBrands)
     */
    getBrandsByType: computed(() => {
      const query = state.searchQuery().toLowerCase().trim();
      const brands = state.brands();

      // Filtrar por búsqueda
      let filtered = brands;
      if (query) {
        filtered = brands.filter(brand => {
          const brandNameMatch = brand.name.toLowerCase().includes(query);
          const modelNameMatch = brand.models.some(model =>
            model.name.toLowerCase().includes(query)
          );
          return brandNameMatch || modelNameMatch;
        });
      }

      // Agrupar por tipo
      return (typeEnum: InspectableItemTypeEnum): BrandWithModels[] => {
        return filtered
          .filter(b => b.type === typeEnum)
          .sort((a, b) => a.name.localeCompare(b.name));
      };
    }),

    /**
     * Contador total de marcas
     */
    totalBrandsCount: computed(() => state.brands().length),

    /**
     * Contador de marcas por tipo (DUPLICA lógica de filteredBrands)
     */
    getBrandsCountByType: computed(() => {
      const query = state.searchQuery().toLowerCase().trim();
      const brands = state.brands();

      // Filtrar por búsqueda
      let filtered = brands;
      if (query) {
        filtered = brands.filter(brand => {
          const brandNameMatch = brand.name.toLowerCase().includes(query);
          const modelNameMatch = brand.models.some(model =>
            model.name.toLowerCase().includes(query)
          );
          return brandNameMatch || modelNameMatch;
        });
      }

      return (typeEnum: InspectableItemTypeEnum): number => {
        return filtered.filter(b => b.type === typeEnum).length;
      };
    }),

    /**
     * Contador de modelos por marca
     */
    getModelsCountByBrand: computed(() => {
      const brands = state.brands();
      return (brandId: string): number => {
        const brand = brands.find(b => b.id === brandId);
        return brand?.models.length ?? 0;
      };
    }),

    /**
     * Verificar si hay marcas
     */
    hasBrands: computed(() => state.brands().length > 0),

    /**
     * Verificar si no hay resultados de búsqueda (DUPLICA lógica de filteredBrands)
     */
    hasNoSearchResults: computed(() => {
      const query = state.searchQuery().toLowerCase().trim();
      const brands = state.brands();

      if (query === '') return false;

      // Filtrar por búsqueda
      const filtered = brands.filter(brand => {
        const brandNameMatch = brand.name.toLowerCase().includes(query);
        const modelNameMatch = brand.models.some(model =>
          model.name.toLowerCase().includes(query)
        );
        return brandNameMatch || modelNameMatch;
      });

      return filtered.length === 0;
    }),

    /**
     * Verificar si un grupo está expandido
     */
    isGroupExpanded: computed(() => {
      const expanded = state.expandedGroups();
      return (groupId: string): boolean => {
        return expanded.has(groupId);
      };
    }),

    /**
     * Verificar si un tipo está expandido
     */
    isTypeExpanded: computed(() => {
      const expanded = state.expandedTypes();
      return (typeEnum: InspectableItemTypeEnum): boolean => {
        return expanded.has(typeEnum);
      };
    }),

    /**
     * Verificar si una marca está expandida
     */
    isBrandExpanded: computed(() => {
      const expanded = state.expandedBrands();
      return (brandId: string): boolean => {
        return expanded.has(brandId);
      };
    }),

    /**
     * Obtener marca por ID
     */
    getBrandById: computed(() => {
      const brands = state.brands();
      return (brandId: string): BrandWithModels | undefined => {
        return brands.find(b => b.id === brandId);
      };
    }),

    /**
     * Obtener configuración de tipo por enum
     */
    getTypeConfig: computed(() => {
      return (typeEnum: InspectableItemTypeEnum): TypeConfig | undefined => {
        for (const group of CATEGORY_GROUPS) {
          const type = group.types.find(t => t.enum === typeEnum);
          if (type) return type;
        }
        return undefined;
      };
    })
  })),

  withMethods((store) => {
    const brandService = inject(BrandService);
    const modelService = inject(ModelService);

    return {
      // ==================== LOAD DATA ====================

      /**
       * Cargar todas las marcas (sin modelos)
       */
      async loadBrands(): Promise<void> {
        patchState(store, {
          isLoadingBrands: true,
          error: null
        });

        try {
          const brands = await firstValueFrom(brandService.getAll());

          const brandsWithModels: BrandWithModels[] = brands.map(brand => ({
            ...brand,
            models: [],
            isLoadingModels: false,
            modelsLoaded: false
          }));

          patchState(store, {
            brands: brandsWithModels.sort((a, b) => a.name.localeCompare(b.name)),
            isLoadingBrands: false,
            error: null
          });

        } catch (error: any) {
          console.error('❌ Error loading brands:', error);
          patchState(store, {
            brands: [],
            isLoadingBrands: false,
            error: error.message || 'Error al cargar las marcas'
          });
        }
      },

      /**
       * Cargar modelos de una marca específica
       */
      async loadModelsForBrand(brandId: string): Promise<void> {
        const brand = store.brands().find(b => b.id === brandId);
        if (!brand || brand.modelsLoaded || brand.isLoadingModels) return;

        // Marcar como cargando
        patchState(store, (state) => ({
          brands: state.brands.map(b =>
            b.id === brandId ? { ...b, isLoadingModels: true } : b
          )
        }));

        try {
          const models = await firstValueFrom(
            brandService.getAllModelsByBrandId(brandId)
          );

          patchState(store, (state) => ({
            brands: state.brands.map(b =>
              b.id === brandId
                ? {
                  ...b,
                  models: models.sort((a, b) => a.name.localeCompare(b.name)),
                  isLoadingModels: false,
                  modelsLoaded: true
                }
                : b
            )
          }));

        } catch (error: any) {
          console.error(`❌ Error loading models for brand ${brandId}:`, error);
          patchState(store, (state) => ({
            brands: state.brands.map(b =>
              b.id === brandId
                ? { ...b, isLoadingModels: false, modelsLoaded: false }
                : b
            )
          }));
        }
      },

      // ==================== ACCORDION EXPANSION ====================

      /**
       * Toggle grupo expandido/colapsado
       */
      toggleGroup(groupId: string): void {
        patchState(store, (state) => {
          const newExpanded = new Set(state.expandedGroups);
          if (newExpanded.has(groupId)) {
            newExpanded.delete(groupId);
          } else {
            newExpanded.add(groupId);
          }
          return { expandedGroups: newExpanded };
        });
      },

      /**
       * Toggle tipo expandido/colapsado
       */
      toggleType(typeEnum: InspectableItemTypeEnum): void {
        patchState(store, (state) => {
          const newExpanded = new Set(state.expandedTypes);
          if (newExpanded.has(typeEnum)) {
            newExpanded.delete(typeEnum);
          } else {
            newExpanded.add(typeEnum);
          }
          return { expandedTypes: newExpanded };
        });
      },

      /**
       * Toggle marca expandida/colapsada + cargar modelos si es necesario
       */
      async toggleBrand(brandId: string): Promise<void> {
        const isCurrentlyExpanded = store.expandedBrands().has(brandId);

        patchState(store, (state) => {
          const newExpanded = new Set(state.expandedBrands);
          if (newExpanded.has(brandId)) {
            newExpanded.delete(brandId);
          } else {
            newExpanded.add(brandId);
          }
          return { expandedBrands: newExpanded };
        });

        // Si se está expandiendo, cargar modelos
        if (!isCurrentlyExpanded) {
          await this.loadModelsForBrand(brandId);
        }
      },

      /**
       * Expandir todo el camino hasta una marca (para búsqueda)
       */
      expandPathToBrand(brandId: string): void {
        const brand = store.brands().find(b => b.id === brandId);
        if (!brand) return;

        // Encontrar grupo y tipo
        let groupId: string | null = null;
        for (const group of CATEGORY_GROUPS) {
          if (group.types.some(t => t.enum === brand.type)) {
            groupId = group.id;
            break;
          }
        }

        if (!groupId) return;

        // Expandir grupo, tipo y marca
        patchState(store, (state) => {
          const newGroups = new Set(state.expandedGroups);
          const newTypes = new Set(state.expandedTypes);
          const newBrands = new Set(state.expandedBrands);

          newGroups.add(groupId!);
          newTypes.add(brand.type);
          newBrands.add(brandId);

          return {
            expandedGroups: newGroups,
            expandedTypes: newTypes,
            expandedBrands: newBrands
          };
        });

        // Cargar modelos
        this.loadModelsForBrand(brandId);
      },

      // ==================== BRAND CRUD ====================

      /**
       * Crear nueva marca
       * TODO: Agregar validación de rol Admin
       */
      async createBrand(type: InspectableItemTypeEnum, name: string): Promise<boolean> {
        const trimmedName = name.trim();

        // TODO: Agregar más validaciones aquí (ej: nombre único por tipo)
        if (trimmedName.length < 2 || trimmedName.length > 50) {
          patchState(store, {
            error: 'El nombre debe tener entre 2 y 50 caracteres'
          });
          return false;
        }

        try {
          const newBrand: BrandEntity = {
            id: '',
            name: trimmedName,
            type,
            models: []
          };

          const created = await firstValueFrom(brandService.create(newBrand));

          const brandWithModels: BrandWithModels = {
            ...created,
            models: [],
            isLoadingModels: false,
            modelsLoaded: false
          };

          patchState(store, (state) => ({
            brands: [...state.brands, brandWithModels].sort((a, b) =>
              a.name.localeCompare(b.name)
            ),
            creatingBrandForType: null,
            newBrandName: ''
          }));

          return true;

        } catch (error: any) {
          console.error('❌ Error creating brand:', error);
          patchState(store, {
            error: error.message || 'Error al crear la marca'
          });
          return false;
        }
      },

      /**
       * Actualizar marca
       * TODO: Agregar validación de rol Admin
       */
      async updateBrand(brandId: string, name: string): Promise<boolean> {
        const trimmedName = name.trim();

        // TODO: Agregar más validaciones aquí
        if (trimmedName.length < 2 || trimmedName.length > 50) {
          patchState(store, {
            error: 'El nombre debe tener entre 2 y 50 caracteres'
          });
          return false;
        }

        try {
          const brand = store.brands().find(b => b.id === brandId);
          if (!brand) return false;

          const updated = await firstValueFrom(
            brandService.update(brandId, { ...brand, name: trimmedName })
          );

          patchState(store, (state) => ({
            brands: state.brands
              .map(b => (b.id === brandId ? { ...b, name: updated.name } : b))
              .sort((a, b) => a.name.localeCompare(b.name)),
            editingBrandId: null,
            editBrandName: ''
          }));

          return true;

        } catch (error: any) {
          console.error('❌ Error updating brand:', error);
          patchState(store, {
            error: error.message || 'Error al actualizar la marca'
          });
          return false;
        }
      },

      // ==================== MODEL CRUD ====================

      /**
       * Crear nuevo modelo
       * TODO: Agregar validación de rol Admin
       */
      async createModel(brandId: string, name: string): Promise<boolean> {
        const trimmedName = name.trim();

        // TODO: Agregar más validaciones aquí
        if (trimmedName.length < 2 || trimmedName.length > 50) {
          patchState(store, {
            error: 'El nombre debe tener entre 2 y 50 caracteres'
          });
          return false;
        }

        try {
          const newModel: ModelEntity = {
            id: '',
            name: trimmedName,
            brandId,
            descriptions: []
          };

          const created = await firstValueFrom(modelService.create(newModel));

          patchState(store, (state) => ({
            brands: state.brands.map(b =>
              b.id === brandId
                ? {
                  ...b,
                  models: [...b.models, created].sort((a, b) =>
                    a.name.localeCompare(b.name)
                  )
                }
                : b
            ),
            creatingModelForBrandId: null,
            newModelName: ''
          }));

          return true;

        } catch (error: any) {
          console.error('❌ Error creating model:', error);
          patchState(store, {
            error: error.message || 'Error al crear el modelo'
          });
          return false;
        }
      },

      /**
       * Actualizar modelo
       * TODO: Agregar validación de rol Admin
       */
      async updateModel(
        brandId: string,
        modelId: string,
        name: string
      ): Promise<boolean> {
        const trimmedName = name.trim();

        // TODO: Agregar más validaciones aquí
        if (trimmedName.length < 2 || trimmedName.length > 50) {
          patchState(store, {
            error: 'El nombre debe tener entre 2 y 50 caracteres'
          });
          return false;
        }

        try {
          const brand = store.brands().find(b => b.id === brandId);
          const model = brand?.models.find(m => m.id === modelId);
          if (!model) return false;

          const updated = await firstValueFrom(
            modelService.update(modelId, { ...model, name: trimmedName })
          );

          patchState(store, (state) => ({
            brands: state.brands.map(b =>
              b.id === brandId
                ? {
                  ...b,
                  models: b.models
                    .map(m => (m.id === modelId ? { ...m, name: updated.name } : m))
                    .sort((a, b) => a.name.localeCompare(b.name))
                }
                : b
            ),
            editingModelId: null,
            editModelName: ''
          }));

          return true;

        } catch (error: any) {
          console.error('❌ Error updating model:', error);
          patchState(store, {
            error: error.message || 'Error al actualizar el modelo'
          });
          return false;
        }
      },

      // ==================== UI STATE ====================

      /**
       * Establecer búsqueda y auto-expandir resultados
       */
      setSearchQuery(query: string): void {
        patchState(store, { searchQuery: query });

        // Si hay búsqueda, auto-expandir primer resultado
        if (query.trim() !== '') {
          setTimeout(() => {
            const filtered = store.filteredBrands();
            if (filtered.length > 0) {
              this.expandPathToBrand(filtered[0].id);
            }
          }, 100);
        }
      },

      /**
       * Limpiar búsqueda
       */
      clearSearch(): void {
        patchState(store, { searchQuery: '' });
      },

      /**
       * Modo crear marca
       */
      startCreatingBrand(type: InspectableItemTypeEnum): void {
        patchState(store, {
          creatingBrandForType: type,
          newBrandName: ''
        });
      },

      cancelCreatingBrand(): void {
        patchState(store, {
          creatingBrandForType: null,
          newBrandName: ''
        });
      },

      /**
       * Modo crear modelo
       */
      startCreatingModel(brandId: string): void {
        patchState(store, {
          creatingModelForBrandId: brandId,
          newModelName: ''
        });
      },

      cancelCreatingModel(): void {
        patchState(store, {
          creatingModelForBrandId: null,
          newModelName: ''
        });
      },

      /**
       * Modo editar marca
       */
      startEditingBrand(brandId: string, currentName: string): void {
        patchState(store, {
          editingBrandId: brandId,
          editBrandName: currentName
        });
      },

      cancelEditingBrand(): void {
        patchState(store, {
          editingBrandId: null,
          editBrandName: ''
        });
      },

      /**
       * Modo editar modelo
       */
      startEditingModel(modelId: string, currentName: string): void {
        patchState(store, {
          editingModelId: modelId,
          editModelName: currentName
        });
      },

      cancelEditingModel(): void {
        patchState(store, {
          editingModelId: null,
          editModelName: ''
        });
      },

      /**
       * Actualizar valores de formularios
       */
      setNewBrandName(name: string): void {
        patchState(store, { newBrandName: name });
      },

      setNewModelName(name: string): void {
        patchState(store, { newModelName: name });
      },

      setEditBrandName(name: string): void {
        patchState(store, { editBrandName: name });
      },

      setEditModelName(name: string): void {
        patchState(store, { editModelName: name });
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
