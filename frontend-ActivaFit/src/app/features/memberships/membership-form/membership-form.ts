import { CurrencyPipe } from '@angular/common';
import { Component, computed, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { Client } from '../../../core/models/client.model';
import { MembershipRegisterPayload } from '../../../core/models/membership.model';
import { Plan } from '../../../core/models/plan.model';
import { toDateOnly, toIsoWithOffset } from '../membership-date';

interface PaymentDraft {
  method: string;
  amount: number;
}

/** Borrador de una membresía con sus pagos. No conoce la API: recibe y emite. */
@Component({
  host: { class: 'block' },
  selector: 'app-membership-form',
  imports: [ButtonModule, CurrencyPipe, FormsModule, InputTextModule, MessageModule, SelectModule],
  templateUrl: './membership-form.html',
  styleUrl: './membership-form.css',
})
export class MembershipForm {
  readonly clients = input<Client[]>([]);
  readonly plans = input<Plan[]>([]);
  readonly saving = input(false);
  /** Error del servidor (por ejemplo, cruce de fechas): se queda dentro del formulario. */
  readonly error = input<string | null>(null);
  readonly resetKey = input(0);

  readonly saved = output<MembershipRegisterPayload>();
  readonly cancelled = output<void>();

  readonly methods = [
    { label: 'Efectivo', value: 'efectivo' },
    { label: 'Tarjeta', value: 'tarjeta' },
    { label: 'Transferencia', value: 'transferencia' },
  ];

  readonly clientId = signal<number | null>(null);
  readonly planId = signal<number | null>(null);
  readonly startDate = signal(toDateOnly(new Date()));
  readonly endDate = signal('');
  readonly payments = signal<PaymentDraft[]>([]);
  readonly method = signal<string | null>(null);
  readonly amount = signal<number | null>(null);
  readonly localError = signal<string | null>(null);

  /** Vista previa: suma lo que el usuario digitó. El valor real lo guarda el servidor. */
  readonly total = computed(() => this.payments().reduce((sum, p) => sum + p.amount, 0));

  constructor() {
    effect(() => {
      this.resetKey();
      this.clientId.set(null);
      this.planId.set(null);
      this.startDate.set(toDateOnly(new Date()));
      this.endDate.set('');
      this.payments.set([]);
      this.method.set(null);
      this.amount.set(null);
      this.localError.set(null);
    });
  }

  addPayment(): void {
    const method = this.method();
    const amount = this.amount();
    if (!method) {
      this.localError.set('Elige el método de pago.');
      return;
    }
    if (amount === null || !Number.isFinite(amount) || amount <= 0) {
      this.localError.set('El monto debe ser mayor que 0.');
      return;
    }
    this.payments.update((list) => [...list, { method, amount }]);
    this.method.set(null);
    this.amount.set(null);
    this.localError.set(null);
  }

  removePayment(index: number): void {
    this.payments.update((list) => list.filter((_, i) => i !== index));
  }

  submit(): void {
    const clientId = this.clientId();
    const planId = this.planId();
    if (clientId === null || planId === null) {
      this.localError.set('Elige el cliente y el plan.');
      return;
    }
    if (!this.startDate() || !this.endDate()) {
      this.localError.set('Indica la fecha de inicio y la de fin.');
      return;
    }
    if (this.endDate() < this.startDate()) {
      this.localError.set('La fecha de fin no puede ser anterior a la de inicio.');
      return;
    }
    if (this.payments().length === 0) {
      this.localError.set('Agrega al menos un pago.');
      return;
    }
    this.localError.set(null);
    const now = toIsoWithOffset(new Date());
    this.saved.emit({
      clientId,
      planId,
      startDate: this.startDate(),
      endDate: this.endDate(),
      payments: this.payments().map((p) => ({
        method: p.method,
        amount: p.amount.toFixed(2),
        paymentDate: now,
      })),
    });
  }
}