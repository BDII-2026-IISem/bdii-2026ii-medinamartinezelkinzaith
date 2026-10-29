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
import { Trainer } from '../../../services/business/trainer';
import { TrainerResponseI } from '../../../models/business/trainer';

@Component({
  selector: 'app-getall',
  imports: [CommonModule, RouterModule, TableModule, Button, ConfirmDialog, Toast, Tooltip],
  providers: [ConfirmationService, MessageService],
  templateUrl: './getall.html',
  styleUrl: './getall.css',
})
export class Getall implements OnInit, OnDestroy {
  items$: Observable<TrainerResponseI[]>;
  loading = false;
  private subscription = new Subscription();

  constructor(
    private svc: Trainer,
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
      this.svc.getAllTrainers().subscribe({
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

  confirmDelete(row: TrainerResponseI): void {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea eliminar a ' + row.name + '?',
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
      this.svc.deleteTrainer(id).subscribe({
        next: () => this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Entrenador eliminado correctamente' }),
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar (puede tener rutinas o medidas)' }),
      })
    );
  }
}
