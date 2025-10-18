import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {SelectContextStep, SelectContextStore} from '../../../../shared/model/select-context.store';
import {SelectClientStepComponent} from '../select-client-step/select-client-step.component';
import {SelectProjectStepComponent} from '../select-project-step/select-project-step.component';

@Component({
  selector: 'app-select-context',
  imports: [
    SelectClientStepComponent,
    SelectProjectStepComponent
  ],
  standalone: true,
  providers: [SelectContextStore],
  templateUrl: './select-context.page.html'
})
export class SelectContextPage implements OnInit, OnDestroy {
  readonly store = inject(SelectContextStore);
  private readonly router = inject(Router);

  // Exponer enum para el template
  readonly SelectContextStep = SelectContextStep;

  ngOnInit(): void {
    // Cargar clientes al iniciar
    this.store.loadClients();
  }

  ngOnDestroy(): void {
    this.store.reset();
  }

  async onNext(): Promise<void> {
    await this.store.nextStep();
  }

  onPrevious(): void {
    this.store.previousStep();
  }

  onFinish(): void {
    this.store.finish();

    // Navegar al dashboard
    this.router.navigate(['/dashboard']).then(() => {});
  }

  onCancel(): void {
    this.router.navigate(['/']).then(() => {});
  }
}
