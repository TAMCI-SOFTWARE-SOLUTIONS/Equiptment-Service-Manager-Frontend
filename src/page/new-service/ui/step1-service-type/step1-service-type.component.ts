import { Component, inject } from '@angular/core';
import {ServiceTypeEnum} from '../../../../shared/model';
import {CreateServiceStore} from '../../model/store/create-service.store';

interface ServiceType {
  id: ServiceTypeEnum;
  name: string;
  description: string;
  icon: string;
  imageSrc: string;
}

@Component({
  selector: 'app-step1-service-type',
  standalone: true,
  imports: [],
  template: `
    <div class="space-y-6">

      <div class="text-center">
        <h2 class="text-xl font-semibold text-gray-900">
          Selecciona un Tipo de Servicio
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Elige el tipo de servicio que deseas crear
        </p>
      </div>

      <!-- Service Type Cards -->
      <div class="grid gap-6 md:grid-cols-3">
        @for (service of services; track service.id) {
          <article
            (click)="selectService(service.id)"
            class="group relative cursor-pointer overflow-hidden rounded-xl transition-all duration-300"
            [class.ring-4]="isSelected(service.id)"
            [class.ring-sky-500]="isSelected(service.id)"
            [class.shadow-2xl]="isSelected(service.id)"
            [class.-translate-y-2]="isSelected(service.id)"
            [class.shadow-lg]="!isSelected(service.id)"
            [class.hover:-translate-y-1]="!isSelected(service.id)"
            [class.hover:shadow-xl]="!isSelected(service.id)">

            <!-- Background Image with Overlay -->
            <div class="relative h-64">
              <div
                class="absolute inset-0 bg-cover bg-center"
                [style.background-image]="'url(' + service.imageSrc + ')'">
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20"></div>
              </div>

              <!-- Selected Badge -->
              @if (isSelected(service.id)) {
                <div class="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-sky-500 shadow-lg animate-in zoom-in duration-300">
                  <i class="pi pi-check text-xl font-bold text-white"></i>
                </div>
              }

              <!-- Content -->
              <div class="relative flex h-full flex-col justify-end p-6">

                <!-- Icon -->
                <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full transition-all duration-300"
                     [class.bg-sky-500]="isSelected(service.id)"
                     [class.shadow-lg]="isSelected(service.id)"
                     [class.backdrop-blur-sm]="!isSelected(service.id)">
                  <i [class]="'pi ' + service.icon + ' text-3xl text-white'"></i>
                </div>

                <!-- Text -->
                <h3 class="text-2xl font-bold text-white">
                  {{ service.name }}
                </h3>
                <p class="mt-2 text-sm leading-relaxed text-white/90">
                  {{ service.description }}
                </p>

              </div>
            </div>

          </article>
        }
      </div>

    </div>
  `
})
export class Step1ServiceTypeComponent {
  readonly store = inject(CreateServiceStore);

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
    this.store.setServiceType(serviceType);
  }

  isSelected(serviceType: ServiceTypeEnum): boolean {
    return this.store.formData().serviceType === serviceType;
  }
}
