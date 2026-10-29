import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Plan } from '../../../services/business/plan';

@Component({
  selector: 'app-create',
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, Select, ToastModule],
  templateUrl: './create.html',
  styleUrl: './create.css',
  providers: [MessageService],
})
export class Create {
  form: FormGroup;
  loading = false;
  statusOptions = [
    { label: 'Activo', value: 'active' },
    { label: 'Inactivo', value: 'inactive' },
  ];
  fieldLabels: Record<string, string> = {
    name: 'Nombre',
    description: 'Descripción',
    status: 'Estado',
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private svc: Plan,
    private messageService: MessageService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(255)]],
      status: ['active', [Validators.required]],
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Por favor complete todos los campos requeridos' });
      return;
    }
    this.loading = true;
    const data: any = { ...this.form.value };
    if (data.description === '') data.description = null;
    this.svc.createPlan(data).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Plan creado correctamente' });
        setTimeout(() => this.router.navigate(['/plans']), 1000);
      },
      error: (e) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: this.apiError(e, 'Error al crear el plan') });
        this.loading = false;
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/plans']);
  }

  private apiError(e: any, fallback: string): string {
    const body = e?.error;
    if (body && typeof body === 'object') {
      const msg = Object.entries(body)
        .map(([k, v]) => k + ': ' + (Array.isArray(v) ? v.join(' ') : String(v)))
        .join(' | ');
      if (msg) return msg;
    }
    return fallback;
  }

  getFieldError(field: string): string {
    const c = this.form.get(field);
    const label = this.fieldLabels[field] ?? field;
    if (c?.errors && c.touched) {
      if (c.errors['required']) return label + ' es requerido';
      if (c.errors['minlength']) return label + ' debe tener al menos ' + c.errors['minlength'].requiredLength + ' caracteres';
      if (c.errors['maxlength']) return label + ' admite máximo ' + c.errors['maxlength'].requiredLength + ' caracteres';
    }
    return '';
  }
}
