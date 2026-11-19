import { Component, effect, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { Client } from '../../../core/models/client.model';
import { Measurement, MeasurementPayload } from '../../../core/models/measurement.model';

/** Alta y edición de una medida. No conoce la API: recibe y emite. */
@Component({
  host: { class: 'block' },
  selector: 'app-measurement-form',
  imports: [ButtonModule, InputTextModule, MessageModule, ReactiveFormsModule, SelectModule],
  templateUrl: './measurement-form.html',
  styleUrl: './measurement-form.css',
})
export class MeasurementForm {
  readonly measurement = input<Measurement | null>(null);
  readonly clients = input<Client[]>([]);
  readonly resetKey = input(0);
  readonly saving = input(false);

  readonly saved = output<MeasurementPayload>();
  readonly cancelled = output<void>();

  private readonly fb = inject(NonNullableFormBuilder);

  readonly form = this.fb.group({
    clientId: this.fb.control<number | null>(null, Validators.required),
    weight: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0.01),
      Validators.max(999.99),
    ]),
    height: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0.01),
      Validators.max(999.99),
    ]),
    bodyFat: this.fb.control<number | null>(null, [Validators.min(0), Validators.max(100)]),
    bmi: this.fb.control<number | null>(null, [Validators.min(0), Validators.max(999.99)]),
  });

  constructor() {
    effect(() => {
      const current = this.measurement();
      this.resetKey();
      this.form.reset({
        clientId: current?.clientId ?? null,
        weight: current ? Number(current.weight) : null,
        height: current ? Number(current.height) : null,
        bodyFat: current?.bodyFat != null ? Number(current.bodyFat) : null,
        bmi: current?.bmi != null ? Number(current.bmi) : null,
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
      clientId: value.clientId!,
      weight: Number(value.weight).toFixed(2),
      height: Number(value.height).toFixed(2),
      bodyFat: value.bodyFat === null ? null : Number(value.bodyFat).toFixed(2),
      bmi: value.bmi === null ? null : Number(value.bmi).toFixed(2),
    });
  }
}