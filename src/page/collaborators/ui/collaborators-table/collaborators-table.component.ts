import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ripple } from 'primeng/ripple';
import {CollaboratorsStore} from '../../model/store/collaborators.store';
import {GenderEnum} from '../../../../entities/profile';

@Component({
  selector: 'app-collaborators-table',
  standalone: true,
  imports: [CommonModule, Ripple],
  templateUrl: './collaborators-table.component.html'
})
export class CollaboratorsTableComponent {
  readonly store = inject(CollaboratorsStore);

  // Events
  readonly viewCollaborator = output<string>();

  onViewCollaborator(id: string): void {
    this.viewCollaborator.emit(id);
  }

  onSort(column: 'name' | 'email' | 'document'): void {
    this.store.setSorting(column);
  }

  getSortIcon(column: 'name' | 'email' | 'document'): string {
    if (this.store.sortBy() !== column) {
      return 'pi-sort-alt';
    }
    return this.store.sortOrder() === 'asc' ? 'pi-sort-amount-up' : 'pi-sort-amount-down';
  }

  protected readonly GenderEnum = GenderEnum;
}
