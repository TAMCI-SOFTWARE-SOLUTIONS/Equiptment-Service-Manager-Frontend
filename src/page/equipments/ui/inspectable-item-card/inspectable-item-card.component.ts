import {Component, Input, Output, EventEmitter, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ripple } from 'primeng/ripple';
import { firstValueFrom } from 'rxjs';
import {BrandService} from '../../../../entities/brand';
import {ModelService} from '../../../../entities/model';
import {InspectableItemEntity} from '../../../../entities/inspectable-item';

@Component({
  selector: 'app-inspectable-item-card',
  standalone: true,
  imports: [
    CommonModule,
    Ripple
  ],
  templateUrl: './inspectable-item-card.component.html'
})
export class InspectableItemCardComponent implements OnInit {
  private readonly brandService = inject(BrandService);
  private readonly modelService = inject(ModelService);

  @Input({ required: true }) item!: InspectableItemEntity;
  @Input() color: string = 'sky';

  @Output() onEdit = new EventEmitter<string>();
  @Output() onDelete = new EventEmitter<string>();

  // Estado local para nombres de marca y modelo
  brandName: string = '';
  modelName: string = '';
  isLoadingDetails: boolean = false;

  ngOnInit(): void {
    this.loadBrandAndModel().then();
  }

  /**
   * Cargar nombres de marca y modelo
   */
  private async loadBrandAndModel(): Promise<void> {
    this.isLoadingDetails = true;

    try {
      // Cargar marca y modelo en paralelo
      const [brand, model] = await Promise.all([
        firstValueFrom(this.brandService.getById(this.item.brandId)),
        firstValueFrom(this.modelService.getById(this.item.modelId))
      ]);

      this.brandName = brand.name;
      this.modelName = model.name;

    } catch (error) {
      console.error('❌ Error loading brand/model:', error);
      this.brandName = 'Error al cargar';
      this.modelName = 'Error al cargar';
    } finally {
      this.isLoadingDetails = false;
    }
  }

  onEditClick(): void {
    this.onEdit.emit(this.item.id);
  }

  onDeleteClick(): void {
    this.onDelete.emit(this.item.id);
  }

  getColorClasses(): { bg: string; text: string; border: string } {
    if (this.color === 'cyan') {
      return {
        bg: 'bg-cyan-100',
        text: 'text-cyan-700',
        border: 'border-cyan-300'
      };
    }
    // Default: Sky
    return {
      bg: 'bg-sky-100',
      text: 'text-sky-700',
      border: 'border-sky-300'
    };
  }
}
