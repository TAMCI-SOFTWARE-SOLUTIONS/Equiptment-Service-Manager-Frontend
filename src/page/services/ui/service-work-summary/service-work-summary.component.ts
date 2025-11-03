import {Component, computed, input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {EquipmentServiceEntity, ServiceStatusEnum} from '../../../../entities/equipment-service';
import {CabinetEntity} from '../../../../entities/cabinet/model';
import {PanelEntity} from '../../../../entities/panel/model';
import {SupervisorEntity} from '../../../../entities/supervisor';
import {ProfileEntity} from '../../../../entities/profile';
import {ItemInspectionWithDetails} from '../../model/interfaces/item-inspection-with-details.interface';
import {EvidenceFile} from '../../model/interfaces/evidence-file.interface';
import {InspectableItemTypeEnum} from '../../../../shared/model/enums';
import {ItemConditionEnum} from '../../../../shared/model/enums/item-condition.enum';
import {CriticalityEnum} from '../../../../shared/model/enums/criticality.enum';
import {ServiceTypeEnum} from '../../../../shared/model';
import {DurationUtils} from '../../../../shared/utils/DurationUtils';
import {DateUtils} from '../../../../shared/utils/DateUtils';

interface InspectionSummary {
  total: number;
  completed: number;
  operational: number;
  warning: number;
  critical: number;
  byType: Map<InspectableItemTypeEnum, {
    total: number;
    completed: number;
    percentage: number;
  }>;
}

interface EvidenceSummary {
  videoStart: boolean;
  videoEnd: boolean;
  startPhotos: number;
  midPhotos: number;
  endPhotos: number;
  report: boolean;
  isComplete: boolean;
}

interface ValidationItem {
  label: string;
  isValid: boolean;
  message: string;
}

@Component({
  selector: 'app-service-work-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-work-summary.component.html'
})
export class ServiceWorkSummaryComponent {
  readonly service = input.required<EquipmentServiceEntity>();
  readonly equipment = input.required<CabinetEntity | PanelEntity>();
  readonly supervisor = input.required<SupervisorEntity>();
  readonly operator = input.required<ProfileEntity>();
  readonly itemInspections = input<ItemInspectionWithDetails[]>([]);
  readonly evidenceFiles = input.required<{
    videoStart: EvidenceFile | null;
    videoEnd: EvidenceFile | null;
    startPhotos: EvidenceFile[];
    midPhotos: EvidenceFile[];
    endPhotos: EvidenceFile[];
    report: EvidenceFile | null;
  }>();

  readonly operatorFullName = computed<string>(() => {
    const operator = this.operator();
    if (!operator) return 'Sin asignar';

    return [
      operator.names,
      operator.firstSurname,
      operator.secondSurname
    ]
      .filter(Boolean)
      .join(' ');
  });

  readonly inspectionSummary = computed<InspectionSummary>(() => {
    const items = this.itemInspections();

    // Calcular por tipo
    const byType = new Map<InspectableItemTypeEnum, any>();
    const types = [
      InspectableItemTypeEnum.COMMUNICATION,
      InspectableItemTypeEnum.POWER_SUPPLY,
      InspectableItemTypeEnum.POWER_120VAC,
      InspectableItemTypeEnum.ORDER_AND_CLEANLINESS,
      InspectableItemTypeEnum.OTHERS
    ];

    types.forEach(type => {
      const typeItems = items.filter(i => i.type === type);
      const completed = typeItems.filter(i =>
        i.condition !== null &&
        (!this.requiresCriticality(i.condition) || i.criticality !== null)
      ).length;

      byType.set(type, {
        total: typeItems.length,
        completed,
        percentage: typeItems.length > 0 ? Math.round((completed / typeItems.length) * 100) : 0
      });
    });

    // ✅ Operativos (Verde)
    const operational = items.filter(i =>
      i.condition === ItemConditionEnum.OPERATIONAL ||
      i.condition === ItemConditionEnum.OK
    ).length;

    // ⚠️ Advertencias (Amarillo)
    const warning = items.filter(i =>
      i.condition === ItemConditionEnum.MISSING ||
      (this.requiresCriticality(i.condition) && i.criticality === CriticalityEnum.NOT_CRITICAL)
    ).length;

    // ❌ Críticos (Rojo)
    const critical = items.filter(i =>
      this.requiresCriticality(i.condition) && i.criticality === CriticalityEnum.CRITICAL
    ).length;

    // Total completados
    const completed = items.filter(i =>
      i.condition !== null &&
      (!this.requiresCriticality(i.condition) || i.criticality !== null)
    ).length;

    return {
      total: items.length,
      completed,
      operational,
      warning,
      critical,
      byType
    };
  });

  readonly evidenceSummary = computed<EvidenceSummary>(() => {
    const files = this.evidenceFiles();

    return {
      videoStart: !!files.videoStart,
      videoEnd: !!files.videoEnd,
      startPhotos: files.startPhotos.length,
      midPhotos: files.midPhotos.length,
      endPhotos: files.endPhotos.length,
      report: !!files.report,
      isComplete: !!(
        files.videoStart &&
        files.videoEnd &&
        files.startPhotos.length >= 1 &&
        files.midPhotos.length >= 1 &&
        files.endPhotos.length >= 1
      )
    };
  });

  readonly canComplete = computed(() => {
    const inspection = this.inspectionSummary();
    const evidence = this.evidenceSummary();

    return inspection.completed === inspection.total && evidence.isComplete;
  });

  readonly validationItems = computed<ValidationItem[]>(() => {
    const inspection = this.inspectionSummary();
    const evidence = this.evidenceSummary();

    return [
      {
        label: 'Inspecciones completadas',
        isValid: inspection.completed === inspection.total,
        message: inspection.completed === inspection.total
          ? `Todas las inspecciones completadas (${inspection.completed}/${inspection.total})`
          : `Faltan ${inspection.total - inspection.completed} inspecciones por completar`
      },
      {
        label: 'Videos cargados',
        isValid: evidence.videoStart && evidence.videoEnd,
        message: evidence.videoStart && evidence.videoEnd
          ? 'Videos de inicio y fin cargados'
          : !evidence.videoStart && !evidence.videoEnd
            ? 'Faltan videos de inicio y fin'
            : !evidence.videoStart
              ? 'Falta video de inicio'
              : 'Falta video de fin'
      },
      {
        label: 'Fotos de inicio',
        isValid: evidence.startPhotos >= 1,
        message: evidence.startPhotos >= 1
          ? `${evidence.startPhotos} foto(s) cargada(s)`
          : 'Falta al menos 1 foto de inicio'
      },
      {
        label: 'Fotos de proceso',
        isValid: evidence.midPhotos >= 1,
        message: evidence.midPhotos >= 1
          ? `${evidence.midPhotos} foto(s) cargada(s)`
          : 'Falta al menos 1 foto de proceso'
      },
      {
        label: 'Fotos de fin',
        isValid: evidence.endPhotos >= 1,
        message: evidence.endPhotos >= 1
          ? `${evidence.endPhotos} foto(s) cargada(s)`
          : 'Falta al menos 1 foto de fin'
      },
      {
        label: 'Reporte PDF',
        isValid: true, // Opcional
        message: evidence.report ? 'Reporte PDF cargado' : 'Opcional'
      }
    ];
  });

  getServiceTypeLabel(type: ServiceTypeEnum): string {
    const labels: Record<ServiceTypeEnum, string> = {
      [ServiceTypeEnum.MAINTENANCE]: 'Mantenimiento',
      [ServiceTypeEnum.INSPECTION]: 'Inspección',
      [ServiceTypeEnum.RAISE_OBSERVATION]: 'Levantamiento de Observaciones'
    };
    return labels[type] || type;
  }

  getServiceStatusLabel(status: ServiceStatusEnum): string {
    const labels: Record<ServiceStatusEnum, string> = {
      [ServiceStatusEnum.CREATED]: 'Creado',
      [ServiceStatusEnum.IN_PROGRESS]: 'En Progreso',
      [ServiceStatusEnum.COMPLETED]: 'Completado',
      [ServiceStatusEnum.CANCELLED]: 'Cancelado'
    };
    return labels[status] || status;
  }

  getServiceStatusColor(status: ServiceStatusEnum): string {
    const colors: Record<ServiceStatusEnum, string> = {
      [ServiceStatusEnum.CREATED]: 'bg-gray-100 text-gray-700 border-gray-300',
      [ServiceStatusEnum.IN_PROGRESS]: 'bg-blue-100 text-blue-700 border-blue-300',
      [ServiceStatusEnum.COMPLETED]: 'bg-green-100 text-green-700 border-green-300',
      [ServiceStatusEnum.CANCELLED]: 'bg-red-100 text-red-700 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  }

  getTypeLabel(type: InspectableItemTypeEnum): string {
    const labels: Record<InspectableItemTypeEnum, string> = {
      [InspectableItemTypeEnum.COMMUNICATION]: 'Comunicación',
      [InspectableItemTypeEnum.POWER_SUPPLY]: 'Fuentes de Poder',
      [InspectableItemTypeEnum.STATE]: 'Estado',
      [InspectableItemTypeEnum.POWER_120VAC]: '120 VAC',
      [InspectableItemTypeEnum.ORDER_AND_CLEANLINESS]: 'Orden y Limpieza',
      [InspectableItemTypeEnum.OTHERS]: 'Otros'
    };
    return labels[type] || type;
  }

  getTypeIcon(type: InspectableItemTypeEnum): string {
    const icons: Record<InspectableItemTypeEnum, string> = {
      [InspectableItemTypeEnum.COMMUNICATION]: 'pi-wifi',
      [InspectableItemTypeEnum.POWER_SUPPLY]: 'pi-bolt',
      [InspectableItemTypeEnum.STATE]: 'pi-info-circle',
      [InspectableItemTypeEnum.POWER_120VAC]: 'pi-flash',
      [InspectableItemTypeEnum.ORDER_AND_CLEANLINESS]: 'pi-check-square',
      [InspectableItemTypeEnum.OTHERS]: 'pi-ellipsis-h'
    };
    return icons[type] || 'pi-circle';
  }

  formatDuration(duration: string | null): string {
    return DurationUtils.formatReadable(duration);
  }

  formatDateTime(date: Date | string | null): string {
    return DateUtils.formatDateTime(date);
  }

  private requiresCriticality(condition: ItemConditionEnum | null): boolean {
    if (!condition) return false;

    return [
      ItemConditionEnum.FAILURE,
      ItemConditionEnum.BAD_STATE,
      ItemConditionEnum.DEFICIENT
    ].includes(condition);
  }

  getTypesWithData(): Array<{ type: InspectableItemTypeEnum; label: string; icon: string; data: { total: number; completed: number; percentage: number }; }> {
    const byType = this.inspectionSummary().byType;

    return [
      InspectableItemTypeEnum.COMMUNICATION,
      InspectableItemTypeEnum.POWER_SUPPLY,
      InspectableItemTypeEnum.POWER_120VAC,
      InspectableItemTypeEnum.ORDER_AND_CLEANLINESS,
      InspectableItemTypeEnum.OTHERS
    ]
      .map(type => ({
        type,
        label: this.getTypeLabel(type),
        icon: this.getTypeIcon(type),
        data: byType.get(type) || { total: 0, completed: 0, percentage: 0 }
      }))
      .filter(item => item.data.total > 0);
  }
}
