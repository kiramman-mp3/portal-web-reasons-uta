import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../../core/services/config.service';

export interface Researcher {
  id: number;
  names: string;
  orcid_link?: string;
  facebook_link?: string;
  linkedin_link?: string;
  instagram_link?: string;
  telegram_link?: string;
  institutional_email: string;
  bio: string;
  position: string;
  photo_url?: string;
}

@Component({
  selector: 'app-researchers',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 font-sans">
      
      <!-- Cabecera de Página -->
      <div class="text-center space-y-3">
        <span class="text-xs font-bold text-primary uppercase tracking-widest">Nuestro Talento</span>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">Equipo de Investigadores</h1>
        <div class="w-16 h-1 bg-primary mx-auto rounded-full"></div>
        <p class="text-slate-500 text-sm max-w-xl mx-auto">
          Profesionales altamente capacitados comprometidos con la innovación tecnológica, el desarrollo sostenible y la transferencia de conocimiento científico.
        </p>
      </div>

      <!-- Spinner de Carga -->
      <div *ngIf="isLoading()" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <!-- Grid de Investigadores -->
      <div *ngIf="!isLoading() && researchers().length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div *ngFor="let res of researchers()" 
             (click)="selectResearcher(res)"
             class="group bg-white rounded-3xl border border-slate-100 shadow-premium hover:shadow-hover hover:-translate-y-1.5 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full">
          
          <!-- Contenedor Foto 5x5 cm -->
          <div class="relative w-full aspect-square bg-slate-50 overflow-hidden flex items-center justify-center p-3">
            <div class="relative w-full h-full rounded-2xl overflow-hidden border border-slate-100 shadow-inner">
              <img [src]="getPhotoUrl(res.photo_url)" [alt]="res.names" 
                   class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500">
            </div>
            
            <!-- Overlay Hover Visual -->
            <div class="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
              <span class="px-4 py-2 bg-white text-slate-900 text-xs font-bold rounded-lg shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                Ver Biografía Completa
              </span>
            </div>
          </div>

          <!-- Información Básica -->
          <div class="p-6 flex-grow flex flex-col justify-between text-center space-y-4">
            <div class="space-y-1">
              <h3 class="text-lg font-bold text-slate-800 tracking-tight group-hover:text-primary transition-colors leading-tight">
                {{ res.names }}
              </h3>
              <span class="inline-block text-xs font-bold text-secondary bg-secondary-light px-2.5 py-1 rounded-full uppercase">
                {{ res.position }}
              </span>
            </div>

            <!-- Email Rápido -->
            <span class="text-xs text-slate-400 font-semibold truncate block">
              {{ res.institutional_email }}
            </span>
          </div>

        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading() && researchers().length === 0" class="text-center py-20 bg-white border border-slate-100 rounded-3xl shadow-premium">
        <i class="bi bi-people text-slate-300 text-5xl mb-4 block"></i>
        <h3 class="text-lg font-bold text-slate-700">No se encontraron investigadores registrados</h3>
        <p class="text-slate-400 text-sm">El equipo se encuentra actualmente en configuración.</p>
      </div>

      <!-- MODAL DETALLE DE INVESTIGADOR (BIO Y REDES) -->
      <div *ngIf="selectedResearcher()" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        
        <!-- Backdrop Oscuro -->
        <div class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" (click)="closeModal()"></div>

        <!-- Ventana Modal -->
        <div class="relative bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-in border border-slate-100">
          
          <!-- Botón de Cerrar -->
          <button (click)="closeModal()" class="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all">
            <i class="bi bi-x-lg"></i>
          </button>

          <!-- Cabecera y Foto del Modal -->
          <div class="flex flex-col md:flex-row p-8 gap-8 items-center md:items-start">
            
            <!-- Foto -->
            <div class="w-36 h-36 rounded-3xl overflow-hidden border border-slate-200 shadow-md flex-shrink-0">
              <img [src]="getPhotoUrl(selectedResearcher()?.photo_url)" [alt]="selectedResearcher()?.names" class="w-full h-full object-cover">
            </div>

            <!-- Info Perfil -->
            <div class="text-center md:text-left space-y-3 flex-grow min-w-0">
              <span class="inline-block text-xs font-bold text-primary bg-primary-light px-3 py-1 rounded-full uppercase tracking-wider">
                {{ selectedResearcher()?.position }}
              </span>
              <h2 class="text-2xl font-extrabold text-slate-800 tracking-tight leading-tight">
                {{ selectedResearcher()?.names }}
              </h2>
              <p class="text-sm font-semibold text-slate-500 flex items-center justify-center md:justify-start space-x-1.5">
                <i class="bi bi-envelope-at-fill text-primary"></i>
                <a [href]="'mailto:' + selectedResearcher()?.institutional_email" class="hover:text-primary transition-all">{{ selectedResearcher()?.institutional_email }}</a>
              </p>

              <!-- Enlace ORCID -->
              <p *ngIf="selectedResearcher()?.orcid_link" class="text-sm flex items-center justify-center md:justify-start space-x-2">
                <span class="font-bold text-slate-600">ORCID:</span>
                <a [href]="selectedResearcher()?.orcid_link" target="_blank" class="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center space-x-1 hover:underline">
                  <i class="bi bi-journal-bookmark-fill"></i>
                  <span class="truncate">{{ selectedResearcher()?.orcid_link }}</span>
                </a>
              </p>
            </div>
          </div>

          <!-- Cuerpo: Biografía -->
          <div class="px-8 pb-6 space-y-4">
            <h3 class="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center space-x-2 border-b border-slate-100 pb-2">
              <i class="bi bi-file-text text-primary"></i>
              <span>Biografía Profesional</span>
            </h3>
            <p class="text-slate-600 text-sm leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto pr-2">
              {{ selectedResearcher()?.bio }}
            </p>
          </div>

          <!-- Redes Sociales y Acciones -->
          <div class="bg-slate-50 px-8 py-5 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            
            <!-- Redes Sociales -->
            <div class="flex items-center space-x-2">
              <span class="text-xs font-bold text-slate-400 uppercase mr-2">Redes:</span>
              
              <a *ngIf="selectedResearcher()?.facebook_link" [href]="selectedResearcher()?.facebook_link" target="_blank" 
                 class="w-8 h-8 rounded-lg bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-all shadow-sm">
                <i class="bi bi-facebook text-lg"></i>
              </a>

              <a *ngIf="selectedResearcher()?.linkedin_link" [href]="selectedResearcher()?.linkedin_link" target="_blank" 
                 class="w-8 h-8 rounded-lg bg-white border border-slate-200 text-sky-700 hover:bg-sky-50 flex items-center justify-center transition-all shadow-sm">
                <i class="bi bi-linkedin text-lg"></i>
              </a>

              <a *ngIf="selectedResearcher()?.instagram_link" [href]="selectedResearcher()?.instagram_link" target="_blank" 
                 class="w-8 h-8 rounded-lg bg-white border border-slate-200 text-pink-600 hover:bg-pink-50 flex items-center justify-center transition-all shadow-sm">
                <i class="bi bi-instagram text-lg"></i>
              </a>

              <a *ngIf="selectedResearcher()?.telegram_link" [href]="selectedResearcher()?.telegram_link" target="_blank" 
                 class="w-8 h-8 rounded-lg bg-white border border-slate-200 text-sky-500 hover:bg-sky-50 flex items-center justify-center transition-all shadow-sm">
                <i class="bi bi-telegram text-lg"></i>
              </a>

              <!-- Fallback si no hay redes -->
              <span *ngIf="!hasSocialLinks()" class="text-xs text-slate-400 font-medium italic">Sin enlaces de redes registrados.</span>
            </div>

            <button (click)="closeModal()" class="w-full sm:w-auto px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition-all shadow-sm">
              Cerrar Detalle
            </button>
          </div>

        </div>

      </div>

    </div>
  `
})
export class ResearchersComponent implements OnInit {
  private http = inject(HttpClient);
  config = inject(ConfigService);

  researchers = signal<Researcher[]>([]);
  selectedResearcher = signal<Researcher | null>(null);
  isLoading = signal(true);

  ngOnInit() {
    this.fetchResearchers();
  }

  fetchResearchers() {
    this.isLoading.set(true);
    this.http.get<{ success: boolean; data: Researcher[] }>('/api/researchers')
      .subscribe({
        next: (res) => {
          if (res && res.success) {
            this.researchers.set(res.data);
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error al obtener investigadores:', err);
          this.isLoading.set(false);
        }
      });
  }

  selectResearcher(res: Researcher) {
    this.selectedResearcher.set(res);
  }

  closeModal() {
    this.selectedResearcher.set(null);
  }

  getPhotoUrl(photoUrl?: string): string {
    if (!photoUrl) return '/uploads/default_avatar.png';
    return `/${photoUrl}`;
  }

  hasSocialLinks(): boolean {
    const res = this.selectedResearcher();
    if (!res) return false;
    return !!(res.facebook_link || res.linkedin_link || res.instagram_link || res.telegram_link);
  }
}
