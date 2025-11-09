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
  selector: 'app-active-account',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PasswordModule,
    ButtonModule,
    CardModule,
    MessageModule,
    ProgressSpinnerModule
  ],
  templateUrl: './active-account.page.html',
  styleUrl: './active-account.page.css'
})
export class ActiveAccountPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthenticationService);

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal(false);

  readonly activationForm: FormGroup = this.fb.group({
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

  get password() { return this.activationForm.get('password')!; }
  get confirmPassword() { return this.activationForm.get('confirmPassword')!; }

  async onSubmit(): Promise<void> {
    if (this.activationForm.valid) {
      const token = this.route.snapshot.queryParams['token'];
      const password = this.password.value;

      this.isLoading.set(true);
      this.error.set(null);

      try {
        await firstValueFrom(this.authService.setInitialPassword(token, password));
        this.success.set(true);
        this.router.navigate(['/login']).then();
      } catch (error: any) {
        this.error.set(error.message || 'Error al activar la cuenta');
      } finally {
        this.isLoading.set(false);
      }
    } else {
      this.activationForm.markAllAsTouched();
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
