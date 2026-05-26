import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

export interface Author {
  id: number;
  names: string;
  photo_url?: string;
  author_order: number;
}

export interface Publication {
  id: number;
  title: string;
  abstract: string;
  citation: string;
  journal_cover_url?: string;
  doi_link?: string;
  authors?: Author[];
}

@Component({
  selector: 'app-publications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 font-sans">
      
      <!-- Cabecera de Página -->
      <div class="text-center space-y-3">
        <span class="text-xs font-bold text-primary uppercase tracking-widest">Producción Científica</span>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">Publicaciones Científicas</h1>
        <div class="w-16 h-1 bg-primary mx-auto rounded-full"></div>
        <p class="text-slate-500 text-sm max-w-xl mx-auto">
          Catálogo indexado de artículos y aportes científicos de alto nivel, validados por pares externos y publicados en revistas nacionales e internacionales de alto impacto.
        </p>
      </div>

      <!-- Barra de Búsqueda -->
      <div class="max-w-md mx-auto bg-white rounded-2xl border border-slate-100 shadow-premium p-4">
        <div class="relative flex items-center">
          <i class="bi bi-search absolute left-4 text-slate-400 text-lg"></i>
          <input type="text" [(ngModel)]="searchQuery" placeholder="Buscar por título, resumen o autor..." 
                 class="w-full bg-slate-50 border-0 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 font-medium placeholder-slate-400 transition-all">
        </div>
      </div>

      <!-- Spinner de Carga -->
      <div *ngIf="isLoading()" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <!-- Listado de Artículos (Diseño de Fila Científica Elegante) -->
      <div *ngIf="!isLoading() && filteredPublications().length > 0" class="space-y-6 max-w-5xl mx-auto">
        
        <div *ngFor="let pub of filteredPublications()" 
             (click)="selectPublication(pub)"
             class="group bg-white rounded-2xl p-6 border border-slate-100 shadow-premium hover:shadow-hover hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col md:flex-row items-center md:items-start gap-6">
          
          <!-- Portada de Revista -->
          <div class="w-24 h-32 rounded-xl bg-slate-50 border border-slate-200/60 shadow-sm overflow-hidden flex-shrink-0 flex items-center justify-center p-1.5 group-hover:scale-[1.03] transition-transform duration-300">
            <img [src]="getCoverUrl(pub.journal_cover_url)" [alt]="pub.title" class="max-h-full max-w-full object-contain">
          </div>

          <!-- Contenido General -->
          <div class="flex-grow space-y-3 text-center md:text-left min-w-0">
            
            <h3 class="text-base sm:text-lg font-bold text-slate-800 group-hover:text-primary transition-colors tracking-tight leading-tight truncate-two-lines">
              {{ pub.title }}
            </h3>

            <!-- Autores y Cita Rápida -->
            <p class="text-xs text-slate-500 font-semibold leading-relaxed">
              <span class="text-slate-400 font-bold uppercase tracking-wider mr-1.5">Autores:</span>
              <span class="text-slate-700">{{ getAuthorNames(pub) }}</span>
            </p>

            <!-- Cita Blockquote -->
            <p class="text-slate-400 text-xs italic leading-relaxed truncate-two-lines">
              {{ pub.citation }}
            </p>

            <!-- Botones/Enlaces directos -->
            <div class="pt-2 flex flex-wrap justify-center md:justify-start gap-2">
              <span class="px-2.5 py-1 bg-primary-light text-primary text-[10px] font-bold rounded-md uppercase tracking-wider">
                Artículo Indexado
              </span>
              <span *ngIf="pub.doi_link" class="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-md uppercase tracking-wider flex items-center space-x-1">
                <i class="bi bi-link-45deg"></i>
                <span>DOI Enlazado</span>
              </span>
            </div>

          </div>

          <!-- Botón de apertura -->
          <div class="flex-shrink-0 self-center hidden md:block">
            <div class="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-primary-light border border-slate-200/50 flex items-center justify-center text-slate-400 group-hover:text-primary transition-all duration-300">
              <i class="bi bi-chevron-right text-lg"></i>
            </div>
          </div>

        </div>

      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading() && filteredPublications().length === 0" class="text-center py-20 bg-white border border-slate-100 rounded-3xl shadow-premium">
        <i class="bi bi-journal-text text-slate-300 text-5xl mb-4 block"></i>
        <h3 class="text-lg font-bold text-slate-700">No se encontraron artículos científicos</h3>
        <p class="text-slate-400 text-sm">Pruebe ingresando otro término de búsqueda en el filtro.</p>
      </div>

      <!-- MODAL DETALLE DE PUBLICACIÓN -->
      <div *ngIf="selectedPublication()" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" (click)="closeModal()"></div>

        <!-- Ventana Modal -->
        <div class="relative bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-in border border-slate-100 flex flex-col max-h-[90vh]">
          
          <!-- Botón Cerrar -->
          <button (click)="closeModal()" class="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all shadow-sm">
            <i class="bi bi-x-lg"></i>
          </button>

          <!-- Cabecera del Modal -->
          <div class="flex flex-col sm:flex-row p-8 gap-6 items-center sm:items-start flex-shrink-0 border-b border-slate-100 bg-slate-50/50">
            <!-- Portada -->
            <div class="w-20 h-28 bg-white border border-slate-200/60 p-1.5 rounded-xl shadow-sm flex-shrink-0 flex items-center justify-center">
              <img [src]="getCoverUrl(selectedPublication()?.journal_cover_url)" [alt]="selectedPublication()?.title" class="max-h-full max-w-full object-contain">
            </div>
            
            <!-- Perfil / Título -->
            <div class="text-center sm:text-left space-y-3 min-w-0">
              <span class="px-2.5 py-1 bg-primary-light text-primary text-[10px] font-bold rounded-md uppercase tracking-wider">
                Artículo Científico
              </span>
              <h2 class="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight leading-tight truncate-two-lines">
                {{ selectedPublication()?.title }}
              </h2>
              
              <!-- Botón DOI -->
              <div *ngIf="selectedPublication()?.doi_link" class="pt-1">
                <a [href]="selectedPublication()?.doi_link" target="_blank" 
                   class="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3  py-1.5 rounded-lg text-xs font-bold shadow-md hover:shadow-emerald-500/20 transition-all">
                  <i class="bi bi-box-arrow-up-right"></i>
                  <span>Ver en Revista Oficial (DOI)</span>
                </a>
              </div>
            </div>
          </div>

          <!-- Cuerpo: Resumen y Cita Completa con Scrollbar -->
          <div class="flex-grow p-8 overflow-y-auto space-y-6 min-h-0">
            
            <!-- Cita Académica Estructurada -->
            <div class="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <h3 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cita Bibliográfica</h3>
              <blockquote class="text-xs text-slate-600 font-medium italic leading-relaxed">
                "{{ selectedPublication()?.citation }}"
              </blockquote>
            </div>

            <!-- Resumen (Abstract) -->
            <div class="space-y-2">
              <h3 class="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">Resumen / Abstract</h3>
              <p class="text-slate-600 text-sm leading-relaxed whitespace-pre-line pr-1">
                {{ selectedPublication()?.abstract }}
              </p>
            </div>

            <!-- Coautores Internos del Grupo -->
            <div class="space-y-3">
              <h3 class="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">Investigadores Coautores</h3>
              <div class="flex flex-wrap gap-2.5">
                <div *ngFor="let author of selectedPublication()?.authors" 
                     class="flex items-center space-x-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full shadow-sm">
                  <div class="w-6 h-6 rounded-full overflow-hidden border border-slate-200 shadow-inner flex-shrink-0">
                    <img [src]="getAuthorPhotoUrl(author.photo_url)" [alt]="author.names" class="w-full h-full object-cover">
                  </div>
                  <span class="text-slate-700 font-semibold text-xs leading-none">{{ author.names }}</span>
                </div>
                
                <span *ngIf="!selectedPublication()?.authors?.length" class="text-xs text-slate-400 italic">No hay coautores registrados en el sistema.</span>
              </div>
            </div>

          </div>

          <!-- Footer del Modal -->
          <div class="bg-slate-50 border-t border-slate-100 px-8 py-5 flex-shrink-0 flex justify-end">
            <button (click)="closeModal()" class="w-full sm:w-auto px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-all shadow-sm">
              Cerrar Detalle
            </button>
          </div>

        </div>
      </div>

    </div>
  `
})
export class PublicationsComponent implements OnInit {
  private http = inject(HttpClient);

  publications = signal<Publication[]>([]);
  selectedPublication = signal<Publication | null>(null);
  isLoading = signal(true);
  searchQuery = '';

  // Filtro de Búsqueda
  filteredPublications = computed(() => {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) return this.publications();
    return this.publications().filter(p => 
      p.title.toLowerCase().includes(query) || 
      p.abstract.toLowerCase().includes(query) ||
      p.citation.toLowerCase().includes(query) ||
      p.authors?.some(a => a.names.toLowerCase().includes(query))
    );
  });

  ngOnInit() {
    this.fetchPublications();
  }

  fetchPublications() {
    this.isLoading.set(true);
    this.http.get<{ success: boolean; data: Publication[] }>('/api/publications')
      .subscribe({
        next: (res) => {
          if (res && res.success) {
            this.publications.set(res.data);
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error al obtener publicaciones:', err);
          this.isLoading.set(false);
        }
      });
  }

  selectPublication(pub: Publication) {
    this.selectedPublication.set(pub);
  }

  closeModal() {
    this.selectedPublication.set(null);
  }

  getCoverUrl(url?: string): string {
    if (!url) return '/uploads/default_journal.png';
    return `/${url}`;
  }

  getAuthorPhotoUrl(url?: string): string {
    if (!url) return '/uploads/default_avatar.png';
    return `/${url}`;
  }

  getAuthorNames(pub: Publication): string {
    if (!pub.authors || pub.authors.length === 0) return 'Sin investigadores registrados';
    return pub.authors.map(a => a.names).join(', ');
  }
}
