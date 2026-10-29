import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Client } from '../../../services/business/client';

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

  documentTypeOptions = [
    { label: 'Cédula de ciudadanía', value: 'CC' },
    { label: 'Cédula de extranjería', value: 'CE' },
    { label: 'Tarjeta de identidad', value: 'TI' },
    { label: 'Pasaporte', value: 'PASSPORT' },
  ];
  statusOptions = [
    { label: 'Activo', value: 'active' },
    { label: 'Inactivo', value: 'inactive' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private clientService: Client,
    private messageService: MessageService
  ) {
    this.form = this.fb.group({
      documentType: ['CC', Validators.required],
      documentNumber: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(30)]],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
      phone: ['', [Validators.pattern(/^\d{7,30}$/)]],
      email: ['', [Validators.required, Validators.email]],
      status: ['active', Validators.required],
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Por favor complete todos los campos requeridos' });
      return;
    }
    this.loading = true;
    const data = { ...this.form.value, phone: this.form.value.phone || null };
    this.clientService.createClient(data).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cliente creado correctamente' });
        setTimeout(() => this.router.navigate(['/clients']), 1000);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al crear el cliente' });
        this.loading = false;
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/clients']);
  }

  getFieldError(field: string): string {
    const c = this.form.get(field);
    if (c?.errors && c.touched) {
      if (c.errors['required']) return `${field} es requerido`;
      if (c.errors['email']) return 'Email no válido';
      if (c.errors['minlength']) return `${field} debe tener al menos ${c.errors['minlength'].requiredLength} caracteres`;
      if (c.errors['maxlength']) return `${field} admite máximo ${c.errors['maxlength'].requiredLength} caracteres`;
      if (c.errors['pattern']) return 'Formato no válido';
    }
    return '';
  }
}