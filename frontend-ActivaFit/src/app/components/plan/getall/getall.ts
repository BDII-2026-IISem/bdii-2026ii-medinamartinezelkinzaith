import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { Tooltip } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Observable, Subscription } from 'rxjs';
import { Plan } from '../../../services/business/plan';
import { PlanResponseI } from '../../../models/business/plan';

@Component({
  selector: 'app-getall',
  imports: [CommonModule, RouterModule, TableModule, Button, ConfirmDialog, Toast, Tooltip],
  providers: [ConfirmationService, MessageService],
  templateUrl: './getall.html',
  styleUrl: './getall.css',
})
export class Getall implements OnInit, OnDestroy {
  items$: Observable<PlanResponseI[]>;
  loading = false;
  private subscription = new Subscription();

  constructor(
    private svc: Plan,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.items$ = this.svc.items$;
  }

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  load(): void {
    this.loading = true;
    this.subscription.add(
      this.svc.getAllPlans().subscribe({
        next: () => (this.loading = false),
        error: (e) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: e?.status === 403 ? 'No tiene permiso para ver este módulo' : 'No se pudo cargar el listado',
          });
          this.loading = false;
        },
      })
    );
  }

  confirmDelete(row: PlanResponseI): void {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar el plan ' + row.name + '?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.remove(row.id!),
    });
  }

  remove(id: number): void {
    this.subscription.add(
      this.svc.deletePlan(id).subscribe({
        next: () => this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Plan eliminado correctamente' }),
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar (puede tener membresías)' }),
      })
    );
  }
}
