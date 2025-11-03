import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { BrandEntity, BrandService } from '../../../entities/brand';
import { ModelEntity, ModelService } from '../../../entities/model';
import { InspectableItemTypeEnum } from '../../../shared/model/enums';
import { firstValueFrom } from 'rxjs';
import {DescriptionEntity} from '../../../entities/description/model/entities/description.entity';
import {DescriptionService} from '../../../entities/description/api/services/description.service';

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
/*      {
        enum: InspectableItemTypeEnum.POWER_SUPPLY,
        label: 'Fuentes',
        icon: 'pi-bolt',
        color: 'sky'
      },*/
      {
        enum: InspectableItemTypeEnum.POWER_120VAC,
        label: 'Alimentación 120VAC',
        icon: 'pi-lightbulb',
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

interface BrandWithState extends BrandEntity {
  isLoadingModels: boolean;
  modelsLoaded: boolean;
}

interface ModelWithState extends ModelEntity {
  isLoadingDescriptions: boolean;
  descriptionsLoaded: boolean;
}

export interface BrandsState {
  // Data
  brands: BrandWithState[];

  // Loading states
  isLoadingBrands: boolean;
  error: string | null;

  // UI State - Accordion expansion
  expandedGroups: Set<string>;
  expandedTypes: Set<InspectableItemTypeEnum>;
  expandedBrands: Set<string>;
  expandedModels: Set<string>;

  // Editing state
  editingBrandId: string | null;
  editingModelId: string | null;
  editingDescriptionId: string | null;

  // Creating state
  creatingBrandForType: InspectableItemTypeEnum | null;
  creatingModelForBrandId: string | null;
  creatingDescriptionForModelId: string | null;

  // Search
  searchQuery: string;

  // Form values
  editBrandName: string;
  editModelName: string;
  editDescriptionName: string;
  newBrandName: string;
  newModelName: string;
  newDescriptionName: string;
}

const initialState: BrandsState = {
  brands: [],
  isLoadingBrands: false,
  error: null,
  expandedGroups: new Set(),
  expandedTypes: new Set(),
  expandedBrands: new Set(),
  expandedModels: new Set(),
  editingBrandId: null,
  editingModelId: null,
  editingDescriptionId: null,
  creatingBrandForType: null,
  creatingModelForBrandId: null,
  creatingDescriptionForModelId: null,
  searchQuery: '',
  editBrandName: '',
  editModelName: '',
  editDescriptionName: '',
  newBrandName: '',
  newModelName: '',
  newDescriptionName: ''
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
     * Marcas filtradas por búsqueda (Brand + Model + Description)
     */
    filteredBrands: computed(() => {
      const query = state.searchQuery().toLowerCase().trim();
      const brands = state.brands();

      if (!query) return brands;

      return brands.filter(brand => {
        // Buscar en nombre de marca
        const brandNameMatch = brand.name.toLowerCase().includes(query);

        // Buscar en nombres de modelos
        const modelNameMatch = brand.models.some(model =>
          model.name.toLowerCase().includes(query)
        );

        // Buscar en nombres de descripciones
        const descriptionNameMatch = brand.models.some(model =>
          model.descriptions.some(desc =>
            desc.name.toLowerCase().includes(query)
          )
        );

        return brandNameMatch || modelNameMatch || descriptionNameMatch;
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
          const descriptionNameMatch = brand.models.some(model =>
            model.descriptions.some(desc =>
              desc.name.toLowerCase().includes(query)
            )
          );
          return brandNameMatch || modelNameMatch || descriptionNameMatch;
        });
      }

      // Agrupar por tipo
      return (typeEnum: InspectableItemTypeEnum): BrandWithState[] => {
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

      let filtered = brands;
      if (query) {
        filtered = brands.filter(brand => {
          const brandNameMatch = brand.name.toLowerCase().includes(query);
          const modelNameMatch = brand.models.some(model =>
            model.name.toLowerCase().includes(query)
          );
          const descriptionNameMatch = brand.models.some(model =>
            model.descriptions.some(desc =>
              desc.name.toLowerCase().includes(query)
            )
          );
          return brandNameMatch || modelNameMatch || descriptionNameMatch;
        });
      }

      return (typeEnum: InspectableItemTypeEnum): number => {
        return filtered.filter(b => b.type === typeEnum).length;
      };
    }),

    /**
     * Verificar si hay marcas
     */
    hasBrands: computed(() => state.brands().length > 0),

    /**
     * Verificar si no hay resultados de búsqueda
     */
    hasNoSearchResults: computed(() => {
      const query = state.searchQuery().toLowerCase().trim();
      const brands = state.brands();

      if (query === '') return false;

      const filtered = brands.filter(brand => {
        const brandNameMatch = brand.name.toLowerCase().includes(query);
        const modelNameMatch = brand.models.some(model =>
          model.name.toLowerCase().includes(query)
        );
        const descriptionNameMatch = brand.models.some(model =>
          model.descriptions.some(desc =>
            desc.name.toLowerCase().includes(query)
          )
        );
        return brandNameMatch || modelNameMatch || descriptionNameMatch;
      });

      return filtered.length === 0;
    }),

    /**
     * Verificar si un grupo está expandido
     */
    isGroupExpanded: computed(() => {
      const expanded = state.expandedGroups();
      return (groupId: string): boolean => expanded.has(groupId);
    }),

    /**
     * Verificar si un tipo está expandido
     */
    isTypeExpanded: computed(() => {
      const expanded = state.expandedTypes();
      return (typeEnum: InspectableItemTypeEnum): boolean => expanded.has(typeEnum);
    }),

    /**
     * Verificar si una marca está expandida
     */
    isBrandExpanded: computed(() => {
      const expanded = state.expandedBrands();
      return (brandId: string): boolean => expanded.has(brandId);
    }),

    /**
     * Verificar si un modelo está expandido
     */
    isModelExpanded: computed(() => {
      const expanded = state.expandedModels();
      return (modelId: string): boolean => expanded.has(modelId);
    }),

    /**
     * Obtener marca por ID
     */
    getBrandById: computed(() => {
      const brands = state.brands();
      return (brandId: string): BrandWithState | undefined => {
        return brands.find(b => b.id === brandId);
      };
    }),

    /**
     * Obtener modelo por ID (busca en todas las marcas)
     */
    getModelById: computed(() => {
      const brands = state.brands();
      return (modelId: string): ModelWithState | undefined => {
        for (const brand of brands) {
          const model = brand.models.find(m => m.id === modelId);
          if (model) return model as ModelWithState;
        }
        return undefined;
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
    const descriptionService = inject(DescriptionService);

    return {
      // ==================== LOAD DATA ====================

      /**
       * Cargar todas las marcas (sin modelos ni descriptions)
       */
      async loadBrands(): Promise<void> {
        patchState(store, {
          isLoadingBrands: true,
          error: null
        });

        try {
          const brands = await firstValueFrom(brandService.getAll());

          const brandsWithState: BrandWithState[] = brands.map(brand => ({
            ...brand,
            models: [],
            isLoadingModels: false,
            modelsLoaded: false
          }));

          patchState(store, {
            brands: brandsWithState.sort((a, b) => a.name.localeCompare(b.name)),
            isLoadingBrands: false,
            error: null
          });

          console.log('✅ Brands loaded:', brandsWithState.length);

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
       * Cargar modelos de una marca específica (lazy load)
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

          const modelsWithState: ModelWithState[] = models.map(model => ({
            ...model,
            descriptions: [],
            isLoadingDescriptions: false,
            descriptionsLoaded: false
          }));

          patchState(store, (state) => ({
            brands: state.brands.map(b =>
              b.id === brandId
                ? {
                  ...b,
                  models: modelsWithState.sort((a, b) => a.name.localeCompare(b.name)),
                  isLoadingModels: false,
                  modelsLoaded: true
                }
                : b
            )
          }));

          console.log(`✅ Models loaded for brand ${brandId}:`, modelsWithState.length);

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

      /**
       * Cargar descripciones de un modelo específico (lazy load)
       */
      async loadDescriptionsForModel(brandId: string, modelId: string): Promise<void> {
        const brand = store.brands().find(b => b.id === brandId);
        if (!brand) return;

        const model = brand.models.find(m => m.id === modelId) as ModelWithState | undefined;
        if (!model || model.descriptionsLoaded || model.isLoadingDescriptions) return;

        // Marcar como cargando
        patchState(store, (state) => ({
          brands: state.brands.map(b =>
            b.id === brandId
              ? {
                ...b,
                models: b.models.map(m =>
                  m.id === modelId
                    ? { ...m, isLoadingDescriptions: true }
                    : m
                )
              }
              : b
          )
        }));

        try {
          const descriptions = await firstValueFrom(
            modelService.getAllDescriptionsByModelId(modelId)
          );

          patchState(store, (state) => ({
            brands: state.brands.map(b =>
              b.id === brandId
                ? {
                  ...b,
                  models: b.models.map(m =>
                    m.id === modelId
                      ? {
                        ...m,
                        descriptions: descriptions.sort((a, b) =>
                          a.name.localeCompare(b.name)
                        ),
                        isLoadingDescriptions: false,
                        descriptionsLoaded: true
                      }
                      : m
                  )
                }
                : b
            )
          }));

          console.log(`✅ Descriptions loaded for model ${modelId}:`, descriptions.length);

        } catch (error: any) {
          console.error(`❌ Error loading descriptions for model ${modelId}:`, error);
          patchState(store, (state) => ({
            brands: state.brands.map(b =>
              b.id === brandId
                ? {
                  ...b,
                  models: b.models.map(m =>
                    m.id === modelId
                      ? { ...m, isLoadingDescriptions: false, descriptionsLoaded: false }
                      : m
                  )
                }
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
       * Toggle modelo expandido/colapsado + cargar descriptions si es necesario
       */
      async toggleModel(brandId: string, modelId: string): Promise<void> {
        const isCurrentlyExpanded = store.expandedModels().has(modelId);

        patchState(store, (state) => {
          const newExpanded = new Set(state.expandedModels);
          if (newExpanded.has(modelId)) {
            newExpanded.delete(modelId);
          } else {
            newExpanded.add(modelId);
          }
          return { expandedModels: newExpanded };
        });

        // Si se está expandiendo, cargar descriptions
        if (!isCurrentlyExpanded) {
          await this.loadDescriptionsForModel(brandId, modelId);
        }
      },

      // ==================== BRAND CRUD ====================

      /**
       * Crear nueva marca
       */
      async createBrand(type: InspectableItemTypeEnum, name: string): Promise<boolean> {
        const trimmedName = name.trim();

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
            totalModels: 0,
            models: []
          };

          const created = await firstValueFrom(brandService.create(newBrand));

          const brandWithState: BrandWithState = {
            ...created,
            models: [],
            isLoadingModels: false,
            modelsLoaded: false
          };

          patchState(store, (state) => ({
            brands: [...state.brands, brandWithState].sort((a, b) =>
              a.name.localeCompare(b.name)
            ),
            creatingBrandForType: null,
            newBrandName: ''
          }));

          console.log('✅ Brand created:', created.name);
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
       */
      async updateBrand(brandId: string, name: string): Promise<boolean> {
        const trimmedName = name.trim();

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

          console.log('✅ Brand updated:', updated.name);
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
       */
      async createModel(brandId: string, name: string): Promise<boolean> {
        const trimmedName = name.trim();

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
            totalDescriptions: 0,
            descriptions: []
          };

          const created = await firstValueFrom(modelService.create(newModel));

          const modelWithState: ModelWithState = {
            ...created,
            descriptions: [],
            isLoadingDescriptions: false,
            descriptionsLoaded: false
          };

          patchState(store, (state) => ({
            brands: state.brands.map(b =>
              b.id === brandId
                ? {
                  ...b,
                  totalModels: b.totalModels + 1,
                  models: [...b.models, modelWithState].sort((a, b) =>
                    a.name.localeCompare(b.name)
                  )
                }
                : b
            ),
            creatingModelForBrandId: null,
            newModelName: ''
          }));

          console.log('✅ Model created:', created.name);
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
       */
      async updateModel(
        brandId: string,
        modelId: string,
        name: string
      ): Promise<boolean> {
        const trimmedName = name.trim();

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

          console.log('✅ Model updated:', updated.name);
          return true;

        } catch (error: any) {
          console.error('❌ Error updating model:', error);
          patchState(store, {
            error: error.message || 'Error al actualizar el modelo'
          });
          return false;
        }
      },

      // ==================== DESCRIPTION CRUD ====================

      /**
       * Crear nueva descripción
       */
      async createDescription(
        brandId: string,
        modelId: string,
        name: string
      ): Promise<boolean> {
        const trimmedName = name.trim();

        if (trimmedName.length < 2 || trimmedName.length > 50) {
          patchState(store, {
            error: 'El nombre debe tener entre 2 y 50 caracteres'
          });
          return false;
        }

        try {
          const newDescription: DescriptionEntity = {
            id: '',
            name: trimmedName,
            modelId,
            brandId
          };

          const created = await firstValueFrom(descriptionService.create(newDescription));

          patchState(store, (state) => ({
            brands: state.brands.map(b =>
              b.id === brandId
                ? {
                  ...b,
                  models: b.models.map(m =>
                    m.id === modelId
                      ? {
                        ...m,
                        totalDescriptions: m.totalDescriptions + 1,
                        descriptions: [...m.descriptions, created].sort((a, b) =>
                          a.name.localeCompare(b.name)
                        )
                      }
                      : m
                  )
                }
                : b
            ),
            creatingDescriptionForModelId: null,
            newDescriptionName: ''
          }));

          console.log('✅ Description created:', created.name);
          return true;

        } catch (error: any) {
          console.error('❌ Error creating description:', error);
          patchState(store, {
            error: error.message || 'Error al crear la descripción'
          });
          return false;
        }
      },

      /**
       * Actualizar descripción
       */
      async updateDescription(
        brandId: string,
        modelId: string,
        descriptionId: string,
        name: string
      ): Promise<boolean> {
        const trimmedName = name.trim();

        if (trimmedName.length < 2 || trimmedName.length > 50) {
          patchState(store, {
            error: 'El nombre debe tener entre 2 y 50 caracteres'
          });
          return false;
        }

        try {
          const brand = store.brands().find(b => b.id === brandId);
          const model = brand?.models.find(m => m.id === modelId);
          const description = model?.descriptions.find(d => d.id === descriptionId);
          if (!description) return false;

          const updated = await firstValueFrom(descriptionService.update(
              descriptionId,
              { ...description, name: trimmedName }
            )
          );

          patchState(store, (state) => ({
            brands: state.brands.map(b =>
              b.id === brandId
                ? {
                  ...b,
                  models: b.models.map(m =>
                    m.id === modelId
                      ? {
                        ...m,
                        descriptions: m.descriptions
                          .map(d =>
                            d.id === descriptionId ? { ...d, name: updated.name } : d
                          )
                          .sort((a, b) => a.name.localeCompare(b.name))
                      }
                      : m
                  )
                }
                : b
            ),
            editingDescriptionId: null,
            editDescriptionName: ''
          }));

          console.log('✅ Description updated:', updated.name);
          return true;

        } catch (error: any) {
          console.error('❌ Error updating description:', error);
          patchState(store, {
            error: error.message || 'Error al actualizar la descripción'
          });
          return false;
        }
      },

      // ==================== UI STATE ====================

      /**
       * Establecer búsqueda
       */
      setSearchQuery(query: string): void {
        patchState(store, { searchQuery: query });
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
       * Modo crear descripción
       */
      startCreatingDescription(modelId: string): void {
        patchState(store, {
          creatingDescriptionForModelId: modelId,
          newDescriptionName: ''
        });
      },

      cancelCreatingDescription(): void {
        patchState(store, {
          creatingDescriptionForModelId: null,
          newDescriptionName: ''
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
       * Modo editar descripción
       */
      startEditingDescription(descriptionId: string, currentName: string): void {
        patchState(store, {
          editingDescriptionId: descriptionId,
          editDescriptionName: currentName
        });
      },

      cancelEditingDescription(): void {
        patchState(store, {
          editingDescriptionId: null,
          editDescriptionName: ''
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

      setNewDescriptionName(name: string): void {
        patchState(store, { newDescriptionName: name });
      },

      setEditBrandName(name: string): void {
        patchState(store, { editBrandName: name });
      },

      setEditModelName(name: string): void {
        patchState(store, { editModelName: name });
      },

      setEditDescriptionName(name: string): void {
        patchState(store, { editDescriptionName: name });
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
