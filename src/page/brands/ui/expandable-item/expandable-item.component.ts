import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Ripple } from 'primeng/ripple';

export interface ExpandableItemConfig {
  id: string;
  name: string;
  icon: string;
  iconColor: string;
  iconBg?: string; // ← NUEVO: background personalizado del icono
  badge: string;
  type: 'brand' | 'model';
}

export interface SaveEvent {
  id: string;
  name: string;
}

@Component({
  selector: 'app-expandable-item',
  standalone: true,
  imports: [CommonModule, FormsModule, Ripple],
  templateUrl: './expandable-item.component.html'
})
export class ExpandableItemComponent {
  @Input({ required: true }) config!: ExpandableItemConfig;
  @Input() isExpanded = false;
  @Input() isEditing = false;
  @Input() isLoading = false;
  @Input() editValue = '';

  @Output() toggle = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() save = new EventEmitter<SaveEvent>();
  @Output() cancel = new EventEmitter<void>();
  @Output() editValueChange = new EventEmitter<string>();

  localEditValue = '';

  ngOnInit(): void {
    this.localEditValue = this.editValue || this.config.name;
  }

  ngOnChanges(): void {
    if (this.isEditing && this.editValue) {
      this.localEditValue = this.editValue;
      setTimeout(() => {
        const input = document.querySelector<HTMLInputElement>(`#edit-${this.config.type}-input-${this.config.id}`);
        input?.focus();
        input?.select();
      }, 100);
    }
  }

  onToggle(): void {
    if (!this.isEditing) {
      this.toggle.emit();
    }
  }

  onEdit(): void {
    this.edit.emit();
  }

  onSave(): void {
    const trimmed = this.localEditValue.trim();
    if (trimmed.length >= 2 && trimmed.length <= 50) {
      this.save.emit({ id: this.config.id, name: trimmed });
    }
  }

  onCancel(): void {
    this.localEditValue = this.config.name;
    this.cancel.emit();
  }

  onInputChange(value: string): void {
    this.localEditValue = value;
    this.editValueChange.emit(value);
  }

  getIconBgClass(): string {
    return this.config.iconBg || 'bg-sky-100'; // Default si no se especifica
  }

  get isValid(): boolean {
    const trimmed = this.localEditValue.trim();
    return trimmed.length >= 2 && trimmed.length <= 50;
  }

  get showMinError(): boolean {
    return this.localEditValue.trim().length > 0 && this.localEditValue.trim().length < 2;
  }

  get showMaxError(): boolean {
    return this.localEditValue.trim().length > 50;
  }
}
