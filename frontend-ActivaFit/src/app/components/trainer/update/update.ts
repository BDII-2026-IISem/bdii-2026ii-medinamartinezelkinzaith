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
import { Trainer } from '../../../services/business/trainer';

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
  loadingItem = signal(false);
  private itemId: number | null = null;
  private subscription = new Subscription();
  statusOptions = [
    { label: 'Activo', value: 'active' },
    { label: 'Inactivo', value: 'inactive' },
  ];
  fieldLabels: Record<string, string> = {
    name: 'Nombre',
    phone: 'Teléfono',
    email: 'Email',
    specialty: 'Especialidad',
    status: 'Estado',
  };

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private svc: Trainer,
    private messageService: MessageService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
      phone: ['', [Validators.pattern(/^\d{7,30}$/)]],
      email: ['', [Validators.email, Validators.maxLength(150)]],
      specialty: ['', [Validators.maxLength(100)]],
      status: ['active', [Validators.required]],
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || Number.isNaN(id)) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'ID no válido' });
      this.router.navigate(['/trainers']);
      return;
    }
    this.itemId = id;
    this.loadingItem.set(true);
    this.subscription.add(
      this.svc.getTrainerById(id).pipe(finalize(() => this.loadingItem.set(false))).subscribe({
        next: (c) =>
          this.form.patchValue({
            name: c.name ?? '',
            phone: c.phone ?? '',
            email: c.email ?? '',
            specialty: c.specialty ?? '',
            status: c.status ?? 'active',
          }),
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el entrenador' });
          this.router.navigate(['/trainers']);
        },
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  submit(): void {
    if (!this.itemId) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Por favor complete todos los campos requeridos' });
      return;
    }
    this.loading.set(true);
    const data: any = { ...this.form.value };
    for (const k of ['phone', 'email', 'specialty']) {
      if (data[k] === '') data[k] = null;
    }
    this.subscription.add(
      this.svc.partialUpdateTrainer(this.itemId, data).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Entrenador actualizado correctamente' });
          setTimeout(() => this.router.navigate(['/trainers']), 1000);
        },
        error: (e) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: this.apiError(e, 'Error al actualizar el entrenador') });
          this.loading.set(false);
        },
      })
    );
  }

  cancelar(): void {
    this.router.navigate(['/trainers']);
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
      if (c.errors['email']) return 'Email no válido';
      if (c.errors['minlength']) return label + ' debe tener al menos ' + c.errors['minlength'].requiredLength + ' caracteres';
      if (c.errors['maxlength']) return label + ' admite máximo ' + c.errors['maxlength'].requiredLength + ' caracteres';
      if (c.errors['pattern']) return 'Formato no válido (solo números, entre 7 y 30 dígitos)';
    }
    return '';
  }
}
