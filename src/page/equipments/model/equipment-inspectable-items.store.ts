import {computed, inject} from '@angular/core';
import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import {InspectableItemEntity, InspectableItemService} from '../../../entities/inspectable-item';
import {BrandEntity, BrandService} from '../../../entities/brand';
import {ModelEntity, ModelService} from '../../../entities/model';
import {InspectableItemTypeEnum} from '../../../shared/model/enums';
import {EquipmentTypeEnum} from '../../../entities/equipment/model/equipment-type.enum';
import {firstValueFrom} from 'rxjs';
import {CabinetService} from '../../../entities/cabinet/api';
import {PanelService} from '../../../entities/panel/api';

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

  // Brands & Models para el formulario
  brands: BrandEntity[];
  models: ModelEntity[];
  isLoadingBrands: boolean;
  isLoadingModels: boolean;

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
    descripcion: string;
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
  descripcion: ''
};

const initialState: InspectableItemsState = {
  equipmentId: null,
  equipmentType: null,
  items: [],
  isLoadingItems: false,
  brands: [],
  models: [],
  isLoadingBrands: false,
  isLoadingModels: false,
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

      // Filtrar por tipo
      if (filterType) {
        filtered = filtered.filter(item => item.type === filterType);
      }

      // Filtrar por búsqueda
      if (query) {
        filtered = filtered.filter(item => {
          const tagMatch = item.tag.toLowerCase().includes(query);
          const descMatch = item.descripcion.toLowerCase().includes(query);
          // TODO: Agregar búsqueda por marca/modelo cuando se carguen
          return tagMatch || descMatch;
        });
      }

      return filtered;
    }),

    /**
     * Items agrupados por tipo (DUPLICA lógica de filteredItems)
     */
    itemsByType: computed(() => {
      const items = state.items();
      const query = state.searchQuery().toLowerCase().trim();
      const filterType = state.filterType();

      // Duplicar lógica de filtrado
      let filtered = items;

      if (filterType) {
        filtered = filtered.filter(item => item.type === filterType);
      }

      if (query) {
        filtered = filtered.filter(item => {
          const tagMatch = item.tag.toLowerCase().includes(query);
          const descMatch = item.descripcion.toLowerCase().includes(query);
          return tagMatch || descMatch;
        });
      }

      // Agrupar
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
     * Contador de items por tipo (DUPLICA lógica)
     */
    getItemsCountByType: computed(() => {
      const items = state.items();
      const query = state.searchQuery().toLowerCase().trim();
      const filterType = state.filterType();

      // Duplicar lógica de filtrado
      let filtered = items;

      if (filterType) {
        filtered = filtered.filter(item => item.type === filterType);
      }

      if (query) {
        filtered = filtered.filter(item => {
          const tagMatch = item.tag.toLowerCase().includes(query);
          const descMatch = item.descripcion.toLowerCase().includes(query);
          return tagMatch || descMatch;
        });
      }

      // Agrupar
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
     * Items filtrados count (DUPLICA lógica)
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
          const descMatch = item.descripcion.toLowerCase().includes(query);
          return tagMatch || descMatch;
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
          const descMatch = item.descripcion.toLowerCase().includes(lowerQuery);
          return tagMatch || descMatch;
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
        ? 'Agregar Item Inspeccionar'
        : 'Editar Item Inspeccionar';
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
     * Validar formulario
     */
    isFormValid: computed(() => {
      const form = state.formData();

      // TODO: Agregar validaciones de formato de tag cuando el cliente las defina
      const hasTag = form.tag.trim().length > 0;
      const hasType = form.type !== null;
      const hasBrand = form.brandId !== null;
      const hasModel = form.modelId !== null;

      return hasTag && hasType && hasBrand && hasModel;
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

      return hasTag && hasType && hasBrand && hasModel && !isSubmitting;
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
    const paneService = inject(PanelService);

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
            items = await firstValueFrom(cabinetService.getAllInspectableItems(equipmentId)
            );
          } else {
            items = await firstValueFrom(paneService.getAllInspectableItems(equipmentId)
            );
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
            descripcion: item.descripcion
          },
          error: null
        });

        // Cargar brands y models para edición
        await this.loadBrandsForType(item.type);
        await this.loadModelsForBrand(item.brandId);
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
            brandId: null,  // Reset brand
            modelId: null   // Reset model
          },
          models: []  // Clear models
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
            modelId: null  // Reset model
          }
        }));

        if (brandId) {
          await this.loadModelsForBrand(brandId);
        }
      },

      /**
       * Establecer modelo
       */
      setModel(modelId: string | null): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, modelId }
        }));
      },

      /**
       * Establecer descripción
       */
      setDescripcion(descripcion: string): void {
        patchState(store, (state) => ({
          formData: { ...state.formData, descripcion }
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
            descripcion: form.descripcion.trim()
          };

          const created = await firstValueFrom(
            inspectableItemService.create(newItem, equipmentId)
          );

          // Agregar a la lista local
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
            descripcion: form.descripcion.trim()
          };

          const updated = await firstValueFrom(
            inspectableItemService.update(itemId, updatedItem)
          );

          // Actualizar en la lista local
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

          // Remover de la lista local
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
       * Establecer filtro de tipo
       */
      setFilterType(type: InspectableItemTypeEnum | null): void {
        patchState(store, { filterType: type });
      },

      /**
       * Toggle expansión de tipo
       */
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

      /**
       * Expandir todos los tipos
       */
      expandAll(): void {
        const allTypes = new Set(TYPE_CONFIGS.map(c => c.enum));
        patchState(store, { expandedTypes: allTypes });
      },

      /**
       * Colapsar todos los tipos
       */
      collapseAll(): void {
        patchState(store, { expandedTypes: new Set() });
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
