import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {IdentityDocumentTypeEnum} from '../../../../entities/profile/model/enums/identity-document-type.enum';
import {GenderEnum} from '../../../../entities/profile';
import {ProfileStore} from '../../model/store/profile.store';
import {FilePreviewPipe} from '../../model/pipes/file-preview.pipe';

@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [CommonModule, FormsModule, FilePreviewPipe],
  templateUrl: './profile-form.component.html'
})
export class ProfileFormComponent {
  readonly store = inject(ProfileStore);

  // Expose enums
  readonly GenderEnum = GenderEnum;
  readonly IdentityDocumentTypeEnum = IdentityDocumentTypeEnum;

  // Gender options
  readonly genderOptions = [
    { value: GenderEnum.MALE, label: 'Masculino' },
    { value: GenderEnum.FEMALE, label: 'Femenino' }
  ];

  // Document type options
  readonly documentTypeOptions = [
    { value: IdentityDocumentTypeEnum.DNI, label: 'DNI' },
    { value: IdentityDocumentTypeEnum.FOREIGNER_ID_CARD, label: 'Carné de Extranjería' },
    { value: IdentityDocumentTypeEnum.PASSPORT, label: 'Pasaporte' },
    { value: IdentityDocumentTypeEnum.TEMPORARY_RESIDENCE_PERMIT, label: 'Permiso Temporal de Residencia' },
    { value: IdentityDocumentTypeEnum.TEMPORARY_RESIDENCE_CARD, label: 'Carné de Residencia Temporal' },
    { value: IdentityDocumentTypeEnum.OTHER, label: 'Otro' }
  ];

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.store.selectPhoto(input.files[0]);
    }
  }

  triggerFileInput(): void {
    const input = document.getElementById('photoInput') as HTMLInputElement;
    input?.click();
  }

  getDocumentPlaceholder(): string {
    const docType = this.store.formData().identityDocumentType;

    const placeholders: Record<IdentityDocumentTypeEnum, string> = {
      [IdentityDocumentTypeEnum.DNI]: '12345678',
      [IdentityDocumentTypeEnum.FOREIGNER_ID_CARD]: 'CE123456789',
      [IdentityDocumentTypeEnum.PASSPORT]: 'A1234567',
      [IdentityDocumentTypeEnum.TEMPORARY_RESIDENCE_PERMIT]: 'TP12345678901',
      [IdentityDocumentTypeEnum.TEMPORARY_RESIDENCE_CARD]: 'TC12345678901',
      [IdentityDocumentTypeEnum.OTHER]: 'DOC-123456'
    };

    return placeholders[docType] || '';
  }

  getDocumentHint(): string {
    const docType = this.store.formData().identityDocumentType;

    const hints: Record<IdentityDocumentTypeEnum, string> = {
      [IdentityDocumentTypeEnum.DNI]: '8 dígitos numéricos',
      [IdentityDocumentTypeEnum.FOREIGNER_ID_CARD]: 'Alfanumérico, 9-12 caracteres',
      [IdentityDocumentTypeEnum.PASSPORT]: '1 letra seguida de 7 dígitos',
      [IdentityDocumentTypeEnum.TEMPORARY_RESIDENCE_PERMIT]: 'Alfanumérico, 9-15 caracteres',
      [IdentityDocumentTypeEnum.TEMPORARY_RESIDENCE_CARD]: 'Alfanumérico, 9-15 caracteres',
      [IdentityDocumentTypeEnum.OTHER]: 'Alfanumérico con guiones, 4-20 caracteres'
    };

    return hints[docType] || '';
  }
}
