import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom, forkJoin, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import {
  EquipmentServiceEntity,
  EquipmentServiceService,
  ServiceStatusEnum
} from '../../../../entities/equipment-service';
import {CabinetEntity} from '../../../../entities/cabinet/model';
import {PanelEntity} from '../../../../entities/panel/model';
import {SupervisorEntity, SupervisorService} from '../../../../entities/supervisor';
import {InspectableItemWithDetails} from '../interfaces/inspectable-item-with-details.interface';
import {
  CriticalityEnum,
  ItemConditionEnum,
  ItemInspectionEntity,
  ItemInspectionService
} from '../../../../entities/item-inspection';
import {
  EquipmentPowerDistributionAssignmentEntity
} from '../../../../entities/equipment-power-distribution-assignment/model/entities/equipment-power-distribution-assignment.entity';
import {PowerDistributionPanelEntity} from '../../../../entities/power-distribution-panel/model';
import {InspectableItemTypeEnum} from '../../../../shared/model/enums';
import {isItemCompleted, isValidForRaiseObservation} from '../../utils/service-work-validation.helpers';
import {EquipmentTypeEnum, ServiceTypeEnum} from '../../../../shared/model';
import {CabinetService} from '../../../../entities/cabinet/api';
import {PanelService} from '../../../../entities/panel/api';
import {BrandService} from '../../../../entities/brand';
import {ModelService} from '../../../../entities/model';
import {FileService} from '../../../../entities/file/api/file.service';
import {
  EquipmentPowerDistributionAssignmentService
} from '../../../../entities/equipment-power-distribution-assignment/api';
import {PowerDistributionPanelService} from '../../../../entities/power-distribution-panel/api';

// ==================== INTERFACES ====================

export interface ServiceWorkState {
  // Service data
  service: EquipmentServiceEntity | null;
  equipment: CabinetEntity | PanelEntity | null;
  supervisor: SupervisorEntity | null;

  // Inspectable items enriquecidos
  inspectableItems: InspectableItemWithDetails[];

  // Inspecciones del servicio anterior (para Mantenimiento/Levantamiento)
  previousInspections: ItemInspectionEntity[];

  // Power distribution
  powerDistributions: EquipmentPowerDistributionAssignmentEntity[];
  powerPanels: Map<string, PowerDistributionPanelEntity>;

  // Loading states
  isLoadingService: boolean;
  isLoadingItems: boolean;
  isStartingService: boolean;
  isSavingInspection: boolean;
  isUploadingFile: boolean;
  isCompletingService: boolean;

  // Error
  error: string | null;

  // Current step (1-4)
  currentStep: number;

  // Current inspectable type tab (en Step 2)
  currentInspectableType: InspectableItemTypeEnum;

  // Auto-save debouncer
  saveSubject: Subject<{ itemId: string; data: Partial<ItemInspectionEntity> }> | null;
}

const initialState: ServiceWorkState = {
  service: null,
  equipment: null,
  supervisor: null,
  inspectableItems: [],
  previousInspections: [],
  powerDistributions: [],
  powerPanels: new Map(),
  isLoadingService: false,
  isLoadingItems: false,
  isStartingService: false,
  isSavingInspection: false,
  isUploadingFile: false,
  isCompletingService: false,
  error: null,
  currentStep: 1,
  currentInspectableType: InspectableItemTypeEnum.COMMUNICATION,
  saveSubject: null
};

// ==================== STORE ====================

export const ServiceWorkStore = signalStore(
  withState<ServiceWorkState>(initialState),

  withComputed((state) => ({
    /**
     * Indica si el servicio puede comenzar
     */
    canStartService: computed(() => {
      const service = state.service();
      return service?.status === ServiceStatusEnum.CREATED;
    }),

    /**
     * Indica si el servicio está en progreso
     */
    isServiceInProgress: computed(() => {
      const service = state.service();
      return service?.status === ServiceStatusEnum.IN_PROGRESS;
    }),

    /**
     * Tipo de servicio
     */
    serviceType: computed(() => state.service()?.type || null),

    /**
     * Indica si tiene servicio previo (Mantenimiento o Levantamiento)
     */
    hasPreviousService: computed(() => {
      const service = state.service();
      return Boolean(service?.previousServiceId);
    }),

    /**
     * Items agrupados por tipo
     */
    itemsByType: computed(() => {
      const items = state.inspectableItems();
      const grouped: Record<InspectableItemTypeEnum, InspectableItemWithDetails[]> = {
        [InspectableItemTypeEnum.COMMUNICATION]: [],
        [InspectableItemTypeEnum.STATE]: [],
        [InspectableItemTypeEnum.POWER_SUPPLY]: [],
        [InspectableItemTypeEnum.POWER_120VAC]: [],
        [InspectableItemTypeEnum.ORDER_AND_CLEANLINESS]: [],
        [InspectableItemTypeEnum.OTHERS]: []
      };

      items.forEach(item => {
        grouped[item.type].push(item);
      });

      return grouped;
    }),

    /**
     * Items del tipo actual seleccionado
     */
    currentTypeItems: computed(() => {
      const currentType = state.currentInspectableType();
      const items = state.inspectableItems();
      return items.filter(item => item.type === currentType);
    }),

    /**
     * Progreso total de inspecciones
     */
    inspectionProgress: computed(() => {
      const items = state.inspectableItems();
      if (items.length === 0) return { completed: 0, total: 0, percentage: 0 };

      const completed = items.filter(item =>
        isItemCompleted(item.inspection?.condition || null, item.inspection?.criticality || null)
      ).length;

      return {
        completed,
        total: items.length,
        percentage: Math.round((completed / items.length) * 100)
      };
    }),

    /**
     * Progreso por tipo
     */
    progressByType: computed(() => {
      const itemsByType = state.inspectableItems();
      const progress: Record<InspectableItemTypeEnum, { completed: number; total: number }> = {
        [InspectableItemTypeEnum.COMMUNICATION]: { completed: 0, total: 0 },
        [InspectableItemTypeEnum.STATE]: { completed: 0, total: 0 },
        [InspectableItemTypeEnum.POWER_SUPPLY]: { completed: 0, total: 0 },
        [InspectableItemTypeEnum.POWER_120VAC]: { completed: 0, total: 0 },
        [InspectableItemTypeEnum.ORDER_AND_CLEANLINESS]: { completed: 0, total: 0 },
        [InspectableItemTypeEnum.OTHERS]: { completed: 0, total: 0 }
      };

      itemsByType.forEach(item => {
        progress[item.type].total++;
        if (isItemCompleted(item.inspection?.condition || null, item.inspection?.criticality || null)) {
          progress[item.type].completed++;
        }
      });

      return progress;
    }),

    /**
     * Validación de evidencias
     */
    evidenceValidation: computed(() => {
      const service = state.service();
      if (!service) return null;

      return {
        videoStart: Boolean(service.videoStartFileId),
        videoEnd: Boolean(service.videoEndFileId),
        startPhotos: service.startPhotos.length >= 1 && service.startPhotos.length <= 3,
        midPhotos: service.midPhotos.length >= 1 && service.midPhotos.length <= 3,
        endPhotos: service.endPhotos.length >= 1 && service.endPhotos.length <= 3,
        reportDocument: Boolean(service.reportDocumentFileId),
        isComplete: Boolean(
          service.videoStartFileId &&
          service.videoEndFileId &&
          service.startPhotos.length >= 1 &&
          service.midPhotos.length >= 1 &&
          service.endPhotos.length >= 1 &&
          service.reportDocumentFileId
        )
      };
    }),

    /**
     * Puede completar el servicio
     */
    canCompleteService: computed(() => {
      const service = state.service();
      const progress = state.inspectableItems();
      const evidence = state.service();

      if (!service || !evidence) return false;

      // 1. Todas las inspecciones completadas
      const allInspectionsCompleted = progress.every(item =>
        isItemCompleted(item.inspection?.condition || null, item.inspection?.criticality || null)
      );

      // 2. Todas las evidencias cargadas
      const allEvidencesUploaded = Boolean(
        evidence.videoStartFileId &&
        evidence.videoEndFileId &&
        evidence.startPhotos.length >= 1 &&
        evidence.midPhotos.length >= 1 &&
        evidence.endPhotos.length >= 1 &&
        evidence.reportDocumentFileId
      );

      // 3. Para levantamiento: todas las condiciones válidas
      let validForRaise = true;
      if (service.type === ServiceTypeEnum.RAISE_OBSERVATION) {
        validForRaise = progress.every(item =>
          isValidForRaiseObservation(
            item.inspection?.condition || null,
            item.inspection?.criticality || null
          )
        );
      }

      return allInspectionsCompleted && allEvidencesUploaded && validForRaise;
    }),

    /**
     * Indica si hay cambios sin guardar
     */
    hasUnsavedChanges: computed(() => {
      const items = state.inspectableItems();
      return items.some(item => item.hasUnsavedChanges);
    }),

    /**
     * Indica si está cargando algo
     */
    isLoading: computed(() =>
      state.isLoadingService() ||
      state.isLoadingItems() ||
      state.isStartingService() ||
      state.isSavingInspection() ||
      state.isUploadingFile() ||
      state.isCompletingService()
    )
  })),

  withMethods((store) => {
    const serviceService = inject(EquipmentServiceService);
    const itemInspectionService = inject(ItemInspectionService);
    const cabinetService = inject(CabinetService);
    const panelService = inject(PanelService);
    const supervisorService = inject(SupervisorService);
    const brandService = inject(BrandService);
    const modelService = inject(ModelService);
    const fileService = inject(FileService);
    const powerDistAssignService = inject(EquipmentPowerDistributionAssignmentService);
    const powerPanelService = inject(PowerDistributionPanelService);

    return {
      /**
       * Cargar servicio y toda su información relacionada
       */
      async loadService(serviceId: string): Promise<void> {
        patchState(store, {
          isLoadingService: true,
          error: null
        });

        try {
          // 1. Cargar servicio
          const service = await firstValueFrom(serviceService.getById(serviceId));

          patchState(store, { service });

          // 2. Cargar en paralelo: equipo, supervisor, power distributions
          const [equipment, supervisor, powerDistributions] = await firstValueFrom(
            forkJoin([
              service.equipmentType === EquipmentTypeEnum.CABINET
                ? cabinetService.getById(service.equipmentId)
                : panelService.getById(service.equipmentId),
              supervisorService.getById(service.supervisorId),
              powerDistAssignService.getAllByEquipmentId(service.equipmentId)
            ])
          );

          // 3. Cargar power panels
          const panelIds = powerDistributions.map(pd => pd.powerDistributionPanelId);
          const panels = panelIds.length > 0
            ? await firstValueFrom(powerPanelService.batchGetByIds(panelIds))
            : [];

          const powerPanelsMap = new Map(panels.map(p => [p.id, p]));

          patchState(store, {
            equipment,
            supervisor,
            powerDistributions,
            powerPanels: powerPanelsMap,
            isLoadingService: false
          });

          // 4. Cargar inspectable items
          await this.loadInspectableItems();

        } catch (error: any) {
          console.error('❌ Error loading service:', error);
          patchState(store, {
            isLoadingService: false,
            error: error.message || 'Error al cargar el servicio'
          });
        }
      },
      /**
       * Cargar inspectable items del equipo y enriquecerlos
       */
      async loadInspectableItems(): Promise<void> {
        const service = store.service();
        const equipment = store.equipment();

        if (!service || !equipment) return;

        patchState(store, { isLoadingItems: true });

        try {
          // 1. Obtener inspectable items del equipo
          const items = await firstValueFrom(
            service.equipmentType === EquipmentTypeEnum.CABINET
              ? cabinetService.getAllInspectableItems(equipment.id)
              : panelService.getAllInspectableItems(equipment.id)
          );

          // 2. Extraer IDs únicos de brands y models
          const brandIds = [...new Set(items.map(item => item.brandId))];
          const modelIds = [...new Set(items.map(item => item.modelId))];

          // 3. Cargar brands y models en paralelo
          const [brands, models] = await firstValueFrom(
            forkJoin([
              brandService.batchGetByIds(brandIds),
              modelService.batchGetByIds(modelIds)
            ])
          );

          const brandsMap = new Map(brands.map(b => [b.id, b]));
          const modelsMap = new Map(models.map(m => [m.id, m]));

          // 4. Cargar inspecciones existentes del servicio actual
          let currentInspections: ItemInspectionEntity[] = [];
          try {
            currentInspections = await firstValueFrom(
              serviceService.getAllItemInspections(service.id)
            );
          } catch (error) {
            console.log('No hay inspecciones previas en este servicio');
          }

          const inspectionsMap = new Map(
            currentInspections.map(insp => [insp.itemId, insp])
          );

          // 5. Si tiene servicio previo, cargar esas inspecciones
          let previousInspections: ItemInspectionEntity[] = [];
          if (service.previousServiceId) {
            try {
              previousInspections = await firstValueFrom(
                serviceService.getAllItemInspections(service.previousServiceId)
              );
            } catch (error) {
              console.warn('No se pudieron cargar inspecciones del servicio previo');
            }
          }

          const previousInspectionsMap = new Map(
            previousInspections.map(insp => [insp.itemId, insp])
          );

          // 6. Enriquecer items
          const enrichedItems: InspectableItemWithDetails[] = items.map(item => {
            const brand = brandsMap.get(item.brandId);
            const model = modelsMap.get(item.modelId);

            // Prioridad: inspección actual > inspección previa > null
            let inspection = inspectionsMap.get(item.id) || null;

            // Si no tiene inspección actual pero sí previa (Mantenimiento/Levantamiento)
            if (!inspection && service.previousServiceId) {
              const prevInspection = previousInspectionsMap.get(item.id);
              if (prevInspection) {
                // Crear una copia para pre-cargar (sin ID para que se cree una nueva)
                inspection = {
                  ...prevInspection,
                  id: '' // Vacío para indicar que es nueva
                };
              }
            }

            return {
              ...item,
              brandName: brand?.name || 'Desconocido',
              modelName: model?.name || 'Desconocido',
              inspection,
              isSaving: false,
              lastSaved: null,
              hasUnsavedChanges: false
            };
          });

          patchState(store, {
            inspectableItems: enrichedItems,
            previousInspections,
            isLoadingItems: false
          });

          // 7. Configurar auto-save
          this.setupAutoSave();

        } catch (error: any) {
          console.error('❌ Error loading inspectable items:', error);
          patchState(store, {
            isLoadingItems: false,
            error: error.message || 'Error al cargar los items'
          });
        }
      },

      /**
       * Configurar auto-save con debounce
       */
      setupAutoSave(): void {
        const saveSubject = new Subject<{
          itemId: string;
          data: Partial<ItemInspectionEntity>
        }>();

        // Auto-save después de 2 segundos de inactividad
        saveSubject.pipe(
          debounceTime(2000)
        ).subscribe(async ({ itemId, data }) => {
          await this.saveItemInspection(itemId, data, true);
        });

        patchState(store, { saveSubject });
      },

      /**
       * Comenzar servicio (cambiar status a IN_PROGRESS)
       */
      async startService(): Promise<boolean> {
        const service = store.service();
        if (!service || service.status !== ServiceStatusEnum.CREATED) {
          return false;
        }

        patchState(store, { isStartingService: true, error: null });

        try {
          // TODO: Cambiar a endpoint específico cuando backend lo tenga
          // const updatedService = await firstValueFrom(
          //   serviceService.startService(service.id)
          // );

          // Por ahora usar update genérico:
          const updatedService = await firstValueFrom(
            serviceService.update(service.id, {
              ...service,
              status: ServiceStatusEnum.IN_PROGRESS,
              startedAt: new Date()
            })
          );

          patchState(store, {
            service: updatedService,
            isStartingService: false,
            currentStep: 2 // Avanzar a inspección
          });

          return true;

        } catch (error: any) {
          console.error('❌ Error starting service:', error);
          patchState(store, {
            isStartingService: false,
            error: error.message || 'Error al iniciar el servicio'
          });
          return false;
        }
      },

      /**
       * Actualizar condición de un item (trigger auto-save)
       */
      updateItemCondition(
        itemId: string,
        condition: ItemConditionEnum
      ): void {
        const items = store.inspectableItems();
        const itemIndex = items.findIndex(i => i.id === itemId);

        if (itemIndex === -1) return;

        const item = items[itemIndex];
        const requiresCrit = condition && [
          ItemConditionEnum.FAILURE,
          ItemConditionEnum.BAD_STATE,
          ItemConditionEnum.DEFICIENT
        ].includes(condition);

        // Si no requiere criticidad, limpiarla
        const newInspection: Partial<ItemInspectionEntity> = {
          ...item.inspection,
          itemId: item.id,
          itemType: item.type,
          condition,
          criticality: requiresCrit ? item.inspection?.criticality || null : null
        };

        // Actualizar en el estado
        const updatedItems = [...items];
        updatedItems[itemIndex] = {
          ...item,
          inspection: newInspection as ItemInspectionEntity,
          hasUnsavedChanges: true
        };

        patchState(store, { inspectableItems: updatedItems });

        // Trigger auto-save
        const saveSubject = store.saveSubject();
        if (saveSubject) {
          saveSubject.next({ itemId, data: newInspection });
        }
      },

      /**
       * Actualizar criticidad de un item (trigger auto-save)
       */
      updateItemCriticality(
        itemId: string,
        criticality: CriticalityEnum | null
      ): void {
        const items = store.inspectableItems();
        const itemIndex = items.findIndex(i => i.id === itemId);

        if (itemIndex === -1) return;

        const item = items[itemIndex];
        const newInspection: Partial<ItemInspectionEntity> = {
          ...item.inspection,
          criticality
        };

        // Actualizar en el estado
        const updatedItems = [...items];
        updatedItems[itemIndex] = {
          ...item,
          inspection: newInspection as ItemInspectionEntity,
          hasUnsavedChanges: true
        };

        patchState(store, { inspectableItems: updatedItems });

        // Trigger auto-save
        const saveSubject = store.saveSubject();
        if (saveSubject) {
          saveSubject.next({ itemId, data: newInspection });
        }
      },

      /**
       * Actualizar observación de un item (trigger auto-save)
       */
      updateItemObservation(
        itemId: string,
        observation: string
      ): void {
        const items = store.inspectableItems();
        const itemIndex = items.findIndex(i => i.id === itemId);

        if (itemIndex === -1) return;

        const item = items[itemIndex];
        const newInspection: Partial<ItemInspectionEntity> = {
          ...item.inspection,
          observation
        };

        // Actualizar en el estado
        const updatedItems = [...items];
        updatedItems[itemIndex] = {
          ...item,
          inspection: newInspection as ItemInspectionEntity,
          hasUnsavedChanges: true
        };

        patchState(store, { inspectableItems: updatedItems });

        // Trigger auto-save
        const saveSubject = store.saveSubject();
        if (saveSubject) {
          saveSubject.next({ itemId, data: newInspection });
        }
      },

      /**
       * Guardar inspección de un item
       */
      async saveItemInspection(
        itemId: string,
        data: Partial<ItemInspectionEntity>,
        isAutoSave = false
      ): Promise<boolean> {
        const service = store.service();
        const items = store.inspectableItems();
        const itemIndex = items.findIndex(i => i.id === itemId);

        if (!service || itemIndex === -1) return false;

        // Marcar como guardando
        const updatedItems = [...items];
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          isSaving: true
        };
        patchState(store, {
          inspectableItems: updatedItems,
          isSavingInspection: true
        });

        try {
          const item = items[itemIndex];
          const inspectionData: ItemInspectionEntity = {
            id: item.inspection?.id || '',
            itemId: item.id,
            itemType: item.type,
            condition: data.condition || item.inspection?.condition || ItemConditionEnum.OPERATIONAL,
            observation: data.observation || item.inspection?.observation || '',
            criticality: data.criticality !== undefined ? data.criticality : item.inspection?.criticality || null
          };

          let savedInspection: ItemInspectionEntity;

          // Si tiene ID, actualizar; si no, crear
          if (inspectionData.id) {
            savedInspection = await firstValueFrom(
              itemInspectionService.update(inspectionData.id, inspectionData)
            );
          } else {
            savedInspection = await firstValueFrom(
              itemInspectionService.create(inspectionData, service.id)
            );
          }

          // Actualizar item con inspección guardada
          const finalItems = [...store.inspectableItems()];
          const finalIndex = finalItems.findIndex(i => i.id === itemId);

          if (finalIndex !== -1) {
            finalItems[finalIndex] = {
              ...finalItems[finalIndex],
              inspection: savedInspection,
              isSaving: false,
              hasUnsavedChanges: false,
              lastSaved: new Date()
            };
          }

          patchState(store, {
            inspectableItems: finalItems,
            isSavingInspection: false
          });

          if (!isAutoSave) {
            console.log('✅ Inspección guardada manualmente');
          }

          return true;

        } catch (error: any) {
          console.error('❌ Error saving inspection:', error);

          // Revertir estado de guardando
          const revertItems = [...store.inspectableItems()];
          const revertIndex = revertItems.findIndex(i => i.id === itemId);
          if (revertIndex !== -1) {
            revertItems[revertIndex] = {
              ...revertItems[revertIndex],
              isSaving: false
            };
          }

          patchState(store, {
            inspectableItems: revertItems,
            isSavingInspection: false,
            error: error.message || 'Error al guardar la inspección'
          });

          return false;
        }
      },

      /**
       * Guardar todo el progreso manualmente
       */
      async saveAllProgress(): Promise<boolean> {
        const items = store.inspectableItems().filter(item => item.hasUnsavedChanges);

        if (items.length === 0) {
          console.log('✅ No hay cambios pendientes');
          return true;
        }

        patchState(store, { isSavingInspection: true });

        try {
          // Guardar todos los items con cambios
          const savePromises = items.map(item =>
            this.saveItemInspection(item.id, item.inspection || {}, false)
          );

          await Promise.all(savePromises);

          console.log(`✅ ${items.length} inspecciones guardadas`);
          return true;

        } catch (error: any) {
          console.error('❌ Error saving all progress:', error);
          patchState(store, {
            isSavingInspection: false,
            error: 'Error al guardar el progreso'
          });
          return false;
        }
      },

      /**
       * Subir archivo (video, foto, PDF)
       */
      async uploadFile(
        file: File,
        type: 'videoStart' | 'videoEnd' | 'startPhoto' | 'midPhoto' | 'endPhoto' | 'report'
      ): Promise<boolean> {
        const service = store.service();
        if (!service) return false;

        patchState(store, { isUploadingFile: true, error: null });

        try {
          // 1. Subir archivo
          const uploadedFile = await firstValueFrom(fileService.upload(file));

          // 2. Actualizar servicio según el tipo
          const updates: Partial<EquipmentServiceEntity> = {};

          switch (type) {
            case 'videoStart':
              updates.videoStartFileId = uploadedFile.id;
              break;
            case 'videoEnd':
              updates.videoEndFileId = uploadedFile.id;
              break;
            case 'startPhoto':
              updates.startPhotos = [...service.startPhotos, uploadedFile.id];
              break;
            case 'midPhoto':
              updates.midPhotos = [...service.midPhotos, uploadedFile.id];
              break;
            case 'endPhoto':
              updates.endPhotos = [...service.endPhotos, uploadedFile.id];
              break;
            case 'report':
              updates.reportDocumentFileId = uploadedFile.id;
              break;
          }

          // 3. Actualizar en backend
          const updatedService = await firstValueFrom(
            serviceService.update(service.id, { ...service, ...updates })
          );

          patchState(store, {
            service: updatedService,
            isUploadingFile: false
          });

          return true;

        } catch (error: any) {
          console.error('❌ Error uploading file:', error);
          patchState(store, {
            isUploadingFile: false,
            error: error.message || 'Error al subir el archivo'
          });
          return false;
        }
      },

      /**
       * Eliminar foto
       */
      async removePhoto(
        photoId: string,
        type: 'startPhoto' | 'midPhoto' | 'endPhoto'
      ): Promise<boolean> {
        const service = store.service();
        if (!service) return false;

        patchState(store, { isUploadingFile: true });

        try {
          const updates: Partial<EquipmentServiceEntity> = {};

          switch (type) {
            case 'startPhoto':
              updates.startPhotos = service.startPhotos.filter(id => id !== photoId);
              break;
            case 'midPhoto':
              updates.midPhotos = service.midPhotos.filter(id => id !== photoId);
              break;
            case 'endPhoto':
              updates.endPhotos = service.endPhotos.filter(id => id !== photoId);
              break;
          }

          const updatedService = await firstValueFrom(
            serviceService.update(service.id, { ...service, ...updates })
          );

          patchState(store, {
            service: updatedService,
            isUploadingFile: false
          });

          return true;

        } catch (error: any) {
          console.error('❌ Error removing photo:', error);
          patchState(store, {
            isUploadingFile: false,
            error: 'Error al eliminar la foto'
          });
          return false;
        }
      },

      /**
       * Completar servicio
       */
      async completeService(): Promise<boolean> {
        const service = store.service();
        if (!service || !store.canCompleteService()) {
          return false;
        }

        patchState(store, { isCompletingService: true, error: null });

        try {
          // TODO: Usar endpoint específico cuando backend lo tenga
          // const completedService = await firstValueFrom(
          //   serviceService.completeService(service.id)
          // );

          // Por ahora usar update:
          const completedService = await firstValueFrom(
            serviceService.update(service.id, {
              ...service,
              status: ServiceStatusEnum.COMPLETED,
              completedAt: new Date()
            })
          );

          patchState(store, {
            service: completedService,
            isCompletingService: false
          });

          return true;

        } catch (error: any) {
          console.error('❌ Error completing service:', error);
          patchState(store, {
            isCompletingService: false,
            error: error.message || 'Error al completar el servicio'
          });
          return false;
        }
      },

      /**
       * Cambiar step del stepper
       */
      setCurrentStep(step: number): void {
        if (step >= 1 && step <= 4) {
          patchState(store, { currentStep: step });
        }
      },

      /**
       * Cambiar tipo de inspectable item (tab)
       */
      setCurrentInspectableType(type: InspectableItemTypeEnum): void {
        patchState(store, { currentInspectableType: type });
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
        const saveSubject = store.saveSubject();
        if (saveSubject) {
          saveSubject.complete();
        }
        patchState(store, initialState);
      }
    };
  })
);
