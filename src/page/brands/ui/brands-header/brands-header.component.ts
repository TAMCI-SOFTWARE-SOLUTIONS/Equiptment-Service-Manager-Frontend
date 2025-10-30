import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Ripple } from 'primeng/ripple';

@Component({
  selector: 'app-brands-header',
  standalone: true,
  imports: [CommonModule, FormsModule, Ripple],
  templateUrl: './brands-header.component.html'
})
export class BrandsHeaderComponent {
  @Input() totalCount = 0;
  @Input() searchQuery = '';
  @Input() isLoading = false;

  @Output() searchChange = new EventEmitter<string>();
  @Output() clearSearch = new EventEmitter<void>();
  @Output() refresh = new EventEmitter<void>();
  @Output() showHelp = new EventEmitter<void>();

  onSearchInput(value: string): void {
    this.searchChange.emit(value);
  }

  onClearSearch(): void {
    this.clearSearch.emit();
  }

  onRefresh(): void {
    this.refresh.emit();
  }

  onShowHelp(): void {
    this.showHelp.emit();
  }
}
