import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Ripple } from 'primeng/ripple';
import {CabinetTypeFormStore} from '../../modal/stores/cabinet-type-form.store';
import {CabinetTypesStore} from '../../modal/stores/cabinet-types.store';

@Component({
  selector: 'app-cabinet-type-form',
  standalone: true,
  imports: [CommonModule, FormsModule, Ripple],
  providers: [CabinetTypeFormStore],
  templateUrl: './cabinet-type-form.page.html'
})
export class CabinetTypeFormPage implements OnInit, OnDestroy {
  readonly store = inject(CabinetTypeFormStore);
  readonly cabinetTypesStore = inject(CabinetTypesStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      // Modo edición
      this.store.initializeForEdit(id);
    } else {
      // Modo creación
      this.store.initializeForCreate();
    }
  }

  ngOnDestroy(): void {
    this.store.reset();
  }

  onCodeChange(value: string): void {
    this.store.setCode(value);
  }

  onNameChange(value: string): void {
    this.store.setName(value);
  }

  async onSubmit(): Promise<void> {
    const result = await this.store.submit();

    if (result) {
      // Actualizar el store global de cabinet types
      if (this.store.isEditing()) {
        this.cabinetTypesStore.updateCabinetType(result);
      } else {
        this.cabinetTypesStore.addCabinetType(result);
      }

      // Navegar de vuelta a la lista
      this.router.navigate(['/cabinet-types']).then(() => {});
    }
  }

  onCancel(): void {
    this.store.reset();
    this.router.navigate(['/cabinet-types']).then(() => {});
  }
}
