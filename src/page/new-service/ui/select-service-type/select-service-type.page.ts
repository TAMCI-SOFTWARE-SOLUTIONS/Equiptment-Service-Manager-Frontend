import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { ContextStore } from '../../../../shared/model/context.store';
import {Ripple} from 'primeng/ripple';

enum ServiceTypeEnum {
  MAINTENANCE = 'MAINTENANCE',
  INSPECTION = 'INSPECTION',
  RAISE_OBSERVATION = 'RAISE_OBSERVATION'
}

interface ServiceType {
  id: ServiceTypeEnum;
  name: string;
  description: string;
  icon: string;
  imageSrc: string;
}

@Component({
  selector: 'app-select-service-type',
  imports: [Ripple],
  templateUrl: './select-service-type.page.html',
  standalone: true
})
export class SelectServiceTypePage {
  readonly router = inject(Router);
  readonly contextStore = inject(ContextStore);
  private location = inject(Location);

  serviceSelected = signal<ServiceTypeEnum | null>(null);
  isServiceSelected = computed(() => this.serviceSelected() !== null);

  readonly services: ServiceType[] = [
    {
      id: ServiceTypeEnum.MAINTENANCE,
      name: 'Mantenimiento',
      description: 'Servicios de mantenimiento preventivo y correctivo para asegurar el correcto funcionamiento',
      icon: 'pi-wrench',
      imageSrc: '/assets/images/mantenimiento.jpg'
    },
    {
      id: ServiceTypeEnum.INSPECTION,
      name: 'Inspección',
      description: 'Evaluación técnica del estado y desempeño de equipos e instalaciones',
      icon: 'pi-search',
      imageSrc: '/assets/images/inspeccion.jpg'
    },
    {
      id: ServiceTypeEnum.RAISE_OBSERVATION,
      name: 'Levantamiento de Observaciones',
      description: 'Registro y gestión de observaciones técnicas y correctivas',
      icon: 'pi-file-edit',
      imageSrc: '/assets/images/levantamiento-observacion.jpg'
    }
  ];

  selectService(serviceType: ServiceTypeEnum): void {
    this.serviceSelected.set(serviceType);
  }

  goBack(): void {
    this.location.back();
  }

  navigateToEquipment(): void {
    if (!this.serviceSelected()) return;

    // Guardar el tipo de servicio en sessionStorage para el siguiente paso
    sessionStorage.setItem('selectedServiceType', this.serviceSelected()!);

    // Navegar al paso 2: selección de equipo
    this.router.navigate(['/services/new/equipment']);
  }
}
