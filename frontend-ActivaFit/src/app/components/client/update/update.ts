import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Subscription, finalize } from 'rxjs';
import { Client } from '../../../services/business/client';

@Component({
  selector: 'app-update',
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, Select, ToastModule],
  templateUrl: './update.html',
  styleUrl: './update.css',
  providers: [MessageService],
})
export class Update implements OnInit, OnDestroy {
  form: FormGroup;
  loading = signal(false);
  loadingClient = signal(false);
  private clientId: number | null = null;
  private subscription = new Subscription();

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
    private route: ActivatedRoute,
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

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || Number.isNaN(id)) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'ID de cliente no válido' });
      this.router.navigate(['/clients']);
      return;
    }
    this.clientId = id;
    this.loadingClient.set(true);
    this.subscription.add(
      this.clientService.getClientById(id).pipe(finalize(() => this.loadingClient.set(false))).subscribe({
        next: (c) =>
          this.form.patchValue({
            documentType: c.documentType ?? 'CC',
            documentNumber: c.documentNumber ?? '',
            name: c.name ?? '',
            phone: c.phone ?? '',
            email: c.email ?? '',
            status: c.status ?? 'active',
          }),
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el cliente' });
          this.router.navigate(['/clients']);
        },
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  submit(): void {
    if (!this.clientId) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Por favor complete todos los campos requeridos' });
      return;
    }
    this.loading.set(true);
    const data = { ...this.form.value, phone: this.form.value.phone || null };
    this.subscription.add(
      this.clientService.partialUpdateClient(this.clientId, data).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cliente actualizado correctamente' });
          setTimeout(() => this.router.navigate(['/clients']), 1000);
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar el cliente' });
          this.loading.set(false);
        },
      })
    );
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