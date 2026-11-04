import { Component, effect, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { Client, ClientPayload } from '../../../core/models/client.model';

/** Alta y edición con el mismo formulario. No conoce la API: recibe y emite. */
@Component({
  host: { class: 'block' },
  selector: 'app-client-form',
  imports: [ButtonModule, InputTextModule, MessageModule, ReactiveFormsModule, SelectModule],
  templateUrl: './client-form.html',
  styleUrl: './client-form.css',
})
export class ClientForm {
  /** Cliente a editar; `null` deja el formulario en modo alta. */
  readonly client = input<Client | null>(null);
  /** Se incrementa al abrir el diálogo y fuerza a reiniciar el formulario. */
  readonly resetKey = input(0);
  readonly saving = input(false);

  readonly saved = output<ClientPayload>();
  readonly cancelled = output<void>();

  readonly documentTypes = [
    { label: 'Cédula de ciudadanía (CC)', value: 'CC' },
    { label: 'Tarjeta de identidad (TI)', value: 'TI' },
    { label: 'Cédula de extranjería (CE)', value: 'CE' },
    { label: 'NIT', value: 'NIT' },
    { label: 'Pasaporte (PAS)', value: 'PAS' },
  ];

  private readonly fb = inject(NonNullableFormBuilder);

  readonly form = this.fb.group({
    documentType: ['', [Validators.required, Validators.maxLength(20)]],
    documentNumber: [
      '',
      [Validators.required, Validators.minLength(5), Validators.maxLength(30)],
    ],
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
    phone: ['', [Validators.pattern(/^[0-9+()\s-]{7,30}$/)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
  });

  constructor() {
    // `effect()` reacciona a `client()` y a `resetKey()`: sin `ngOnChanges`.
    effect(() => {
      const current = this.client();
      this.resetKey();
      this.form.reset({
        documentType: current?.documentType ?? '',
        documentNumber: current?.documentNumber ?? '',
        name: current?.name ?? '',
        phone: current?.phone ?? '',
        email: current?.email ?? '',
      });
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.saved.emit({
      documentType: value.documentType,
      documentNumber: value.documentNumber.trim(),
      name: value.name.trim(),
      phone: value.phone.trim() || null,
      email: value.email.trim() || null,
    });
  }
}