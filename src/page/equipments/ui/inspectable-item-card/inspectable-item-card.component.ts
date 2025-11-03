import {Component, Input, Output, EventEmitter, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ripple } from 'primeng/ripple';
import { firstValueFrom } from 'rxjs';
import {BrandService} from '../../../../entities/brand';
import {ModelService} from '../../../../entities/model';
import {InspectableItemEntity} from '../../../../entities/inspectable-item';
import {DescriptionService} from '../../../../entities/description/api/services/description.service';

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
  private readonly descriptionService = inject(DescriptionService);

  @Input({ required: true }) item!: InspectableItemEntity;
  @Input() color: string = 'sky';

  @Output() onEdit = new EventEmitter<string>();
  @Output() onDelete = new EventEmitter<string>();

  // Estado local para nombres
  brandName: string = '';
  modelName: string = '';
  descriptionName: string = ''; // 🆕
  isLoadingDetails: boolean = false;

  ngOnInit(): void {
    this.loadItemDetails().then();
  }

  /**
   * 🔧 Cargar nombres de marca, modelo y descripción
   */
  private async loadItemDetails(): Promise<void> {
    this.isLoadingDetails = true;

    try {
      // Cargar brand, model y description en paralelo
      const [brand, model, description] = await Promise.all([
        firstValueFrom(this.brandService.getById(this.item.brandId)),
        firstValueFrom(this.modelService.getById(this.item.modelId)),
        firstValueFrom(this.descriptionService.getById(this.item.descriptionId)) // 🆕
      ]);

      this.brandName = brand.name;
      this.modelName = model.name;
      this.descriptionName = description.name; // 🆕

    } catch (error) {
      console.error('❌ Error loading item details:', error);
      this.brandName = 'Error al cargar';
      this.modelName = 'Error al cargar';
      this.descriptionName = 'Error al cargar'; // 🆕
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

  getColorClasses(): { bg: string; text: string; border: string; bgHover: string } {
    if (this.color === 'cyan') {
      return {
        bg: 'bg-cyan-50',
        text: 'text-cyan-700',
        border: 'border-cyan-200',
        bgHover: 'hover:bg-cyan-100'
      };
    }
    // Default: Sky
    return {
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      border: 'border-sky-200',
      bgHover: 'hover:bg-sky-100'
    };
  }
}
