import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PanelTypeEntity } from '../../../../entities/panel-type/model';
import { PanelTypeService } from '../../../../entities/panel-type/api';

@Component({
  selector: 'app-panel-type-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './panel-type-form.page.html',
  styleUrl: './panel-type-form.page.css'
})
export class PanelTypeFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly panelTypeService = inject(PanelTypeService);

  readonly isEditing = signal(false);
  readonly isLoading = signal(false);
  readonly panelTypeId = signal<string | null>(null);

  readonly form: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(2)]],
    name: ['', [Validators.required, Validators.minLength(3)]]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing.set(true);
      this.panelTypeId.set(id);
      this.loadPanelType(id);
    }
  }

  private loadPanelType(id: string): void {
    this.isLoading.set(true);
    this.panelTypeService.getById(id).subscribe({
      next: (panelType) => {
        this.form.patchValue(panelType);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading panel type:', error);
        this.isLoading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.isLoading.set(true);
      const panelTypeData: PanelTypeEntity = {
        id: this.panelTypeId() || '',
        ...this.form.value
      };

      const operation = this.isEditing()
        ? this.panelTypeService.update(this.panelTypeId()!, panelTypeData)
        : this.panelTypeService.create(panelTypeData);

      operation.subscribe({
        next: () => {
          this.router.navigate(['/panel-types']);
        },
        error: (error) => {
          console.error('Error saving panel type:', error);
          this.isLoading.set(false);
        }
      });
    } else {
      this.form.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/panel-types']);
  }
}
