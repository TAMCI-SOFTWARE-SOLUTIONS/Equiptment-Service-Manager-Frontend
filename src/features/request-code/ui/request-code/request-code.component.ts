import {Component, inject} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService} from '../../../../entities/user/api';
import {RequestCodeStore} from '../../model';
import {InputText} from 'primeng/inputtext';
import {Button} from 'primeng/button';

@Component({
  selector: 'app-request-code',
  imports: [
    ReactiveFormsModule,
    InputText,
    Button
  ],
  providers: [RequestCodeStore],
  templateUrl: './request-code.component.html',
  standalone: true,
  styleUrl: './request-code.component.css'
})
export class RequestCodeComponent {
  readonly fb = inject(FormBuilder);
  readonly router = inject(Router);
  readonly authService = inject(AuthService);
  readonly requestCodeStore = inject(RequestCodeStore);

  requestCodeForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  public onSubmit(): void {
    if (this.requestCodeForm.valid) {
      const email = this.requestCodeForm.value.email!;

      this.requestCodeStore.setLoading(true);
      this.requestCodeStore.setError(null);

      this.authService.requestCode(email).subscribe({
        next: (response) => {
          this.requestCodeStore.setLoading(false);
          this.requestCodeStore.setCodeSent(true);
          this.router.navigate(['/verify-otp'], { queryParams: { email } }).then(() => {});
        },
        error: (error) => {
          this.requestCodeStore.setLoading(false);
          this.requestCodeStore.setError('Error al enviar el código. Por favor, intenta nuevamente.');
          console.error('Request code error:', error);
        }
      });
    } else {
      this.requestCodeForm.markAllAsTouched();
    }
  }
}
