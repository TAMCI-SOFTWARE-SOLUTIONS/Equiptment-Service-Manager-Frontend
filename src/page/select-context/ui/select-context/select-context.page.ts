import {Component, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {MessageService} from 'primeng/api';
import {ToastModule} from 'primeng/toast';
import {RippleModule} from 'primeng/ripple';
import {StepIndicatorComponent} from '../step-indicator/step-indicator.component';
import {ClientCardComponent} from '../client-card/client-card.component';
import {ProjectCardComponent} from '../project-card/project-card.component';
import {SelectContextStep, SelectContextStore} from '../../../../shared/model/select-context.store';
import {ProjectEntity} from '../../../../entities/project/model/project.entity';
import {ClientEntity} from '../../../../entities/client/model';
import {Dialog} from 'primeng/dialog';

@Component({
  selector: 'app-select-context',
  standalone: true,
  imports: [
    CommonModule,
    StepIndicatorComponent,
    ClientCardComponent,
    ProjectCardComponent,
    ToastModule,
    RippleModule,
    Dialog
  ],
  providers: [
    SelectContextStore,
    MessageService
  ],
  templateUrl: './select-context.page.html'
})
export class SelectContextPage implements OnInit {
  readonly store = inject(SelectContextStore);
  private router = inject(Router);
  private messageService = inject(MessageService);

  readonly SelectContextStep = SelectContextStep;

  showSuccessModal = false;

  ngOnInit(): void {
    this.store.loadClients();
  }

  getStepIcon(step: number): string {
    return step === 1 ? 'pi-building' : 'pi-folder';
  }

  getStepDescription(): string {
    if (this.store.currentStep() === SelectContextStep.SELECT_CLIENT) {
      return 'Elige el cliente con el que deseas trabajar';
    }
    return `Elige el proyecto del cliente ${this.store.selectedClient()?.name || ''}`;
  }

  onClientSelect(client: ClientEntity): void {
    this.store.selectClient(client);
  }

  onProjectSelect(project: ProjectEntity): void {
    this.store.selectProject(project);
  }

  async onNext(): Promise<void> {
    await this.store.nextStep();
  }

  onBack(): void {
    this.store.previousStep();
  }

  onCancel(): void {
    this.router.navigate(['/']).then();
  }

  onFinish(): void {
    this.store.finish();
    this.showSuccessModal = true;
  }

  protected navigateToCreateService(): void {
    this.messageService.clear('context-success');
    this.router.navigate(['/services/new']).then();
  }

  protected navigateToDashboard(): void {
    this.messageService.clear('context-success');
    this.router.navigate(['/']).then();
  }

  onRetry(): void {
    if (this.store.currentStep() === SelectContextStep.SELECT_CLIENT) {
      this.store.loadClients();
    } else {
      this.store.loadProjects();
    }
  }
}
