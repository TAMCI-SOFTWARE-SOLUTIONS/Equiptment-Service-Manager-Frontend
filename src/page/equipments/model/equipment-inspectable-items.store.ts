import {computed, inject} from '@angular/core';
import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import {InspectableItemEntity, InspectableItemService} from '../../../entities/inspectable-item';
import {BrandEntity, BrandService} from '../../../entities/brand';
import {ModelEntity, ModelService} from '../../../entities/model';
import {InspectableItemTypeEnum} from '../../../shared/model/enums';
import {firstValueFrom} from 'rxjs';
import {CabinetService} from '../../../entities/cabinet/api';
import {PanelService} from '../../../entities/panel/api';
import {EquipmentTypeEnum} from '../../../shared/model';
import {DescriptionEntity} from '../../../entities/description/model/entities/description.entity';

interface TypeConfig {
  enum: InspectableItemTypeEnum;
  label: string;
  icon: string;
  color: string;
}

const TYPE_CONFIGS: TypeConfig[] = [
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
  },
  {
    enum: InspectableItemTypeEnum.POWER_SUPPLY,
    label: 'Fuentes',
    icon: 'pi-bolt',
    color: 'sky'
  },
  {
    enum: InspectableItemTypeEnum.POWER_120VAC,
    label: 'Alimentación 120VAC',
    icon: 'pi-flash',
    color: 'cyan'
  },
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
];

// ==================== STATE ====================

interface InspectableItemsState {
  // Equipment context
  equipmentId: string | null;
  equipmentType: EquipmentTypeEnum | null;

  // Items data
  items: InspectableItemEntity[];
  isLoadingItems: boolean;

  // Brands, Models & Descriptions para el formulario
  brands: BrandEntity[];
  models: ModelEntity[];
  descriptions: DescriptionEntity[];
  isLoadingBrands: boolean;
  isLoadingModels: boolean;
  isLoadingDescriptions: boolean;

  // Drawer state
  isDrawerOpen: boolean;
  drawerMode: 'create' | 'edit';
  editingItemId: string | null;

  // Form data
  formData: {
    tag: string;
    type: InspectableItemTypeEnum | null;
    brandId: string | null;
    modelId: string | null;
    descriptionId: string | null; // 🔧 Ya no es string, es string | null
  };

  // UI state
  searchQuery: string;
  filterType: InspectableItemTypeEnum | null;
  expandedTypes: Set<InspectableItemTypeEnum>;

  // Submission
  isSubmitting: boolean;
  error: string | null;
}

const initialFormData = {
  tag: '',
  type: null,
  brandId: null,
  modelId: null,
  descriptionId: null
};

const initialState: InspectableItemsState = {
  equipmentId: null,
  equipmentType: null,
  items: [],
  isLoadingItems: false,
  brands: [],
  models: [],
  descriptions: [],
  isLoadingBrands: false,
  isLoadingModels: false,
  isLoadingDescriptions: false,
  isDrawerOpen: false,
  drawerMode: 'create',
  editingItemId: null,
  formData: initialFormData,
  searchQuery: '',
  filterType: null,
  expandedTypes: new Set(),
  isSubmitting: false,
  error: null
};

export const EquipmentInspectableItemsStore = signalStore(
  withState<InspectableItemsState>(initialState),

  withComputed((state) => ({
    /**
     * Configuración de tipos
     */
    typeConfigs: computed(() => TYPE_CONFIGS),

    /**
     * Items filtrados por búsqueda y tipo
     */
    filteredItems: computed(() => {
      const items = state.items();
      const query = state.searchQuery().toLowerCase().trim();
      const filterType = state.filterType();

      let filtered = items;

      if (filterType) {
        filtered = filtered.filter(item => item.type === filterType);
      }

      if (query) {
        filtered = filtered.filter(item => {
          const tagMatch = item.tag.toLowerCase().includes(query);
          return tagMatch;
        });
      }

      return filtered;
    }),

    /**
     * Items agrupados por tipo
     */
    itemsByType: computed(() => {
      const items = state.items();
      const query = state.searchQuery().toLowerCase().trim();
      const filterType = state.filterType();

      let filtered = items;

      if (filterType) {
        filtered = filtered.filter(item => item.type === filterType);
      }

      if (query) {
        filtered = filtered.filter(item => {
          const tagMatch = item.tag.toLowerCase().includes(query);
          return tagMatch;
        });
      }

      const groups = new Map<InspectableItemTypeEnum, InspectableItemEntity[]>();

      TYPE_CONFIGS.forEach(config => {
        groups.set(config.enum, []);
      });

      filtered.forEach(item => {
        const group = groups.get(item.type);
        if (group) {
          group.push(item);
        }
      });

      groups.forEach((items, _) => {
        items.sort((a, b) => a.tag.localeCompare(b.tag));
      });

      return groups;
    }),

    /**
     * Contador de items por tipo
     */
    getItemsCountByType: computed(() => {
      const items = state.items();
      const query = state.searchQuery().toLowerCase().trim();
      const filterType = state.filterType();

      let filtered = items;

      if (filterType) {
        filtered = filtered.filter(item => item.type === filterType);
      }

      if (query) {
        filtered = filtered.filter(item => {
          const tagMatch = item.tag.toLowerCase().includes(query);
          return tagMatch;
        });
      }

      const groups = new Map<InspectableItemTypeEnum, number>();
      TYPE_CONFIGS.forEach(config => {
        groups.set(config.enum, 0);
      });

      filtered.forEach(item => {
        const count = groups.get(item.type) || 0;
        groups.set(item.type, count + 1);
      });

      return (type: InspectableItemTypeEnum): number => {
        return groups.get(type) || 0;
      };
    }),

    /**
     * Total de items
     */
    totalItemsCount: computed(() => state.items().length),

    /**
     * Items filtrados count
     */
    filteredItemsCount: computed(() => {
      const items = state.items();
      const query = state.searchQuery().toLowerCase().trim();
      const filterType = state.filterType();

      let filtered = items;

      if (filterType) {
        filtered = filtered.filter(item => item.type === filterType);
      }

      if (query) {
        filtered = filtered.filter(item => {
          const tagMatch = item.tag.toLowerCase().includes(query);
          return tagMatch;
        });
      }

      return filtered.length;
    }),

    /**
     * Verificar si hay items
     */
    hasItems: computed(() => state.items().length > 0),

    /**
     * Verificar si no hay resultados de búsqueda
     */
    hasNoSearchResults: computed(() => {
      const query = state.searchQuery().trim();
      const items = state.items();
      const filterType = state.filterType();

      if (query === '' && filterType === null) return false;

      let filtered = items;

      if (filterType) {
        filtered = filtered.filter(item => item.type === filterType);
      }

      if (query) {
        const lowerQuery = query.toLowerCase();
        filtered = filtered.filter(item => {
          const tagMatch = item.tag.toLowerCase().includes(lowerQuery);
          return tagMatch;
        });
      }

      return filtered.length === 0;
    }),

    /**
     * Verificar si un tipo está expandido
     */
    isTypeExpanded: computed(() => {
      const expanded = state.expandedTypes();
      return (type: InspectableItemTypeEnum): boolean => {
        return expanded.has(type);
      };
    }),

    /**
     * Título del drawer
     */
    drawerTitle: computed(() => {
      return state.drawerMode() === 'create'
        ? 'Agregar Componente o Equipo'
        : 'Editar Componente o Equipo';
    }),

    /**
     * Brands filtrados por tipo seleccionado en el form
     */
    availableBrands: computed(() => {
      const selectedType = state.formData().type;
      const allBrands = state.brands();

      if (!selectedType) return [];

      return allBrands
        .filter(brand => brand.type === selectedType)
        .sort((a, b) => a.name.localeCompare(b.name));
    }),

    /**
     * Models de la marca seleccionada
     */
    availableModels: computed(() => {
      return state.models().sort((a, b) => a.name.localeCompare(b.name));
    }),

    /**
     * 🆕 Descriptions del modelo seleccionado
     */
    availableDescriptions: computed(() => {
      return state.descriptions().sort((a, b) => a.name.localeCompare(b.name));
    }),

    /**
     * Validar formulario
     */
    isFormValid: computed(() => {
      const form = state.formData();

      const hasTag = form.tag.trim().length > 0;
      const hasType = form.type !== null;
      const hasBrand = form.brandId !== null;
      const hasModel = form.modelId !== null;
      const hasDescription = form.descriptionId !== null; // 🆕

      return hasTag && hasType && hasBrand && hasModel && hasDescription;
    }),

    /**
     * Puede hacer submit
     */
    canSubmit: computed(() => {
      const form = state.formData();
      const isSubmitting = state.isSubmitting();

      const hasTag = form.tag.trim().length > 0;
      const hasType = form.type !== null;
      const hasBrand = form.brandId !== null;
      const hasModel = form.modelId !== null;
      const hasDescription = form.descriptionId !== null; // 🆕

      return hasTag && hasType && hasBrand && hasModel && hasDescription && !isSubmitting;
    }),

    /**
     * Obtener config de un tipo
     */
    getTypeConfig: computed(() => {
      return (type: InspectableItemTypeEnum): TypeConfig | undefined => {
        return TYPE_CONFIGS.find(t => t.enum === type);
      };
    })
  })),

  withMethods((store) => {
    const inspectableItemService = inject(InspectableItemService);
    const brandService = inject(BrandService);
    const modelService = inject(ModelService);
    const cabinetService = inject(CabinetService);
    const panelService = inject(PanelService);

    return {
      // ==================== LOAD DATA ====================

      /**
       * Inicializar store con equipment ID y tipo
       */
      initialize(equipmentId: string, equipmentType: EquipmentTypeEnum): void {
        patchState(store, {
          equipmentId,
          equipmentType
        });
        this.loadItems(equipmentId, equipmentType).then();
      },

      /**
       * Cargar items del equipment
       */
      async loadItems(equipmentId: string, equipmentType: EquipmentTypeEnum): Promise<void> {
        patchState(store, {
          isLoadingItems: true,
          error: null
        });

        try {
          let items: InspectableItemEntity[];

          if (equipmentType === EquipmentTypeEnum.CABINET) {
            items = await firstValueFrom(cabinetService.getAllInspectableItems(equipmentId));
          } else {
            items = await firstValueFrom(panelService.getAllInspectableItems(equipmentId));
          }

          patchState(store, {
            items,
            isLoadingItems: false
          });

        } catch (error: any) {
          console.error('❌ Error loading inspectable items:', error);
          patchState(store, {
            items: [],
            isLoadingItems: false,
            error: error.message || 'Error al cargar los items'
          });
        }
      },

      /**
       * Cargar brands filtrados por tipo
       */
      async loadBrandsForType(type: InspectableItemTypeEnum): Promise<void> {
        patchState(store, {
          isLoadingBrands: true
        });

        try {
          const allBrands = await firstValueFrom(brandService.getAll());
          const filtered = allBrands.filter(b => b.type === type);

          patchState(store, {
            brands: filtered,
            isLoadingBrands: false
          });

        } catch (error: any) {
          console.error('❌ Error loading brands:', error);
          patchState(store, {
            brands: [],
            isLoadingBrands: false
          });
        }
      },

      /**
       * Cargar modelos de una marca
       */
      async loadModelsForBrand(brandId: string): Promise<void> {
        patchState(store, {
          isLoadingModels: true
        });

        try {
          const models = await firstValueFrom(
            brandService.getAllModelsByBrandId(brandId)
          );

          patchState(store, {
            models,
            isLoadingModels: false
          });

        } catch (error: any) {
          console.error('❌ Error loading models:', error);
          patchState(store, {
            models: [],
            isLoadingModels: false
          });
        }
      },

      /**
       * 🆕 Cargar descriptions de un modelo
       */
      async loadDescriptionsForModel(modelId: string): Promise<void> {
        patchState(store, {
          isLoadingDescriptions: true
        });

        try {
          const descriptions = await firstValueFrom(
            modelService.getAllDescriptionsByModelId(modelId)
          );

          patchState(store, {
            descriptions,
            isLoadingDescriptions: false
          });

        } catch (error: any) {
          console.error('❌ Error loading descriptions:', error);
          patchState(store, {
            descriptions: [],
            isLoadingDescriptions: false
          });
        }
      },

      // ==================== DRAWER ====================

      /**
       * Abrir drawer para crear
       */
      openDrawerForCreate(): void {
        patchState(store, {
          isDrawerOpen: true,
          drawerMode: 'create',
          editingItemId: null,
          formData: initialFormData,
          brands: [],
          models: [],
          descriptions: [],
          error: null
        });
      },

      /**
       * Abrir drawer para editar
       */
      async openDrawerForEdit(itemId: string): Promise<void> {
        const item = store.items().find(i => i.id === itemId);
        if (!item) return;

        patchState(store, {
          isDrawerOpen: true,
          drawerMode: 'edit',
          editingItemId: itemId,
          formData: {
            tag: item.tag,
            type: item.type,
            brandId: item.brandId,
            modelId: item.modelId,
            descriptionId: item.descriptionId
          },
          error: null
        });

        // Cargar brands, models y descriptions para edición
        await this.loadBrandsForType(item.type);
        await this.loadModelsForBrand(item.brandId);
        await this.loadDescriptionsForModel(item.modelId);
      },

      /**
       * Cerrar drawer
       */
      closeDrawer(): void {
        patchState(store, {
          isDrawerOpen: false,
          drawerMode: 'create',
          editingItemId: null,
          formData: initialFormData,
          brands: [],
          models: [],
          descriptions: [],
          error: null
        });
      },

      // ==================== FORM ====================

      /**
       * Establecer tag
       */
      setTag(tag: string): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, tag }
        }));
      },

      /**
       * Establecer tipo y cargar brands
       */
      async setType(type: InspectableItemTypeEnum | null): Promise<void> {
        patchState(store, (state) => ({
          formData: {
            ...state.formData,
            type,
            brandId: null,
            modelId: null,
            descriptionId: null
          },
          models: [],
          descriptions: []
        }));

        if (type) {
          await this.loadBrandsForType(type);
        }
      },

      /**
       * Establecer brand y cargar models
       */
      async setBrand(brandId: string | null): Promise<void> {
        patchState(store, (state) => ({
          formData: {
            ...state.formData,
            brandId,
            modelId: null,
            descriptionId: null
          },
          descriptions: []
        }));

        if (brandId) {
          await this.loadModelsForBrand(brandId);
        }
      },

      /**
       * 🔧 Establecer modelo y cargar descriptions
       */
      async setModel(modelId: string | null): Promise<void> {
        patchState(store, (state) => ({
          formData: {
            ...state.formData,
            modelId,
            descriptionId: null
          }
        }));

        if (modelId) {
          await this.loadDescriptionsForModel(modelId);
        }
      },

      /**
       * 🆕 Establecer descripción
       */
      setDescription(descriptionId: string | null): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, descriptionId }
        }));
      },

      // ==================== CRUD ====================

      /**
       * Crear item
       */
      async createItem(): Promise<boolean> {
        if (!store.canSubmit()) return false;

        const equipmentId = store.equipmentId();
        if (!equipmentId) return false;

        patchState(store, {
          isSubmitting: true,
          error: null
        });

        try {
          const form = store.formData();

          const newItem: InspectableItemEntity = {
            id: '',
            tag: form.tag.trim(),
            type: form.type!,
            brandId: form.brandId!,
            modelId: form.modelId!,
            descriptionId: form.descriptionId!, // 🆕
            currentCondition: null,
            currentCriticality: null,
            lastObservation: null,
            createdAt: new Date(),
            updatedAt: null,
          };

          const created = await firstValueFrom(
            inspectableItemService.create(newItem, equipmentId)
          );

          patchState(store, (state) => ({
            items: [...state.items, created],
            isSubmitting: false,
            isDrawerOpen: false,
            formData: initialFormData
          }));

          console.log('✅ Item created successfully');
          return true;

        } catch (error: any) {
          console.error('❌ Error creating item:', error);
          patchState(store, {
            isSubmitting: false,
            error: error.message || 'Error al crear el item'
          });
          return false;
        }
      },

      /**
       * Actualizar item
       */
      async updateItem(): Promise<boolean> {
        if (!store.canSubmit()) return false;

        const itemId = store.editingItemId();
        if (!itemId) return false;

        patchState(store, {
          isSubmitting: true,
          error: null
        });

        try {
          const form = store.formData();

          const updatedItem: InspectableItemEntity = {
            id: itemId,
            tag: form.tag.trim(),
            type: form.type!,
            brandId: form.brandId!,
            modelId: form.modelId!,
            descriptionId: form.descriptionId!, // 🆕
            currentCondition: null,
            currentCriticality: null,
            lastObservation: null,
            createdAt: new Date(),
            updatedAt: null,
          };

          const updated = await firstValueFrom(
            inspectableItemService.update(itemId, updatedItem)
          );

          patchState(store, (state) => ({
            items: state.items.map(item => item.id === itemId ? updated : item),
            isSubmitting: false,
            isDrawerOpen: false,
            formData: initialFormData,
            editingItemId: null
          }));

          console.log('✅ Item updated successfully');
          return true;

        } catch (error: any) {
          console.error('❌ Error updating item:', error);
          patchState(store, {
            isSubmitting: false,
            error: error.message || 'Error al actualizar el item'
          });
          return false;
        }
      },

      /**
       * Eliminar item
       */
      async deleteItem(itemId: string): Promise<boolean> {
        patchState(store, { error: null });

        try {
          await firstValueFrom(inspectableItemService.delete(itemId));

          patchState(store, (state) => ({
            items: state.items.filter(item => item.id !== itemId)
          }));

          console.log('✅ Item deleted successfully');
          return true;

        } catch (error: any) {
          console.error('❌ Error deleting item:', error);
          patchState(store, {
            error: error.message || 'Error al eliminar el item'
          });
          return false;
        }
      },

      // ==================== UI STATE ====================

      setSearchQuery(query: string): void {
        patchState(store, { searchQuery: query });
      },

      clearSearch(): void {
        patchState(store, { searchQuery: '' });
      },

      setFilterType(type: InspectableItemTypeEnum | null): void {
        patchState(store, { filterType: type });
      },

      toggleType(type: InspectableItemTypeEnum): void {
        patchState(store, (state) => {
          const newExpanded = new Set(state.expandedTypes);
          if (newExpanded.has(type)) {
            newExpanded.delete(type);
          } else {
            newExpanded.add(type);
          }
          return { expandedTypes: newExpanded };
        });
      },

      expandAll(): void {
        const allTypes = new Set(TYPE_CONFIGS.map(c => c.enum));
        patchState(store, { expandedTypes: allTypes });
      },

      collapseAll(): void {
        patchState(store, { expandedTypes: new Set() });
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
