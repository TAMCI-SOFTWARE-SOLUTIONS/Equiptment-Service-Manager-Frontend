import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Ripple } from 'primeng/ripple';
import {AreaFormStore} from '../../model/stores/area-form.store';
import {EquipmentTypeEnum} from '../../../../shared/model';

@Component({
  selector: 'app-area-form',
  standalone: true,
  imports: [CommonModule, FormsModule, Ripple],
  providers: [AreaFormStore],
  templateUrl: './area-form.page.html'
})
export class AreaFormPage implements OnInit, OnDestroy {
  readonly store = inject(AreaFormStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Exponer enum al template
  readonly EquipmentTypeEnum = EquipmentTypeEnum;

  clientId: string | null = null;
  plantId: string | null = null;

  ngOnInit(): void {
    this.clientId = this.route.snapshot.paramMap.get('clientId');
    this.plantId = this.route.snapshot.paramMap.get('plantId');
    const areaId = this.route.snapshot.paramMap.get('areaId');

    if (!this.clientId || !this.plantId) {
      this.router.navigate(['/clients']).then(() => {});
      return;
    }

    if (areaId && areaId !== 'new') {
      this.store.initializeForEdit(this.plantId, areaId);
    } else {
      this.store.initializeForCreate(this.plantId);
    }
  }

  ngOnDestroy(): void {
    this.store.reset();
  }

  onNameChange(value: string): void {
    this.store.setName(value);
  }

  onCodeChange(value: string): void {
    this.store.setCode(value);
  }

  onToggleEquipmentType(type: EquipmentTypeEnum): void {
    this.store.toggleEquipmentType(type);
  }

  isEquipmentTypeSelected(type: EquipmentTypeEnum): boolean {
    return this.store.formData().allowedEquipmentTypes.includes(type);
  }

  getEquipmentTypeLabel(type: EquipmentTypeEnum): string {
    const labels: Record<EquipmentTypeEnum, string> = {
      [EquipmentTypeEnum.CABINET]: 'Gabinete',
      [EquipmentTypeEnum.PANEL]: 'Panel'
    };
    return labels[type];
  }

  getEquipmentTypeDescription(type: EquipmentTypeEnum): string {
    const descriptions: Record<EquipmentTypeEnum, string> = {
      [EquipmentTypeEnum.CABINET]: 'Equipos tipo gabinete eléctrico',
      [EquipmentTypeEnum.PANEL]: 'Equipos tipo panel de control'
    };
    return descriptions[type];
  }

  async onSubmit(): Promise<void> {
    const result = await this.store.submit();

    if (result) {
      this.router.navigate(['/clients', this.clientId, 'plants', this.plantId]).then(() => {});
    }
  }

  onCancel(): void {
    this.store.reset();
    this.router.navigate(['/clients', this.clientId, 'plants', this.plantId]).then(() => {});
  }
}
