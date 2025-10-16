import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ClientDetailStore } from '../../../clients/model/client-detail.store';
import { Ripple } from 'primeng/ripple';
import {PlantFormStore} from '../../model/stores/plant-form.store';

@Component({
  selector: 'app-plant-form',
  standalone: true,
  imports: [CommonModule, FormsModule, Ripple],
  providers: [PlantFormStore, ClientDetailStore],
  templateUrl: './plant-form.page.html'
})
export class PlantFormPage implements OnInit, OnDestroy {
  readonly store = inject(PlantFormStore);
  readonly clientDetailStore = inject(ClientDetailStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  clientId: string | null = null;

  ngOnInit(): void {
    this.clientId = this.route.snapshot.paramMap.get('clientId');
    const plantId = this.route.snapshot.paramMap.get('plantId');

    if (!this.clientId) {
      this.router.navigate(['/clients']).then(() => {});
      return;
    }

    if (plantId && plantId !== 'new') {
      this.store.initializeForEdit(this.clientId, plantId);
    } else {
      this.store.initializeForCreate(this.clientId);
    }
  }

  ngOnDestroy(): void {
    this.store.reset();
  }

  onNameChange(value: string): void {
    this.store.setName(value);
  }

  async onSubmit(): Promise<void> {
    const result = await this.store.submit();

    if (result) {
      if (this.store.isEditing()) {
        this.clientDetailStore.updatePlant(result);
      } else {
        this.clientDetailStore.addPlant(result);
      }

      this.router.navigate(['/clients', this.clientId]).then(() => {});
    }
  }

  onCancel(): void {
    this.store.reset();
    this.router.navigate(['/clients', this.clientId]).then(() => {});
  }
}
