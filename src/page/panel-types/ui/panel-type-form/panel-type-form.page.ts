import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Ripple } from 'primeng/ripple';
import {PanelTypeFormStore} from '../../model/stores/panel-type-form.store';
import {PanelTypesStore} from '../../model/stores/panel-types.store';

@Component({
  selector: 'app-panel-type-form',
  standalone: true,
  imports: [CommonModule, FormsModule, Ripple],
  providers: [PanelTypeFormStore],
  templateUrl: './panel-type-form.page.html'
})
export class PanelTypeFormPage implements OnInit, OnDestroy {
  readonly store = inject(PanelTypeFormStore);
  readonly panelTypesStore = inject(PanelTypesStore);
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
      // Actualizar el store global de panel types
      if (this.store.isEditing()) {
        this.panelTypesStore.updatePanelType(result);
      } else {
        this.panelTypesStore.addPanelType(result);
      }

      // Navegar de vuelta a la lista
      this.router.navigate(['/panel-types']).then(() => {});
    }
  }

  onCancel(): void {
    this.store.reset();
    this.router.navigate(['/panel-types']).then(() => {});
  }
}
