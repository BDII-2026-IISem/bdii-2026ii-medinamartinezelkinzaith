import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

/** Qué permiso falta, leído del query param que dejó el guard. */
@Component({
  host: { class: 'block' },
  selector: 'app-forbidden',
  imports: [ButtonModule, CardModule, RouterLink],
  templateUrl: './forbidden.html',
  styleUrl: './forbidden.css',
})
export class Forbidden {
  readonly permission = inject(ActivatedRoute).snapshot.queryParamMap.get('permission');
}