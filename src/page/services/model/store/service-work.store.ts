import {computed, inject} from '@angular/core';
import {patchState, signalStore, withComputed, withMethods, withState} from '@ngrx/signals';
import {firstValueFrom, forkJoin} from 'rxjs';
import {
  EquipmentServiceEntity,
  EquipmentServiceService,
  ServiceStatusEnum
} from '../../../../entities/equipment-service';
import {CabinetEntity} from '../../../../entities/cabinet/model';
import {PanelEntity} from '../../../../entities/panel/model';
import {SupervisorEntity, SupervisorService} from '../../../../entities/supervisor';
import {ItemInspectionWithDetails} from '../interfaces/item-inspection-with-details.interface';
import {ItemInspectionEntity, ItemInspectionService} from '../../../../entities/item-inspection';
import {InspectableItemService} from '../../../../entities/inspectable-item';
import {
  EquipmentPowerDistributionAssignmentEntity
} from '../../../../entities/equipment-power-distribution-assignment/model/entities/equipment-power-distribution-assignment.entity';
import {PowerDistributionPanelEntity} from '../../../../entities/power-distribution-panel/model';
import {InspectableItemTypeEnum} from '../../../../shared/model/enums';
import {isItemCompleted, requiresCriticality} from '../../utils/service-work-validation.helpers';
import {EquipmentTypeEnum} from '../../../../shared/model';
import {CabinetService} from '../../../../entities/cabinet/api';
import {PanelService} from '../../../../entities/panel/api';
import {BrandService} from '../../../../entities/brand';
import {ModelService} from '../../../../entities/model';
import {FileService} from '../../../../entities/file/api/file.service';
import {
  EquipmentPowerDistributionAssignmentService
} from '../../../../entities/equipment-power-distribution-assignment/api';
import {PowerDistributionPanelService} from '../../../../entities/power-distribution-panel/api';
import {ItemConditionEnum} from '../../../../shared/model/enums/item-condition.enum';
import {CriticalityEnum} from '../../../../shared/model/enums/criticality.enum';
import {TabConfig, TabProgress} from '../interfaces/tab-config.interface';
import {EvidenceFile} from '../interfaces/evidence-file.interface';
import {DescriptionService} from '../../../../entities/description/api/services/description.service';

const TAB_CONFIGS: TabConfig[] = [
  {
    type: InspectableItemTypeEnum.COMMUNICATION,
    label: 'Comunicación',
    icon: 'pi-wifi',
    color: 'sky'
  },
  {
    type: InspectableItemTypeEnum.POWER_SUPPLY,
    label: 'Fuentes',
    icon: 'pi-bolt',
    color: 'amber'
  },
  {
    type: InspectableItemTypeEnum.POWER_120VAC,
    label: '120 VAC',
    icon: 'pi-flash',
    color: 'yellow'
  },
  {
    type: InspectableItemTypeEnum.ORDER_AND_CLEANLINESS,
    label: 'Orden y Limpieza',
    icon: 'pi-check-square',
    color: 'green'
  },
  {
    type: InspectableItemTypeEnum.OTHERS,
    label: 'Otros',
    icon: 'pi-ellipsis-h',
    color: 'gray'
  }
];

export interface ServiceWorkState {
  // Service data
  service: EquipmentServiceEntity | null;
  equipment: CabinetEntity | PanelEntity | null;
  supervisor: SupervisorEntity | null;

  // 🆕 CAMBIO: Lista de inspecciones enriquecidas y planas
  itemInspections: ItemInspectionWithDetails[];

  // Power distribution
  powerDistributions: EquipmentPowerDistributionAssignmentEntity[];
  powerPanels: Map<string, PowerDistributionPanelEntity>;

  // Evidence files cargados
  evidenceFiles: {
    videoStart: EvidenceFile | null;
    videoEnd: EvidenceFile | null;
    startPhotos: EvidenceFile[];
    midPhotos: EvidenceFile[];
    endPhotos: EvidenceFile[];
    report: EvidenceFile | null;
  };

  // Loading states
  isLoadingService: boolean;
  isLoadingItems: boolean;
  isLoadingEvidence: boolean;
  isStartingService: boolean;
  isSavingInspection: boolean;
  isUploadingFile: boolean;
  uploadingStatus: {
    videoStart: boolean;
    videoEnd: boolean;
    startPhoto: boolean;
    midPhoto: boolean;
    endPhoto: boolean;
    report: boolean;
  };
  isCompletingService: boolean;
  isCancelingService: boolean;

  // Error
  error: string | null;

  // Current step (1-4)
  currentStep: number;

  // Current inspectable type tab (en Step 2)
  currentInspectableType: InspectableItemTypeEnum;
}

const initialState: ServiceWorkState = {
  service: null,
  equipment: null,
  supervisor: null,
  itemInspections: [],
  powerDistributions: [],
  powerPanels: new Map(),
  evidenceFiles: {
    videoStart: null,
    videoEnd: null,
    startPhotos: [],
    midPhotos: [],
    endPhotos: [],
    report: null
  },
  isLoadingService: false,
  isLoadingItems: false,
  isLoadingEvidence: false,
  isStartingService: false,
  isSavingInspection: false,
  isUploadingFile: false,
  uploadingStatus: {
    videoStart: false,
    videoEnd: false,
    startPhoto: false,
    midPhoto: false,
    endPhoto: false,
    report: false
  },
  isCompletingService: false,
  isCancelingService: false,
  error: null,
  currentStep: 1,
  currentInspectableType: InspectableItemTypeEnum.COMMUNICATION
};

export const ServiceWorkStore = signalStore(
  withState<ServiceWorkState>(initialState),

  withComputed((state) => ({
    tabConfigs: computed(() => TAB_CONFIGS),
    serviceType: computed(() => state.service()?.type || null),
    tabProgress: computed(() => {
      const items = state.itemInspections(); // 🆕 CAMBIO
      const progressMap = new Map<InspectableItemTypeEnum, TabProgress>();

      TAB_CONFIGS.forEach(config => {
        const tabItems = items.filter(item => item.type === config.type);
        const completed = tabItems.filter(item =>
          isItemCompleted(item.condition, item.criticality) // 🆕 CAMBIO
        ).length;

        progressMap.set(config.type, {
          completed,
          total: tabItems.length,
          percentage: tabItems.length > 0 ? Math.round((completed / tabItems.length) * 100) : 0
        });
      });

      return progressMap;
    }),
    inspectionProgress: computed(() => {
      const items = state.itemInspections();
      if (items.length === 0) return { completed: 0, total: 0, percentage: 0 };

      const completed = items.filter(item =>
        isItemCompleted(item.condition, item.criticality)
      ).length;

      return {
        completed,
        total: items.length,
        percentage: Math.round((completed / items.length) * 100)
      };
    }),
    evidenceValidation: computed(() => {
      const evidence = state.evidenceFiles();
      return {
        videoStart: !!evidence.videoStart,
        videoEnd: !!evidence.videoEnd,
        startPhotos: evidence.startPhotos.length >= 1 && evidence.startPhotos.length <= 3,
        midPhotos: evidence.midPhotos.length >= 1 && evidence.midPhotos.length <= 3,
        endPhotos: evidence.endPhotos.length >= 1 && evidence.endPhotos.length <= 3,
        report: !!evidence.report,
        isComplete: !!(
          evidence.videoStart &&
          evidence.videoEnd &&
          evidence.startPhotos.length >= 1 &&
          evidence.midPhotos.length >= 1 &&
          evidence.endPhotos.length >= 1
        )
      };
    }),
    canStartService: computed(() => {
      const service = state.service();
      return service?.status === ServiceStatusEnum.CREATED;
    }),
    isServiceInProgress: computed(() => {
      const service = state.service();
      return service?.status === ServiceStatusEnum.IN_PROGRESS;
    }),
    canCompleteService: computed(() => {
      const service = state.service();
      const progress = state.itemInspections();
      const evidenceValidation = state.evidenceFiles();

      if (!service) return false;

      const allInspectionsCompleted = progress.every(item =>
        isItemCompleted(item.condition, item.criticality)
      );

      const allEvidencesUploaded = !!(
        evidenceValidation.videoStart &&
        evidenceValidation.videoEnd &&
        evidenceValidation.startPhotos.length >= 1 &&
        evidenceValidation.midPhotos.length >= 1 &&
        evidenceValidation.endPhotos.length >= 1
      );

      return allInspectionsCompleted && allEvidencesUploaded;
    }),
    hasUnsavedChanges: computed(() => {
      const items = state.itemInspections();
      return items.some(item => item.hasUnsavedChanges);
    }),
    currentTypeItems: computed(() => {
      const currentType = state.currentInspectableType();
      const items = state.itemInspections();
      return items.filter(item => item.type === currentType);
    }),
    isLoading: computed(() => {
      const uploading = Object.values(state.uploadingStatus()).some(status => status === true);
      return state.isLoadingService() ||
        state.isLoadingItems() ||
        state.isLoadingEvidence() ||
        state.isStartingService() ||
        state.isSavingInspection() ||
        uploading ||
        state.isCompletingService() ||
        state.isCancelingService();
    }), })),

  withMethods((store) => {
    const serviceService = inject(EquipmentServiceService);
    const itemInspectionService = inject(ItemInspectionService);
    const inspectableItemService = inject(InspectableItemService);
    const supervisorService = inject(SupervisorService);
    const brandService = inject(BrandService);
    const modelService = inject(ModelService);
    const descriptionService = inject(DescriptionService);
    const fileService = inject(FileService);
    const powerDistAssignService = inject(EquipmentPowerDistributionAssignmentService);
    const powerPanelService = inject(PowerDistributionPanelService);
    const cabinetService = inject(CabinetService); // Para Paso 1
    const panelService = inject(PanelService);     // Para Paso 1

    return {
      async loadService(serviceId: string): Promise<void> {
        patchState(store, {
          isLoadingService: true,
          error: null
        });

        try {
          const service = await firstValueFrom(serviceService.getById(serviceId));

          patchState(store, { service });

          const [equipment, supervisor, powerDistributions] = await firstValueFrom(
            forkJoin([
              service.equipmentType === EquipmentTypeEnum.CABINET
                ? cabinetService.getById(service.equipmentId)
                : panelService.getById(service.equipmentId),
              supervisorService.getById(service.supervisorId),
              powerDistAssignService.getAllByEquipmentId(service.equipmentId)
            ])
          );

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

          await this.loadItemInspections();

          await this.loadEvidenceFiles();

        } catch (error: any) {
          console.error('❌ Error loading service:', error);
          patchState(store, {
            isLoadingService: false,
            error: error.message || 'Error al cargar el servicio'
          });
        }
      },

      async loadItemInspections(): Promise<void> {
        const service = store.service();
        if (!service) return;

        patchState(store, { isLoadingItems: true });

        try {
          let inspections: ItemInspectionEntity[] = [];
          try {
            inspections = await firstValueFrom(serviceService.getAllItemInspections(service.id));
          } catch (error) {
            patchState(store, {
              isLoadingItems: false,
              error: 'Error al cargar las inspecciones del servicio'
            });
            return;
          }

          if (inspections.length === 0) {
            console.warn('⚠️ No se encontraron inspecciones para este servicio.');
            patchState(store, { itemInspections: [], isLoadingItems: false });
            return;
          }

          const itemIds = inspections.map(insp => insp.itemId);
          const items = await firstValueFrom(inspectableItemService.getAllByIds(itemIds));
          const itemsMap = new Map(items.map(i => [i.id, i]));

          const brandIds = [...new Set(items.map(item => item.brandId))];
          const modelIds = [...new Set(items.map(item => item.modelId))];
          const descriptionIds = [...new Set(items.map(item => item.descriptionId))];

          const [brands, models, descriptions] = await firstValueFrom(
            forkJoin([
              brandService.batchGetByIds(brandIds),
              modelService.batchGetByIds(modelIds),
              descriptionService.batchGetByIds(descriptionIds)
            ])
          );

          const brandsMap = new Map(brands.map(b => [b.id, b]));
          const modelsMap = new Map(models.map(m => [m.id, m]));
          const descriptionsMap = new Map(descriptions.map(d => [d.id, d]));

          const enrichedInspections: ItemInspectionWithDetails[] = inspections.reduce(
            (acc: ItemInspectionWithDetails[], inspection) => {

              const item = itemsMap.get(inspection.itemId);

              if (!item) {
                console.warn(`⚠️ Se encontró la inspección ${inspection.id} pero no su ítem ${inspection.itemId}`);
                return acc;
              }

              const brand = brandsMap.get(item.brandId);
              const model = modelsMap.get(item.modelId);
              const description = descriptionsMap.get(item.descriptionId);

              acc.push({
                // IDs
                id: inspection.id,
                itemId: item.id,
                // Datos de Inspección
                condition: inspection.condition,
                criticality: inspection.criticality,
                observation: inspection.observation,
                // Datos de Ítem
                tag: item.tag,
                type: item.type,
                // Datos Enriquecidos
                brandName: brand?.name || 'Desconocido',
                modelName: model?.name || 'Desconocido',
                descriptionName: description?.name || 'Sin descripción',
                // Estado de UI
                isSaving: false,
                lastSaved: null,
                hasUnsavedChanges: false
              });

              return acc;
            },
            []
          );

          patchState(store, {
            itemInspections: enrichedInspections,
            isLoadingItems: false
          });

        } catch (error: any) {
          console.error('❌ Error loading inspectable items:', error);
          patchState(store, {
            isLoadingItems: false,
            error: error.message || 'Error al cargar los items'
          });
        }
      },

      async loadEvidenceFiles(): Promise<void> {
        const service = store.service();
        if (!service) return;

        patchState(store, { isLoadingEvidence: true });

        try {
          const fileIds: string[] = [
            service.videoStartFileId,
            service.videoEndFileId,
            ...service.startPhotos,
            ...service.midPhotos,
            ...service.endPhotos,
            service.reportDocumentFileId
          ].filter(id => id && id.trim() !== '') as string[];

          if (fileIds.length === 0) {
            patchState(store, {
              evidenceFiles: initialState.evidenceFiles,
              isLoadingEvidence: false
            });
            return;
          }

          const fileEntities = await Promise.all(
            fileIds.map(id => firstValueFrom(fileService.getById(id)))
          );

          const filesMap = new Map(fileEntities.map(f => [f.id, f]));

          const evidenceFiles = {
            videoStart: service.videoStartFileId
              ? { fileEntity: filesMap.get(service.videoStartFileId)!, isLoading: false }
              : null,
            videoEnd: service.videoEndFileId
              ? { fileEntity: filesMap.get(service.videoEndFileId)!, isLoading: false }
              : null,
            startPhotos: service.startPhotos
              .map(id => ({ fileEntity: filesMap.get(id)!, isLoading: false }))
              .filter(f => f.fileEntity),
            midPhotos: service.midPhotos
              .map(id => ({ fileEntity: filesMap.get(id)!, isLoading: false }))
              .filter(f => f.fileEntity),
            endPhotos: service.endPhotos
              .map(id => ({ fileEntity: filesMap.get(id)!, isLoading: false }))
              .filter(f => f.fileEntity),
            report: service.reportDocumentFileId
              ? { fileEntity: filesMap.get(service.reportDocumentFileId)!, isLoading: false }
              : null
          };

          patchState(store, {
            evidenceFiles,
            isLoadingEvidence: false
          });

        } catch (error: any) {
          console.error('❌ Error loading evidence files:', error);
          patchState(store, {
            isLoadingEvidence: false,
            error: error.message || 'Error al cargar las evidencias'
          });
        }
      },

      async startService(): Promise<boolean> {
        const service = store.service();
        if (!service || service.status !== ServiceStatusEnum.CREATED) {
          return false;
        }

        patchState(store, { isStartingService: true, error: null });

        try {
          const startedService = await firstValueFrom(serviceService.start(service.id));

          patchState(store, {
            service: startedService,
            isStartingService: false,
            currentStep: 2
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

      updateItemCondition(inspectionId: string, condition: ItemConditionEnum | null): void {
        const items = store.itemInspections();
        const itemIndex = items.findIndex(i => i.id === inspectionId);

        if (itemIndex === -1) return;

        const item = items[itemIndex];

        const requiresCrit = condition ? requiresCriticality(condition) : false;

        let newCriticality = item.criticality;

        if (!requiresCrit) {
          newCriticality = null;
        }

        const updatedItems = [...items];
        updatedItems[itemIndex] = {
          ...item,
          condition: condition,
          criticality: newCriticality,
          hasUnsavedChanges: true
        };

        patchState(store, { itemInspections: updatedItems });
      },

      updateItemCriticality(inspectionId: string, criticality: CriticalityEnum | null): void {
        const items = store.itemInspections();
        const itemIndex = items.findIndex(i => i.id === inspectionId);

        if (itemIndex === -1) return;

        const item = items[itemIndex];

        const updatedItems = [...items];
        updatedItems[itemIndex] = {
          ...item,
          criticality: criticality,
          hasUnsavedChanges: true
        };

        patchState(store, { itemInspections: updatedItems });
      },

      updateItemObservation(inspectionId: string, observation: string | null): void { // 🆕 Acepta null
        const items = store.itemInspections();
        const itemIndex = items.findIndex(i => i.id === inspectionId);

        if (itemIndex === -1) return;

        const item = items[itemIndex];

        const updatedItems = [...items];
        updatedItems[itemIndex] = {
          ...item,
          observation: observation || '',
          hasUnsavedChanges: true
        };

        patchState(store, { itemInspections: updatedItems });
      },

      async saveItemInspection(inspectionId: string, _: Partial<ItemInspectionWithDetails>): Promise<boolean> {

        const items = store.itemInspections();
        const itemIndex = items.findIndex(i => i.id === inspectionId);

        if (itemIndex === -1) return false;

        const currentItem = items[itemIndex];

        const updatedItems = [...items];
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          isSaving: true
        };
        patchState(store, {
          itemInspections: updatedItems,
          isSavingInspection: true,
          error: null
        });

        try {
          if (!currentItem.id) {
            console.error(`❌ Error fatal: Item ${currentItem.itemId} no tiene inspection ID`);
          }

          const inspectionData: Partial<ItemInspectionEntity> = {
            condition: currentItem.condition,
            criticality: currentItem.criticality,
            observation: currentItem.observation || ''
          };

          const savedInspection = await firstValueFrom(itemInspectionService.update(currentItem.id, inspectionData));

          const finalItems = [...store.itemInspections()];
          const finalIndex = finalItems.findIndex(i => i.id === inspectionId);

          if (finalIndex !== -1) {
            finalItems[finalIndex] = {
              ...finalItems[finalIndex],
              condition: savedInspection.condition,
              criticality: savedInspection.criticality,
              observation: savedInspection.observation,
              isSaving: false,
              hasUnsavedChanges: false,
              lastSaved: new Date()
            };
          }

          patchState(store, {
            itemInspections: finalItems,
            isSavingInspection: false
          });

          return true;

        } catch (error: any) {
          console.error('❌ Error saving inspection:', error);

          const revertItems = [...store.itemInspections()];
          const revertIndex = revertItems.findIndex(i => i.id === inspectionId);
          if (revertIndex !== -1) {
            revertItems[revertIndex] = {
              ...revertItems[revertIndex],
              isSaving: false
            };
          }

          patchState(store, {
            itemInspections: revertItems,
            isSavingInspection: false,
            error: error.message || 'Error al guardar la inspección'
          });

          return false;
        }
      },

      async saveAllProgress(): Promise<boolean> {
        const items = store.itemInspections().filter(item => item.hasUnsavedChanges);

        if (items.length === 0) {
          return true;
        }

        patchState(store, { isSavingInspection: true });

        try {
          const savePromises = items.map(item =>
            this.saveItemInspection(item.id, {})
          );

          await Promise.all(savePromises);

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

      setCurrentInspectableType(type: InspectableItemTypeEnum): void {
        patchState(store, { currentInspectableType: type });
      },

      // En service-work.store.ts

      async uploadFile(file: File, type: 'videoStart' | 'videoEnd' | 'startPhoto' | 'midPhoto' | 'endPhoto' | 'report'): Promise<boolean> {

        const service = store.service();
        if (!service) return false;

        // 1. Poner ESE TIPO específico en 'true'
        patchState(store, state => ({
          error: null,
          uploadingStatus: {
            ...state.uploadingStatus,
            [type]: true // Actualización dinámica
          }
        }));

        try {
          // 2. Subir archivo
          const uploadedFile = await firstValueFrom(fileService.upload(file));

          // 3. Actualizar servicio (ESTA ES LA PARTE CORREGIDA)
          const updates: Partial<EquipmentServiceEntity> = {};

          // ⬇️ TU SWITCH ESTABA INCOMPLETO. ESTE ES EL CORRECTO. ⬇️
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
          // ⬆️ FIN DE LA CORRECCIÓN ⬆️

          // 4. Actualizar en backend
          const updatedService = await firstValueFrom(
            serviceService.update(service.id, { ...service, ...updates })
          );

          // 5. Poner ESE TIPO en 'false' y actualizar servicio
          patchState(store, state => ({
            service: updatedService,
            uploadingStatus: {
              ...state.uploadingStatus,
              [type]: false
            }
          }));

          return true;

        } catch (error: any) {
          console.error('❌ Error uploading file:', error);
          patchState(store, state => ({
            error: error.message || 'Error al subir el archivo',
            uploadingStatus: {
              ...state.uploadingStatus,
              [type]: false
            }
          }));
          return false;
        }
      },

      async removePhoto(photoId: string, type: 'startPhoto' | 'midPhoto' | 'endPhoto'): Promise<boolean> {
        const service = store.service();
        if (!service) return false;

        // 1. Poner el estado de carga ESE TIPO en 'true'
        // (Usamos el mismo flag de 'uploading' para mostrar 'eliminando...')
        patchState(store, state => ({
          error: null,
          uploadingStatus: {
            ...state.uploadingStatus,
            [type]: true
          }
        }));

        try {
          // 2. Preparar la actualización
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

          // 3. Llamar al servicio de backend para actualizar la entidad
          const updatedService = await firstValueFrom(
            serviceService.update(service.id, { ...service, ...updates })
          );

          // 4. Actualizar el estado en éxito
          patchState(store, state => ({
            service: updatedService,
            uploadingStatus: {
              ...state.uploadingStatus,
              [type]: false
            }
          }));

          return true;

        } catch (error: any) {
          console.error('❌ Error removing photo:', error);

          // 5. Actualizar el estado en error
          patchState(store, state => ({
            uploadingStatus: {
              ...state.uploadingStatus,
              [type]: false
            },
            error: error.message || 'Error al eliminar la foto'
          }));

          return false;
        }
      },

      /**
       * 🆕 Eliminar Video (con estado de carga individual)
       */
      async removeVideo(type: 'videoStart' | 'videoEnd'): Promise<boolean> {
        const service = store.service();
        if (!service) return false;

        // 1. Poner el estado de carga en 'true'
        patchState(store, state => ({
          error: null,
          uploadingStatus: { ...state.uploadingStatus, [type]: true }
        }));

        try {
          // 2. Preparar la actualización (setear a null)
          const updates: Partial<EquipmentServiceEntity> = {
            [type === 'videoStart' ? 'videoStartFileId' : 'videoEndFileId']: null
          };

          console.log(`🔄 Removing video ${type}, updates:`, updates);

          // 3. Llamar al backend
          const updatedService = await firstValueFrom(
            serviceService.update(service.id, { ...service, ...updates })
          );

          // 4. Actualizar estado en éxito
          patchState(store, state => ({
            service: updatedService,
            uploadingStatus: { ...state.uploadingStatus, [type]: false }
          }));
          return true;

        } catch (error: any) {
          console.error(`❌ Error removing video ${type}:`, error);
          patchState(store, state => ({
            uploadingStatus: { ...state.uploadingStatus, [type]: false },
            error: error.message || 'Error al eliminar el video'
          }));
          return false;
        }
      },

      /**
       * 🆕 Eliminar Reporte (con estado de carga individual)
       */
      async removeReport(): Promise<boolean> {
        const service = store.service();
        if (!service) return false;

        patchState(store, state => ({
          error: null,
          uploadingStatus: { ...state.uploadingStatus, report: true }
        }));

        try {
          const updates: Partial<EquipmentServiceEntity> = {
            reportDocumentFileId: null
          };

          const updatedService = await firstValueFrom(
            serviceService.update(service.id, { ...service, ...updates })
          );

          patchState(store, state => ({
            service: updatedService,
            uploadingStatus: { ...state.uploadingStatus, report: false }
          }));
          return true;

        } catch (error: any) {
          console.error('❌ Error removing report:', error);
          patchState(store, state => ({
            uploadingStatus: { ...state.uploadingStatus, report: false },
            error: error.message || 'Error al eliminar el reporte'
          }));
          return false;
        }
      },

      async completeService(): Promise<boolean> {
        const service = store.service();
        if (!service || !store.canCompleteService()) {
          return false;
        }

        patchState(store, { isCompletingService: true, error: null });

        try {
          const completedService = await firstValueFrom(serviceService.complete(service.id));

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

      async cancelService(): Promise<boolean> {
        const service = store.service();
        if (!service) {return false;}

        patchState(store, { isCancelingService: true, error: null });

        try {
          const cancelledService = await firstValueFrom(serviceService.cancel(service.id));

          patchState(store, {
            service: cancelledService,
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

      setCurrentStep(step: number): void {
        if (step >= 1 && step <= 4) {
          patchState(store, { currentStep: step });
        }
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
