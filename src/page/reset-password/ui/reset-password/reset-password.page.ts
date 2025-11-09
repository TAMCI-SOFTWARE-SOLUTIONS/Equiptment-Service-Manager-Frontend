import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../../../entities/user/api';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import {firstValueFrom} from 'rxjs';

@Component({
  selector: 'app-reset-password',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PasswordModule,
    ButtonModule,
    CardModule,
    MessageModule,
    ProgressSpinnerModule
  ],
  templateUrl: './reset-password.page.html',
  styleUrl: './reset-password.page.css'
})
export class ResetPasswordPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthenticationService);

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal(false);

  readonly resetForm: FormGroup = this.fb.group({
    password: ['', [Validators.required, this.strongPasswordValidator]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  ngOnInit(): void {
    const token = this.route.snapshot.queryParams['token'];
    if (!token) {
      this.router.navigate(['/login']).then();
      return;
    }
  }

  get password() { return this.resetForm.get('password')!; }
  get confirmPassword() { return this.resetForm.get('confirmPassword')!; }

  async onSubmit(): Promise<void> {
    if (this.resetForm.valid) {
      const token = this.route.snapshot.queryParams['token'];
      const password = this.password.value;

      this.isLoading.set(true);
      this.error.set(null);

      try {
        await firstValueFrom(this.authService.resetPassword(token, password));
        this.success.set(true);
        this.router.navigate(['/login']).then();
      } catch (error: any) {
        this.error.set(error.message || 'Error al restablecer la contraseña');
      } finally {
        this.isLoading.set(false);
      }
    } else {
      this.resetForm.markAllAsTouched();
    }
  }

  private strongPasswordValidator(control: AbstractControl): { [key: string]: any } | null {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecial = /[#?!@$%^&*-]/.test(value);
    const hasMinLength = value.length >= 8;

    const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecial && hasMinLength;
    return !passwordValid ? { strongPassword: true } : null;
  }

  private passwordMatchValidator(group: AbstractControl): { [key: string]: any } | null {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');

    if (!password || !confirmPassword) return null;

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }
}

