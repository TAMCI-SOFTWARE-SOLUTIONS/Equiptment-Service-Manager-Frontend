import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Ripple } from 'primeng/ripple';
import {LocationFormStore} from '../../model/store/location-form.store';

@Component({
  selector: 'app-location-form',
  standalone: true,
  imports: [CommonModule, FormsModule, Ripple],
  providers: [LocationFormStore],
  templateUrl: './location-form.page.html'
})
export class LocationFormPage implements OnInit, OnDestroy {
  readonly store = inject(LocationFormStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  clientId: string | null = null;
  plantId: string | null = null;
  areaId: string | null = null;

  ngOnInit(): void {
    this.clientId = this.route.snapshot.paramMap.get('clientId');
    this.plantId = this.route.snapshot.paramMap.get('plantId');
    this.areaId = this.route.snapshot.paramMap.get('areaId');
    const locationId = this.route.snapshot.paramMap.get('locationId');

    if (!this.clientId || !this.plantId || !this.areaId) {
      this.router.navigate(['/clients']).then(()=>{});
      return;
    }

    if (locationId && locationId !== 'new') {
      this.store.initializeForEdit(this.areaId, locationId);
    } else {
      this.store.initializeForCreate(this.areaId);
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

  async onSubmit(): Promise<void> {
    const result = await this.store.submit();

    if (result) {
      this.router.navigate(['/clients', this.clientId, 'plants', this.plantId, 'areas', this.areaId]).then(()=>{});
    }
  }

  onCancel(): void {
    this.store.reset();
    this.router.navigate(['/clients', this.clientId, 'plants', this.plantId, 'areas', this.areaId]).then(()=>{});
  }
}
