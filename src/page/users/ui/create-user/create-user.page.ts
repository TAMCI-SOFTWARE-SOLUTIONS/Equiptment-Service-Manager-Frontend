import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Ripple } from 'primeng/ripple';
import { Select } from 'primeng/select';
import { UsersStore } from '../../model/users.store';
import { RolesEnum } from '../../../../entities/role/model';
import { UserEntity } from '../../../../entities/user/model';
import {PasswordGenerator} from '../../../../shared/utils/password-generator.util';

interface RoleOption {
  label: string;
  value: RolesEnum;
  description: string;
}

@Component({
  selector: 'app-create-user',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Ripple,
    Select
  ],
  templateUrl: './create-user.page.html'
})
export class CreateUserPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly store = inject(UsersStore);

  // Form
  form!: FormGroup;

  // Generated password (guardada para mostrar en modal)
  protected generatedPassword: string = '';

  // UI State
  readonly isSubmitting = signal(false);
  readonly showSuccessModal = signal(false);
  readonly createdUserEmail = signal<string>('');
  readonly passwordCopied = signal(false);

  // Role options
  readonly roleOptions: RoleOption[] = [
    {
      label: 'Administrador',
      value: RolesEnum.ROLE_ADMIN,
      description: 'Acceso completo al sistema'
    },
    {
      label: 'Operador',
      value: RolesEnum.ROLE_OPERATOR,
      description: 'Puede ejecutar servicios'
    },
    {
      label: 'Visor de Cliente',
      value: RolesEnum.ROLE_CLIENT_VIEWER,
      description: 'Solo visualización'
    }
  ];

  ngOnInit(): void {
    this.initializeForm();
    this.generatePassword();
  }

  // ==================== FORM INITIALIZATION ====================

  private initializeForm(): void {
    this.form = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]],
      role: [null, Validators.required]
    });
  }

  /**
   * Genera una contraseña segura automáticamente
   */
  private generatePassword(): void {
    this.generatedPassword = PasswordGenerator.generate(12);
    console.log('✅ Password generated (not logged in production)');
  }

  // ==================== FORM HELPERS ====================

  get emailControl() {
    return this.form.get('email')!;
  }

  get roleControl() {
    return this.form.get('role')!;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    if (field.errors['required']) {
      return 'Este campo es requerido';
    }

    if (fieldName === 'email') {
      if (field.errors['email'] || field.errors['pattern']) {
        return 'Ingresa un email válido';
      }
    }

    return 'Campo inválido';
  }

  // ==================== NAVIGATION ====================

  onCancel(): void {
    if (this.form.dirty) {
      const confirmed = confirm('¿Estás seguro? Se perderán los datos ingresados.');
      if (!confirmed) return;
    }

    this.router.navigate(['/users']);
  }

  // ==================== SUBMIT ====================

  async onSubmit(): Promise<void> {
    // Validar formulario
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    try {
      const formValue = this.form.value;

      // Construir payload
      const newUser: Partial<UserEntity> = {
        email: formValue.email.trim().toLowerCase(),
        password: this.generatedPassword,
        roles: [{
          id: '', // No importa el ID en creación
          name: formValue.role
        }]
      } as Partial<UserEntity>;

      console.log('📤 Creating user:', {
        email: newUser.email,
        role: formValue.role,
        passwordLength: this.generatedPassword.length
      });

      // Crear usuario
      const createdUser = await this.store.createUser(newUser as UserEntity);

      if (createdUser) {
        console.log('✅ User created successfully:', createdUser.id);

        // Mostrar modal de éxito
        this.createdUserEmail.set(createdUser.email);
        this.showSuccessModal.set(true);
      }

    } catch (error: any) {
      console.error('❌ Error creating user:', error);
      // El error ya se maneja en el store
    } finally {
      this.isSubmitting.set(false);
    }
  }

  // ==================== SUCCESS MODAL ====================

  /**
   * Copiar contraseña al clipboard
   */
  async onCopyPassword(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.generatedPassword);
      this.passwordCopied.set(true);

      // Reset después de 3 segundos
      setTimeout(() => {
        this.passwordCopied.set(false);
      }, 3000);

      console.log('✅ Password copied to clipboard');
    } catch (error) {
      console.error('❌ Error copying password:', error);

      // Fallback: seleccionar texto
      this.selectPasswordText();
    }
  }

  /**
   * Fallback: seleccionar texto de la contraseña
   */
  private selectPasswordText(): void {
    const passwordElement = document.getElementById('generated-password');
    if (passwordElement) {
      const range = document.createRange();
      range.selectNodeContents(passwordElement);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }

  /**
   * Cerrar modal y navegar a lista
   */
  onCloseSuccessModal(): void {
    this.showSuccessModal.set(false);
    this.router.navigate(['/users']);
  }

  // ==================== HELPERS ====================

  /**
   * Obtener label del rol seleccionado
   */
  getSelectedRoleLabel(): string {
    const roleValue = this.roleControl.value;
    if (!roleValue) return '';

    const option = this.roleOptions.find(opt => opt.value === roleValue);
    return option?.label || '';
  }

  /**
   * Obtener descripción del rol seleccionado
   */
  getSelectedRoleDescription(): string {
    const roleValue = this.roleControl.value;
    if (!roleValue) return '';

    const option = this.roleOptions.find(opt => opt.value === roleValue);
    return option?.description || '';
  }
}
