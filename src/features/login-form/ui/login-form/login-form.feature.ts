import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthStore } from '../../../../shared/stores';
import { SignInCredentials } from '../../../../entities/user/api';

@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login-form.feature.html',
  standalone: true
})
export class LoginFormFeature {
  private readonly fb = inject(FormBuilder);
  readonly authStore = inject(AuthStore);

  readonly showPassword = signal(false);

  readonly loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  get username() { return this.loginForm.get('username')!; }
  get password() { return this.loginForm.get('password')!; }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const credentials: SignInCredentials = {
        username: this.username.value.trim(),
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
}
