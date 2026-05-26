import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

export interface ContactMessage {
  id: number;
  names: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  sent_at: string;
}

@Component({
  selector: 'app-admin-messages',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 font-sans">
      
      <!-- Encabezado -->
      <div class="space-y-1">
        <h1 class="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">Buzón de Mensajes</h1>
        <p class="text-sm text-slate-500 font-medium">Bandeja de entrada de las solicitudes y consultas recibidas a través del formulario de contacto.</p>
      </div>

      <!-- Alertas -->
      <div *ngIf="alertMessage()" 
           class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold rounded-2xl flex items-center space-x-3 shadow-sm animate-scale-in">
        <i class="bi bi-patch-check-fill text-emerald-500 text-xl"></i>
        <span>{{ alertMessage() }}</span>
      </div>

      <!-- Spinner -->
      <div *ngIf="isLoading()" class="flex justify-center py-20 bg-white rounded-3xl border border-slate-200/50 shadow-premium">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <!-- Listado de Mensajes -->
      <div *ngIf="!isLoading()" class="bg-white rounded-3xl border border-slate-200/50 shadow-premium overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th class="px-6 py-4">Estado</th>
                <th class="px-6 py-4">Remitente</th>
                <th class="px-6 py-4">Asunto</th>
                <th class="px-6 py-4">Fecha de Envío</th>
                <th class="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs text-slate-600 font-medium">
              <tr *ngFor="let msg of messages()" 
                  [ngClass]="msg.status === 'unread' ? 'bg-amber-50/20 font-bold text-slate-800' : ''"
                  class="hover:bg-slate-50/50 transition-colors">
                
                <!-- Estado -->
                <td class="px-6 py-4">
                  <span [ngClass]="getStatusClass(msg.status)"
                        class="inline-block px-2.5 py-1 font-bold rounded-full uppercase text-[9px] tracking-wider">
                    {{ msg.status }}
                  </span>
                </td>

                <!-- Remitente -->
                <td class="px-6 py-4">
                  <div class="flex flex-col">
                    <span class="font-bold">{{ msg.names }}</span>
                    <span class="text-[10px] text-slate-400 font-medium leading-none mt-0.5">{{ msg.email }}</span>
                  </div>
                </td>

                <!-- Asunto -->
                <td class="px-6 py-4 truncate max-w-xs" [title]="msg.subject">
                  {{ msg.subject }}
                </td>

                <!-- Fecha -->
                <td class="px-6 py-4 text-slate-500 font-semibold">
                  {{ formatDate(msg.sent_at) }}
                </td>

                <!-- Acciones -->
                <td class="px-6 py-4 text-right">
                  <div class="inline-flex space-x-1">
                    <button (click)="openMessage(msg)" 
                            class="p-2 rounded-lg bg-slate-100 hover:bg-primary-light text-slate-600 hover:text-primary transition-all" 
                            title="Ver Mensaje">
                      <i class="bi bi-envelope-open-fill"></i>
                    </button>
                    <button (click)="deleteMessage(msg.id)" 
                            class="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-all" 
                            title="Eliminar">
                      <i class="bi bi-trash-fill"></i>
                    </button>
                  </div>
                </td>

              </tr>

              <tr *ngIf="messages().length === 0">
                <td colspan="5" class="px-6 py-12 text-center text-slate-400 italic">
                  No se han recibido mensajes en el buzón.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL DETALLE DE MENSAJE -->
      <div *ngIf="selectedMessage()" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" (click)="closeModal()"></div>

        <!-- Ventana Modal -->
        <div class="relative bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-scale-in border border-slate-100 flex flex-col">
          
          <button (click)="closeModal()" class="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all shadow-sm">
            <i class="bi bi-x-lg"></i>
          </button>

          <!-- Cabecera -->
          <div class="p-6 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
            <span [ngClass]="getStatusClass(selectedMessage()?.status)"
                  class="inline-block px-2.5 py-1 font-bold rounded-full uppercase text-[9px] tracking-wider mb-2">
              {{ selectedMessage()?.status }}
            </span>
            <h2 class="text-lg font-extrabold text-slate-800 tracking-tight leading-tight">
              {{ selectedMessage()?.subject }}
            </h2>
            <div class="text-[10px] text-slate-400 font-semibold mt-1">
              Enviado por: {{ selectedMessage()?.names }} ({{ selectedMessage()?.email }})
            </div>
            <div class="text-[10px] text-slate-400 font-semibold">
              Fecha: {{ formatDate(selectedMessage()?.sent_at) }}
            </div>
          </div>

          <!-- Cuerpo -->
          <div class="p-6 space-y-4 flex-grow max-h-60 overflow-y-auto pr-2">
            <h3 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Mensaje Recibido</h3>
            <p class="text-slate-600 text-xs leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-inner">
              {{ selectedMessage()?.message }}
            </p>
          </div>

          <!-- Footer y Acciones de Cambio de Estado -->
          <div class="bg-slate-50 border-t border-slate-100 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 flex-shrink-0">
            
            <!-- Toggle de Estado -->
            <div class="flex items-center space-x-2 w-full sm:w-auto">
              <span class="text-[10px] font-bold text-slate-400 uppercase">Cambiar a:</span>
              <button *ngIf="selectedMessage()?.status !== 'replied'" (click)="updateStatus('replied')"
                      class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg transition-all shadow shadow-emerald-500/10">
                Respondido
              </button>
              <button *ngIf="selectedMessage()?.status === 'replied'" (click)="updateStatus('read')"
                      class="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-bold rounded-lg transition-all shadow shadow-sky-500/10">
                Leído
              </button>
            </div>

            <button (click)="closeModal()" class="w-full sm:w-auto px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition-all shadow-sm">
              Cerrar Mensaje
            </button>
          </div>

        </div>
      </div>

    </div>
  `,
  styles: []
})
export class AdminMessagesComponent implements OnInit {
  private http = inject(HttpClient);

  messages = signal<ContactMessage[]>([]);
  selectedMessage = signal<ContactMessage | null>(null);
  isLoading = signal(true);
  alertMessage = signal('');

  ngOnInit() {
    this.fetchMessages();
  }

  fetchMessages() {
    this.isLoading.set(true);
    this.http.get<{ success: boolean; data: ContactMessage[] }>('/api/contact')
      .subscribe({
        next: (res) => {
          if (res && res.success) {
            this.messages.set(res.data);
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error al obtener mensajes:', err);
          this.isLoading.set(false);
        }
      });
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('es-EC', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case 'unread':
        return 'bg-amber-100 text-amber-700';
      case 'read':
        return 'bg-sky-100 text-sky-700';
      case 'replied':
        return 'bg-emerald-100 text-emerald-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  }

  // Abrir y marcar como Leído automáticamente si estaba Sin Leer
  openMessage(msg: ContactMessage) {
    this.selectedMessage.set(msg);

    if (msg.status === 'unread') {
      this.http.put<{ success: boolean }>(`/api/contact/${msg.id}/status`, { status: 'read' })
        .subscribe({
          next: () => {
            // Actualizar estado localmente sin refrescar todo
            this.messages.update(list => list.map(m => m.id === msg.id ? { ...m, status: 'read' } : m));
            this.selectedMessage.update(current => current ? { ...current, status: 'read' } : null);
          }
        });
    }
  }

  closeModal() {
    this.selectedMessage.set(null);
  }

  // Modificar estado de forma manual en el modal
  updateStatus(newStatus: 'read' | 'replied') {
    const msg = this.selectedMessage();
    if (!msg) return;

    this.http.put<{ success: boolean }>(`/api/contact/${msg.id}/status`, { status: newStatus })
      .subscribe({
        next: () => {
          this.messages.update(list => list.map(m => m.id === msg.id ? { ...m, status: newStatus } : m));
          this.selectedMessage.update(current => current ? { ...current, status: newStatus } : null);
          this.alertMessage.set(`Mensaje marcado como: ${newStatus}`);
          setTimeout(() => this.alertMessage.set(''), 3000);
        }
      });
  }

  // Eliminar
  deleteMessage(id: number) {
    if (!confirm('¿Desea eliminar permanentemente este mensaje de su buzón institucional?')) return;

    this.http.delete<{ success: boolean; message: string }>(`/api/contact/${id}`)
      .subscribe({
        next: (res) => {
          if (res && res.success) {
            this.alertMessage.set(res.message);
            this.fetchMessages();
            this.closeModal();
            setTimeout(() => this.alertMessage.set(''), 3500);
          }
        },
        error: (err) => {
          console.error('Error al borrar mensaje:', err);
        }
      });
  }
}
