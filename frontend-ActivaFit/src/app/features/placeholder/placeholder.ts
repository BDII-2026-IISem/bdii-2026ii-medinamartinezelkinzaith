import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-placeholder',
  imports: [CardModule, TagModule],
  template: `
    <p-tag value="En construcción" severity="warn" [rounded]="true" />
    <p-card header="Pantalla en construcción" class="mt-4">
      <p class="m-0 text-slate-600">El layout ya está montado; esta pantalla llega en su ISS.</p>
    </p-card>
  `,
})
export class Placeholder {}