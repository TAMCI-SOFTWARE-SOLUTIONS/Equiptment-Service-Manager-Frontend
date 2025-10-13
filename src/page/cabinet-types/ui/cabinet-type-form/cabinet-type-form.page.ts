import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CabinetTypeEntity } from '../../../../entities/cabinet-type/model';
import { CabinetTypeService } from '../../../../entities/cabinet-type/api/cabinet-type.service';

@Component({
  selector: 'app-cabinet-type-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cabinet-type-form.page.html',
  styleUrl: './cabinet-type-form.page.css'
})
export class CabinetTypeFormPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly cabinetTypeService = inject(CabinetTypeService);

  readonly isEditing = signal(false);
  readonly isLoading = signal(false);
  readonly cabinetTypeId = signal<string | null>(null);

  readonly form: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(2)]],
    name: ['', [Validators.required, Validators.minLength(3)]]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditing.set(true);
      this.cabinetTypeId.set(id);
      this.loadCabinetType(id);
    }
  }

  private loadCabinetType(id: string): void {
    this.isLoading.set(true);
    this.cabinetTypeService.getById(id).subscribe({
      next: (cabinetType) => {
        this.form.patchValue(cabinetType);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading cabinet type:', error);
        this.isLoading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.isLoading.set(true);
      const cabinetTypeData: CabinetTypeEntity = {
        id: this.cabinetTypeId() || '',
        ...this.form.value
      };

      const operation = this.isEditing()
        ? this.cabinetTypeService.update(this.cabinetTypeId()!, cabinetTypeData)
        : this.cabinetTypeService.create(cabinetTypeData);

      operation.subscribe({
        next: () => {
          this.router.navigate(['/cabinet-types']);
        },
        error: (error) => {
          console.error('Error saving cabinet type:', error);
          this.isLoading.set(false);
        }
      });
    } else {
      this.form.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/cabinet-types']);
  }
}
