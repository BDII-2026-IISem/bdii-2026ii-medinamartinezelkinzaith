import { Component, computed, input } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { Status } from '../../../core/models/api.model';

/** Estado de un registro: `active` o `inactive`. No conoce la API. */
@Component({
  selector: 'app-status-tag',
  imports: [TagModule],
  template: `<p-tag [value]="label()" [severity]="severity()" />`,
  host: { class: 'inline-block' },
})
export class StatusTag {
  readonly status = input.required<Status>();
  readonly label = computed(() => (this.status() === 'active' ? 'Activo' : 'Inactivo'));
  readonly severity = computed(() => (this.status() === 'active' ? 'success' : 'danger'));
}