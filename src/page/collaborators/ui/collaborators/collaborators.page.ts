import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Ripple } from 'primeng/ripple';
import {CollaboratorsTableComponent} from '../collaborators-table/collaborators-table.component';
import {CollaboratorsStore} from '../../model/store/collaborators.store';
import {CollaboratorsCardsComponent} from '../collaborators-cards/collaborators-cards.component';
import {CollaboratorsFiltersComponent} from '../collaborators-filters/collaborators-filters.component';

@Component({
  selector: 'app-collaborators',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CollaboratorsTableComponent,
    CollaboratorsCardsComponent,
    CollaboratorsFiltersComponent,
    Ripple
  ],
  providers: [CollaboratorsStore],
  templateUrl: './collaborators.page.html'
})
export class CollaboratorsPage implements OnInit {
  readonly router = inject(Router);
  readonly store = inject(CollaboratorsStore);

  // Mobile filters drawer
  showFiltersDrawer = signal(false);

  ngOnInit(): void {
    this.loadCollaborators();
  }

  async loadCollaborators(): Promise<void> {
    await this.store.loadCollaborators();
  }

  onViewCollaborator(id: string): void {
    this.router.navigate(['/collaborators', id]);
  }

  onCreateCollaborator(): void {
    this.router.navigate(['/collaborators/new']);
  }

  openFilters(): void {
    this.showFiltersDrawer.set(true);
  }

  onFiltersVisibleChange(visible: boolean): void {
    this.showFiltersDrawer.set(visible);
  }
}
