import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Auth } from '../../../services/auth/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule],
  templateUrl: './login.html',
})
export class Login {
  form: FormGroup;
  loading = signal(false);
  error = signal('');

  constructor(private fb: FormBuilder, private auth: Auth, private router: Router) {
    this.form = this.fb.group({
      identifier: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set('');
    const { identifier, password } = this.form.value;
    this.auth.login(identifier.trim(), password).subscribe({
      next: () => this.router.navigate(['/clients']),
      error: (e) => {
        this.error.set(e.status === 401 ? 'Credenciales inválidas.' : 'No se pudo iniciar sesión.');
        this.loading.set(false);
      },
    });
  }
}
