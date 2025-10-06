import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Button} from 'primeng/button';
import {InputOtp} from 'primeng/inputotp';
import {AuthService} from '../../../../entities/user/api';
import {SendCodeStore} from '../../model';
import {Location} from '@angular/common';

@Component({
  selector: 'app-send-verification-code-form',
  imports: [
    Button,
    InputOtp,
    ReactiveFormsModule
  ],
  providers: [SendCodeStore],
  templateUrl: './send-verification-code-form.component.html',
  standalone: true,
  styleUrl: './send-verification-code-form.component.css'
})
export class SendVerificationCodeFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly authService = inject(AuthService);
  readonly sendCodeStore = inject(SendCodeStore);

  email: string = '';

  sendCodeForm = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
  });

  get codeControl() {
    return this.sendCodeForm.controls.code;
  }

  get showErrors(): boolean {
    return this.codeControl.invalid && this.codeControl.dirty;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      if (this.email) {
        this.sendCodeStore.setEmail(this.email);
      }
    });
  }

  public onBack(): void {
    this.location.back();
  }

  public onSubmit(): void {
    if (this.sendCodeForm.valid) {
      const code = this.sendCodeForm.value.code!;
      const email = this.email || this.sendCodeStore.email();

      this.sendCodeStore.setLoading(true);
      this.sendCodeStore.setError(null);

      this.authService.verifyCode(email, code).subscribe({
        next: (response) => {
          this.sendCodeStore.setLoading(false);
          console.log('Código verificado exitosamente:', response);
          this.router.navigate(['/clients']).then(() => {});
        },
        error: (error) => {
          this.sendCodeStore.setLoading(false);
          this.sendCodeStore.setError('Código inválido. Por favor, intenta nuevamente.');
          console.error('Error al verificar código:', error);
        }
      });
    } else {
      this.sendCodeForm.markAllAsTouched();
    }
  }
}
