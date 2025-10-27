import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Ripple } from 'primeng/ripple';
import {Step1ServiceTypeComponent} from '../step1-service-type/step1-service-type.component';
import {Step2EquipmentComponent} from '../step2-equipment/step2-equipment.component';
import {Step3ConfirmationComponent} from '../step3-confirmation/step3-confirmation.component';
import {CreateServiceStore} from '../../model/store/create-service.store';
import {ContextStore} from '../../../../shared/model/context.store';

@Component({
  selector: 'app-create-service',
  standalone: true,
  imports: [
    CommonModule,
    Step1ServiceTypeComponent,
    Step2EquipmentComponent,
    Step3ConfirmationComponent,
    Ripple
  ],
  providers: [CreateServiceStore], // ✅ Store local, NO global
  templateUrl: './create-service.page.html'
})
export class CreateServicePage implements OnInit, OnDestroy {
  readonly router = inject(Router);
  readonly contextStore = inject(ContextStore);
  readonly store = inject(CreateServiceStore);

  ngOnInit(): void {
    // Verificar que hay contexto (cliente y proyecto)
    if (!this.contextStore.hasContext()) {
      console.warn('⚠️ No context available, redirecting to home');
      this.router.navigate(['/']).then();
      return;
    }

    console.log('✅ Context loaded:', {
      client: this.contextStore.client()?.name,
      project: this.contextStore.project()?.name
    });
  }

  ngOnDestroy(): void {
    // Limpiar el store al salir
    this.store.reset();
  }

  // ==================== NAVIGATION ====================

  onNext(): void {
    if (!this.store.canGoNext()) return;

    // Si está en Step 1, inicializar datos antes de avanzar
    if (this.store.currentStep() === 1) {
      this.store.initialize().then(() => {
        this.store.goToNextStep();
      });
    } else {
      this.store.goToNextStep();
    }
  }

  onPrevious(): void {
    this.store.goToPreviousStep();
  }

  onCancel(): void {
    this.store.reset();
    this.router.navigate(['/']).then();
  }

  // ==================== SUBMIT ====================

  async onSubmit(): Promise<void> {
    const serviceId = await this.store.submit();

    if (serviceId) {
      this.router.navigate(['/services', serviceId]).then();
    } else {
      console.error('Error creating service');
    }
  }

  // ==================== STEPPER HELPERS ====================

  goToStep(step: number): void {
    // Solo permitir ir a steps ya completados o el siguiente inmediato
    const currentStep = this.store.currentStep();

    if (step < currentStep) {
      // Puede volver atrás libremente
      this.store.goToStep(step);
    } else if (step === currentStep + 1 && this.store.canGoNext()) {
      // Puede avanzar si el step actual es válido
      this.onNext();
    }
  }

  canAccessStep(step: number): boolean {
    const currentStep = this.store.currentStep();

    // Puede acceder a steps anteriores o al actual
    if (step <= currentStep) return true;

    // Para avanzar, debe haber completado el step actual
    if (step === currentStep + 1) {
      switch (currentStep) {
        case 1: return this.store.isStep1Valid();
        case 2: return this.store.isStep2Valid();
        case 3: return this.store.isStep3Valid();
        default: return false;
      }
    }

    return false;
  }

  isStepCompleted(step: number): boolean {
    const currentStep = this.store.currentStep();

    if (step >= currentStep) return false;

    switch (step) {
      case 1: return this.store.isStep1Valid();
      case 2: return this.store.isStep2Valid();
      case 3: return this.store.isStep3Valid();
      default: return false;
    }
  }

  getStepIcon(step: number): string {
    const icons: Record<number, string> = {
      1: 'pi-file-check',
      2: 'pi-box',
      3: 'pi-list-check'
    };
    return icons[step] || 'pi-circle';
  }

  getStepTitle(step: number): string {
    const titles: Record<number, string> = {
      1: 'Tipo de Servicio',
      2: 'Seleccionar Equipo',
      3: 'Confirmar'
    };
    return titles[step] || '';
  }
}
