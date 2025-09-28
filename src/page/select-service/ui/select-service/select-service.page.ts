import {Component, computed, inject, OnInit, Signal, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ServiceTypeEnum} from '../../../../shared/model';
import {Location, NgClass} from '@angular/common';
import {Button} from 'primeng/button';

interface Service {
  id: ServiceTypeEnum;
  name: string;
  description: string;
  imageSrc: string;
}

@Component({
  selector: 'app-select-service',
  imports: [
    NgClass,
    Button
  ],
  templateUrl: './select-service.page.html',
  standalone: true,
  styleUrl: './select-service.page.css'
})
export class SelectServicePage implements OnInit{
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private location = inject(Location);

  projectId: string | null = null;
  serviceSelected = signal<ServiceTypeEnum | null> ( null);
  isServiceSelected = computed<boolean>(() => this.serviceSelected() !== null);
  readonly services: Service[] = [
    { id: ServiceTypeEnum.MAINTENANCE, name: 'Mantenimiento', description: 'Servicios de mantenimiento para asegurar el correcto funcionamiento de sus sistemas.', imageSrc: '/assets/images/mantenimiento.jpg' },
    { id: ServiceTypeEnum.INSPECTION, name: 'Inspección', description: 'Servicios de inspección para evaluar el estado y desempeño de sus equipos.', imageSrc: '/assets/images/inspeccion.jpg' },
    { id: ServiceTypeEnum.RAISE_OBSERVATION, name: 'Levantamiento de Observaciones', description: 'Servicios para reportar y gestionar observaciones técnicas.', imageSrc:'/assets/images/levantamiento-observacion.jpg' },
  ]

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('projectId');
  }

  protected selectService(serviceTypeEnum: ServiceTypeEnum) {
    this.serviceSelected.set(serviceTypeEnum);
  }

  protected goBack() {
    this.location.back();
  }

  protected navigateToEquipments() {
    if (!this.projectId || !this.serviceSelected()) {
      return;
    }
    this.router.navigate(['/projects', this.projectId, 'equipments'], {
      queryParams: { service: this.serviceSelected()?.toLocaleLowerCase() }
    }).then(() => {});
  }
}
