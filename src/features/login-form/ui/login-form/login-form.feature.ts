import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthStore } from '../../../../shared/stores';
import { SignInCredentials } from '../../../../entities/user/api';
import { AuthenticationService } from '../../../../entities/user/api';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login-form.feature.html',
  standalone: true
})
export class LoginFormFeature {
  private readonly fb = inject(FormBuilder);
  readonly authStore = inject(AuthStore);
  private readonly authService = inject(AuthenticationService);

  readonly showPassword = signal(false);
  readonly showForgot = signal(false);
  readonly forgotLoading = signal(false);
  readonly forgotError = signal<string | null>(null);
  readonly forgotSuccess = signal<string | null>(null);

  readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  readonly forgotForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email, Validators.minLength(3)]]
  });

  get email() { return this.loginForm.get('email')!; }
  get password() { return this.loginForm.get('password')!; }
  get forgotEmail() { return this.forgotForm.get('email')!; }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const credentials: SignInCredentials = {
        email: this.email.value.trim(),
        password: this.password.value
      };
      this.authStore.signIn(credentials);
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(show => !show);
  }

  clearError(): void {
    this.authStore.clearError();
  }

  openForgot(): void {
    this.forgotError.set(null);
    this.forgotSuccess.set(null);
    this.showForgot.set(true);
  }

  closeForgot(): void {
    this.showForgot.set(false);
    this.forgotForm.reset();
  }

  async submitForgot(): Promise<void> {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }

    const email = this.forgotEmail.value.trim();
    console.log('Submitting forgot password for email:', email);

    try {
      this.forgotLoading.set(true);
      this.forgotError.set(null);
      await firstValueFrom(this.authService.forgotPassword(email));
      this.forgotSuccess.set('Si existe una cuenta con ese email, recibirás instrucciones para restablecer la contraseña.');
      this.forgotLoading.set(false);
    } catch (err: any) {
      this.forgotLoading.set(false);
      this.forgotError.set(err?.message || 'Error al solicitar restablecimiento de contraseña');
    }
  }
}
