import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {RippleModule} from 'primeng/ripple';
import {ClientCardComponent} from '../../../../entities/client/ui/client-card/client-card.component';
import {ProjectCardComponent} from '../../../../entities/project/ui/project-card/project-card.component';
import {ContextHeroComponent} from '../context-hero/context-hero.component';
import {SuccessModalComponent} from '../success-modal/success-modal.component';
import {SelectContextStep, SelectContextStore} from '../../model/stores/select-context.store';
import {ClientEntity} from '../../../../entities/client/model';
import {ProjectEntity} from '../../../../entities/project/model/project.entity';

@Component({
  selector: 'app-select-context',
  standalone: true,
  imports: [
    CommonModule,
    RippleModule,
    ClientCardComponent,
    ProjectCardComponent,
    ContextHeroComponent,
    SuccessModalComponent
  ],
  providers: [SelectContextStore],
  templateUrl: './select-context.page.html'
})
export class SelectContextPage implements OnInit {
  readonly store = inject(SelectContextStore);
  private readonly router = inject(Router);

  readonly SelectContextStep = SelectContextStep;

  showSuccessModal = false;

  async ngOnInit(): Promise<void> {
    await this.store.loadClients();
  }

  onClientSelect(client: ClientEntity): void {
    this.store.selectClient(client);
    this.store.loadProjects();
  }

  onProjectSelect(project: ProjectEntity): void {
    this.store.selectProject(project);
  }

  onMobileBack(): void {
    this.store.goToClientStep();
  }

  onFinish(): void {
    this.store.finish();
    this.showSuccessModal = true;
  }

  onCancel(): void {
    this.router.navigate(['/']).then();
  }

  onRetryClients(): void {
    this.store.loadClients();
  }

  onRetryProjects(): void {
    this.store.loadProjects();
  }

  navigateToDashboard(): void {
    this.showSuccessModal = false;
    this.router.navigate(['/']).then();
  }

  navigateToCreateService(): void {
    this.showSuccessModal = false;
    this.router.navigate(['/services/new']).then();
  }
}
