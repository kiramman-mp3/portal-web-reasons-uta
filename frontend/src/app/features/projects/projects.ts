import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

export interface Participant {
  id: number;
  names: string;
  photo_url?: string;
  position: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  objectives: string;
  results: string;
  image_url?: string;
  participants?: Participant[];
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 font-sans">
      
      <!-- Cabecera de Página -->
      <div class="text-center space-y-3">
        <span class="text-xs font-bold text-primary uppercase tracking-widest">Aportes Tecnológicos</span>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">Proyectos de Investigación</h1>
        <div class="w-16 h-1 bg-primary mx-auto rounded-full"></div>
        <p class="text-slate-500 text-sm max-w-xl mx-auto">
          Catálogo interactivo de iniciativas interdisciplinarias enfocadas en dar soluciones eficientes y sostenibles al sector social e industrial.
        </p>
      </div>

      <!-- Barra de Búsqueda y Filtros -->
      <div class="max-w-md mx-auto bg-white rounded-2xl border border-slate-100 shadow-premium p-4">
        <div class="relative flex items-center">
          <i class="bi bi-search absolute left-4 text-slate-400 text-lg"></i>
          <input type="text" [(ngModel)]="searchQuery" placeholder="Buscar por título o palabras clave..." 
                 class="w-full bg-slate-50 border-0 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 font-medium placeholder-slate-400 transition-all">
        </div>
      </div>

      <!-- Spinner de Carga -->
      <div *ngIf="isLoading()" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <!-- Catálogo de Tarjetas de Proyectos -->
      <div *ngIf="!isLoading() && filteredProjects().length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div *ngFor="let proj of filteredProjects()" 
             (click)="selectProject(proj)"
             class="group bg-white rounded-3xl border border-slate-100 shadow-premium hover:shadow-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col h-full">
          
          <!-- Imagen de Portada -->
          <div class="relative h-48 w-full bg-slate-100 overflow-hidden">
            <img [src]="getImageUrl(proj.image_url)" [alt]="proj.title" 
                 class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500">
            <div class="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span class="px-4 py-2 bg-white text-slate-900 text-xs font-bold rounded-lg shadow-md">
                Ver Detalles del Proyecto
              </span>
            </div>
          </div>

          <!-- Contenido Básico -->
          <div class="p-6 flex-grow flex flex-col justify-between space-y-4">
            <div class="space-y-2">
              <h3 class="text-lg font-bold text-slate-800 tracking-tight leading-tight group-hover:text-primary transition-colors line-clamp-2">
                {{ proj.title }}
              </h3>
              <p class="text-slate-500 text-xs leading-relaxed line-clamp-3">
                {{ proj.description }}
              </p>
            </div>

            <!-- Participantes Rápido -->
            <div class="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span class="text-slate-400 font-semibold">Participantes:</span>
              <span class="text-slate-600 font-bold max-w-[12rem] truncate">
                {{ getParticipantNames(proj) }}
              </span>
            </div>

          </div>

        </div>

      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading() && filteredProjects().length === 0" class="text-center py-20 bg-white border border-slate-100 rounded-3xl shadow-premium">
        <i class="bi bi-kanban text-slate-300 text-5xl mb-4 block"></i>
        <h3 class="text-lg font-bold text-slate-700">No se encontraron proyectos</h3>
        <p class="text-slate-400 text-sm">Pruebe ingresando otro criterio de búsqueda en el filtro.</p>
      </div>

      <!-- MODAL DETALLE COMPLETO DEL PROYECTO -->
      <div *ngIf="selectedProject()" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" (click)="closeModal()"></div>

        <!-- Ventana Modal Grande -->
        <div class="relative bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl animate-scale-in border border-slate-100 flex flex-col max-h-[90vh]">
          
          <!-- Botón Cerrar -->
          <button (click)="closeModal()" class="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all shadow-sm">
            <i class="bi bi-x-lg"></i>
          </button>

          <!-- Cabecera del Modal con Imagen -->
          <div class="relative h-56 w-full bg-slate-900 flex-shrink-0">
            <img [src]="getImageUrl(selectedProject()?.image_url)" [alt]="selectedProject()?.title" class="w-full h-full object-cover opacity-60">
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent flex items-end p-8">
              <h2 class="text-xl sm:text-2xl font-extrabold text-white leading-tight tracking-tight max-w-2xl">
                {{ selectedProject()?.title }}
              </h2>
            </div>
          </div>

          <!-- Cuerpo con Scrollbar para Contenidos de Módulo -->
          <div class="flex-grow p-8 overflow-y-auto space-y-8 min-h-0">
            
            <!-- Descripción -->
            <div class="space-y-2">
              <h3 class="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">Descripción General</h3>
              <p class="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {{ selectedProject()?.description }}
              </p>
            </div>

            <!-- Objetivos -->
            <div class="space-y-2">
              <h3 class="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">Objetivos</h3>
              <p class="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {{ selectedProject()?.objectives }}
              </p>
            </div>

            <!-- Resultados -->
            <div class="space-y-2">
              <h3 class="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">Resultados Obtenidos</h3>
              <p class="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {{ selectedProject()?.results }}
              </p>
            </div>

            <!-- Investigadores Participantes -->
            <div class="space-y-3">
              <h3 class="text-xs font-bold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">Equipo del Proyecto</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div *ngFor="let participant of selectedProject()?.participants" 
                     class="flex items-center space-x-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 shadow-sm">
                  <div class="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 shadow-inner flex-shrink-0">
                    <img [src]="getParticipantPhotoUrl(participant.photo_url)" [alt]="participant.names" class="w-full h-full object-cover">
                  </div>
                  <div class="flex flex-col min-w-0">
                    <span class="text-slate-800 font-bold text-xs truncate leading-tight">{{ participant.names }}</span>
                    <span class="text-slate-400 font-semibold text-[10px] uppercase truncate">{{ participant.position }}</span>
                  </div>
                </div>
                
                <span *ngIf="!selectedProject()?.participants?.length" class="text-xs text-slate-400 italic">No hay investigadores asignados a este proyecto.</span>
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
export class ProjectsComponent implements OnInit {
  private http = inject(HttpClient);

  projects = signal<Project[]>([]);
  selectedProject = signal<Project | null>(null);
  isLoading = signal(true);
  searchQuery = '';

  // Filtro reactivo en base a señales y computeds
  filteredProjects = computed(() => {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) return this.projects();
    return this.projects().filter(p => 
      p.title.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query) ||
      p.objectives.toLowerCase().includes(query) ||
      p.results.toLowerCase().includes(query)
    );
  });

  ngOnInit() {
    this.fetchProjects();
  }

  fetchProjects() {
    this.isLoading.set(true);
    this.http.get<{ success: boolean; data: Project[] }>('/api/projects')
      .subscribe({
        next: (res) => {
          if (res && res.success) {
            this.projects.set(res.data);
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error al obtener catálogo de proyectos:', err);
          this.isLoading.set(false);
        }
      });
  }

  selectProject(proj: Project) {
    this.selectedProject.set(proj);
  }

  closeModal() {
    this.selectedProject.set(null);
  }

  getImageUrl(url?: string): string {
    if (!url) return '/uploads/default_project.png';
    return `/${url}`;
  }

  getParticipantPhotoUrl(url?: string): string {
    if (!url) return '/uploads/default_avatar.png';
    return `/${url}`;
  }

  getParticipantNames(project: Project): string {
    if (!project.participants || project.participants.length === 0) return 'Sin investigadores';
    return project.participants.map(p => p.names.split(' ')[0]).join(', ');
  }
}
