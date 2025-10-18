import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Ripple } from 'primeng/ripple';
import { Select } from 'primeng/select';
import {IdentityDocumentTypeEnum} from '../../../../entities/profile/model/enums/identity-document-type.enum';
import {GenderEnum} from '../../../../entities/profile';
import {CollaboratorFormStore} from '../../model/store/collaborator-form.store';
import {ToggleSwitch} from 'primeng/toggleswitch';
import {PrimeTemplate} from 'primeng/api';

interface GenderOption {
  label: string;
  value: GenderEnum;
}

interface DocumentTypeOption {
  label: string;
  value: IdentityDocumentTypeEnum;
  description: string;
}

@Component({
  selector: 'app-collaborator-form',
  standalone: true,
  imports: [CommonModule, FormsModule, Ripple, Select, ToggleSwitch, PrimeTemplate],
  providers: [CollaboratorFormStore],
  templateUrl: './collaborator-form.page.html'
})
export class CollaboratorFormPage implements OnInit, OnDestroy {
  readonly store = inject(CollaboratorFormStore);
  private readonly router = inject(Router);

  // Opciones de género
  readonly genderOptions: GenderOption[] = [
    { label: 'Masculino', value: GenderEnum.MALE },
    { label: 'Femenino', value: GenderEnum.FEMALE }
  ];

  // Opciones de tipo de documento
  readonly documentTypeOptions: DocumentTypeOption[] = [
    {
      label: 'DNI',
      value: IdentityDocumentTypeEnum.DNI,
      description: 'Documento Nacional de Identidad (8 dígitos)'
    },
    {
      label: 'Carné de Extranjería',
      value: IdentityDocumentTypeEnum.FOREIGNER_ID_CARD,
      description: '9-12 caracteres alfanuméricos'
    },
    {
      label: 'Pasaporte',
      value: IdentityDocumentTypeEnum.PASSPORT,
      description: '1 letra + 7 dígitos'
    },
    {
      label: 'Permiso Temporal de Permanencia',
      value: IdentityDocumentTypeEnum.TEMPORARY_RESIDENCE_PERMIT,
      description: '9-15 caracteres alfanuméricos'
    },
    {
      label: 'Carnet de Permiso Temporal',
      value: IdentityDocumentTypeEnum.TEMPORARY_RESIDENCE_CARD,
      description: '9-15 caracteres alfanuméricos'
    },
    {
      label: 'Otro',
      value: IdentityDocumentTypeEnum.OTHER,
      description: '4-20 caracteres alfanuméricos con guiones'
    }
  ];

  ngOnInit(): void {
    this.store.initialize();
  }

  ngOnDestroy(): void {
    this.store.reset();
  }

  // ==================== NAVIGATION ====================

  onNext(): void {
    this.store.goToNextStep();
  }

  onPrevious(): void {
    this.store.goToPreviousStep();
  }

  onGoToStep(step: number): void {
    this.store.goToStep(step);
  }

  // ==================== FORM HANDLERS ====================

  onNamesChange(value: string): void {
    this.store.setNames(value);
  }

  onFirstSurnameChange(value: string): void {
    this.store.setFirstSurname(value);
  }

  onSecondSurnameChange(value: string): void {
    this.store.setSecondSurname(value);
  }

  onGenderChange(value: GenderEnum | null): void {
    this.store.setGender(value);
  }

  onDocumentTypeChange(value: IdentityDocumentTypeEnum | null): void {
    this.store.setIdentityDocumentType(value);
  }

  onDocumentNumberChange(value: string): void {
    this.store.setIdentityDocumentNumber(value);
  }

  onEmailChange(value: string): void {
    this.store.setEmail(value);
  }

  onShouldCreateUserChange(value: boolean): void {
    this.store.setShouldCreateUser(value);
  }

  async onPhotoSelect(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      await this.store.setPhotoFile(input.files[0]);
    }
  }

  onClearPhoto(): void {
    this.store.clearPhoto();
  }

  // ==================== SUBMIT ====================

  async onSubmit(): Promise<void> {
    const result = await this.store.submit();

    if (result) {
      this.router.navigate(['/collaborators']).then(() => {});
    }
  }

  onCancel(): void {
    this.store.reset();
    this.router.navigate(['/collaborators']).then(() => {});
  }

  // ==================== HELPERS ====================

  getStepIcon(step: number): string {
    const icons: Record<number, string> = {
      1: 'pi-user',
      2: 'pi-cog'
    };
    return icons[step] || 'pi-circle';
  }

  getStepTitle(step: number): string {
    const titles: Record<number, string> = {
      1: 'Datos Personales',
      2: 'Configuración'
    };
    return titles[step] || '';
  }

  isStepCompleted(step: number): boolean {
    if (step === 1) {
      return this.store.isStep1Valid();
    }
    return false;
  }

  isStepActive(step: number): boolean {
    return this.store.currentStep() === step;
  }

  getGenderLabel(gender: GenderEnum): string {
    return this.genderOptions.find(g => g.value === gender)?.label || '';
  }

  getDocumentTypeLabel(type: IdentityDocumentTypeEnum): string {
    return this.documentTypeOptions.find(d => d.value === type)?.label || '';
  }
}
