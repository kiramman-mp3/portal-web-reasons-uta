import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { compressImage } from '../../core/utils/image-compressor';
import { Researcher } from './investigadores';

export interface Project {
  id: number;
  title: string;
  description: string;
  objectives: string;
  results: string;
  image_url?: string;
  participants?: any[];
}

@Component({
  selector: 'app-admin-projects',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-8 font-sans">
      
      <!-- Encabezado -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div class="space-y-1">
          <h1 class="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">Administrar Proyectos</h1>
          <p class="text-sm text-slate-500 font-medium">Gestiona el catálogo de proyectos de investigación, asocia participantes del equipo y edita objetivos y resultados.</p>
        </div>
        <button (click)="openCreateModal()" 
                class="px-5 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md flex items-center space-x-1.5 transition-all">
          <i class="bi bi-folder-plus"></i>
          <span>Agregar Proyecto</span>
        </button>
      </div>

      <!-- Alertas -->
      <div *ngIf="alertMessage()" 
           [ngClass]="alertType() === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'"
           class="p-4 border text-sm font-semibold rounded-2xl flex items-center space-x-3 shadow-sm animate-scale-in">
        <i class="bi" [ngClass]="alertType() === 'success' ? 'bi-patch-check-fill text-emerald-500' : 'bi-exclamation-triangle-fill text-red-500'" class="text-xl"></i>
        <span>{{ alertMessage() }}</span>
      </div>

      <!-- Spinner -->
      <div *ngIf="isLoading()" class="flex justify-center py-20 bg-white rounded-3xl border border-slate-200/50 shadow-premium">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <!-- Tabla de Proyectos -->
      <div *ngIf="!isLoading()" class="bg-white rounded-3xl border border-slate-200/50 shadow-premium overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th class="px-6 py-4">Portada</th>
                <th class="px-6 py-4">Proyecto</th>
                <th class="px-6 py-4">Participantes</th>
                <th class="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs text-slate-600 font-medium">
              <tr *ngFor="let proj of projects()" class="hover:bg-slate-50/50 transition-colors">
                
                <!-- Portada -->
                <td class="px-6 py-4">
                  <div class="w-20 h-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                    <img [src]="getImageUrl(proj.image_url)" [alt]="proj.title" class="w-full h-full object-cover">
                  </div>
                </td>

                <!-- Título -->
                <td class="px-6 py-4 text-slate-800 font-bold text-sm max-w-sm truncate" [title]="proj.title">
                  {{ proj.title }}
                </td>

                <!-- Participantes -->
                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-1 max-w-xs">
                    <span *ngFor="let part of proj.participants" 
                          class="px-2 py-0.5 bg-slate-100 text-slate-600 font-semibold rounded text-[10px]">
                      {{ part.names.split(' ')[0] }}
                    </span>
                    <span *ngIf="!proj.participants?.length" class="text-slate-400 italic text-[10px]">Sin asignaciones</span>
                  </div>
                </td>

                <!-- Acciones -->
                <td class="px-6 py-4 text-right">
                  <div class="inline-flex space-x-1">
                    <button (click)="openEditModal(proj)" 
                            class="p-2 rounded-lg bg-slate-100 hover:bg-primary-light text-slate-600 hover:text-primary transition-all" 
                            title="Editar">
                      <i class="bi bi-pencil-square"></i>
                    </button>
                    <button (click)="deleteProject(proj.id)" 
                            class="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-all" 
                            title="Eliminar">
                      <i class="bi bi-trash-fill"></i>
                    </button>
                  </div>
                </td>

              </tr>

              <tr *ngIf="projects().length === 0">
                <td colspan="4" class="px-6 py-12 text-center text-slate-400 italic">
                  No hay proyectos registrados. Haz clic en "Agregar Proyecto".
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL CREACIÓN / EDICIÓN -->
      <div *ngIf="isModalOpen()" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" (click)="closeModal()"></div>

        <!-- Ventana Modal -->
        <div class="relative bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-in border border-slate-100 flex flex-col max-h-[90vh]">
          
          <button (click)="closeModal()" class="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all shadow-sm">
            <i class="bi bi-x-lg"></i>
          </button>

          <!-- Cabecera -->
          <div class="p-6 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
            <h2 class="text-xl font-extrabold text-slate-800 tracking-tight">
              {{ isEditMode() ? 'Editar Proyecto' : 'Agregar Proyecto' }}
            </h2>
            <p class="text-slate-400 text-xs">Registra los alcances, objetivos, resultados y equipo coautor de tu investigación.</p>
          </div>

          <!-- Formulario -->
          <form [formGroup]="projectForm" (ngSubmit)="saveProject()" class="flex-grow overflow-y-auto p-6 space-y-5 min-h-0">
            
            <!-- Título -->
            <div class="space-y-1">
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Título del Proyecto *</label>
              <input type="text" formControlName="title" class="admin-input-small" placeholder="Ej: Optimización de sistemas de micro-redes de energías renovables">
            </div>

            <!-- Descripción -->
            <div class="space-y-1">
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Descripción del Proyecto *</label>
              <textarea formControlName="description" rows="3" class="admin-input-small resize-none" placeholder="Extracto de los fundamentos de la investigación..."></textarea>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <!-- Objetivos -->
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Objetivos del Proyecto *</label>
                <textarea formControlName="objectives" rows="4" class="admin-input-small resize-none" placeholder="Describa los alcances u objetivos..."></textarea>
              </div>
              <!-- Resultados -->
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Resultados y Conclusiones *</label>
                <textarea formControlName="results" rows="4" class="admin-input-small resize-none" placeholder="Describa los impactos, publicaciones o patentes logradas..."></textarea>
              </div>
            </div>

            <hr class="border-slate-100">

            <!-- Checkbox de Coautores (Many to Many) -->
            <div class="space-y-3">
              <label class="text-xs font-bold text-slate-700 uppercase tracking-wider block">Equipo de Trabajo Asignado</label>
              <p class="text-[10px] text-slate-400 leading-tight">Marque los investigadores que son autores principales o colaboradores directos de esta iniciativa.</p>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-40 overflow-y-auto p-2 bg-slate-50 border border-slate-150 rounded-2xl">
                <div *ngFor="let res of allResearchers()" class="flex items-center space-x-2">
                  <input type="checkbox" [id]="'res-' + res.id" 
                         [checked]="isResearcherSelected(res.id)" 
                         (change)="toggleResearcherSelection(res.id)" 
                         class="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4">
                  <label [for]="'res-' + res.id" class="text-xs font-semibold text-slate-700 cursor-pointer select-none truncate">
                    {{ res.names }}
                  </label>
                </div>

                <span *ngIf="allResearchers().length === 0" class="text-xs text-slate-400 italic p-2">No hay investigadores registrados para asignar.</span>
              </div>
            </div>

            <hr class="border-slate-100">

            <!-- Portada de Imagen -->
            <div class="space-y-2">
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Imagen de Portada / Banner</label>
              
              <div class="flex items-center gap-4">
                <div class="w-20 h-12 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-inner flex-shrink-0 flex items-center justify-center">
                  <img [src]="imagePreviewUrl()" alt="Previsualización" class="w-full h-full object-cover">
                </div>
                <div class="space-y-1 flex-grow">
                  <input type="file" (change)="onFileSelected($event)" accept="image/*" 
                         class="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 file:cursor-pointer">
                  <p class="text-[9px] text-slate-400">JPEG, PNG o WEBP. Límite estricto 5MB.</p>
                </div>
              </div>
            </div>

          </form>

          <!-- Footer del Modal -->
          <div class="bg-slate-50 border-t border-slate-100 px-6 py-4 flex-shrink-0 flex justify-end space-x-2">
            <button type="button" (click)="closeModal()" 
                    class="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-lg transition-all shadow-sm">
              Cancelar
            </button>
            <button type="button" (click)="saveProject()" [disabled]="projectForm.invalid || isSaving()"
                    class="px-5 py-2.5 bg-primary hover:bg-primary-hover disabled:bg-slate-300 text-white text-xs font-bold rounded-lg transition-all shadow-md">
              {{ isSaving() ? 'Guardando...' : 'Guardar Proyecto' }}
            </button>
          </div>

        </div>
      </div>

    </div>
  `
})

export class AdminProjectsComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  projects = signal<Project[]>([]);
  allResearchers = signal<Researcher[]>([]);
  isLoading = signal(true);

  // Modal
  isModalOpen = signal(false);
  isEditMode = signal(false);
  isSaving = signal(false);
  projectForm!: FormGroup;

  // Foto
  selectedFile: File | null = null;
  imagePreviewUrl = signal<string>('/uploads/default_project.png');

  // Relacional coautores
  selectedResearcherIds = signal<number[]>([]);

  // Alertas
  alertMessage = signal('');
  alertType = signal<'success' | 'error'>('success');

  editingId: number | null = null;

  ngOnInit() {
    this.initForm();
    this.fetchProjectsAndResearchers();
  }

  private initForm() {
    this.projectForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      objectives: ['', [Validators.required]],
      results: ['', [Validators.required]]
    });
  }

  fetchProjectsAndResearchers() {
    this.isLoading.set(true);

    // Cargar proyectos e investigadores en paralelo
    this.http.get<{ success: boolean; data: Researcher[] }>('/api/researchers')
      .subscribe({
        next: (res) => {
          if (res && res.success) {
            this.allResearchers.set(res.data);
          }
        }
      });

    this.http.get<{ success: boolean; data: Project[] }>('/api/projects')
      .subscribe({
        next: (res) => {
          if (res && res.success) {
            this.projects.set(res.data);
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error al obtener proyectos:', err);
          this.isLoading.set(false);
        }
      });
  }

  getImageUrl(url?: string): string {
    if (!url) return '/uploads/default_project.png';
    return `/${url}`;
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      try {
        console.log('Tamaño original (Proyecto):', (file.size / 1024).toFixed(1), 'KB');
        const compressed = await compressImage(file, 1200, 800, 0.75); // Banners horizontales
        console.log('Tamaño comprimido (Proyecto):', (compressed.size / 1024).toFixed(1), 'KB');
        
        this.selectedFile = compressed;
        
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreviewUrl.set(reader.result as string);
        };
        reader.readAsDataURL(compressed);
      } catch (err) {
        console.error('Error al comprimir la imagen del proyecto:', err);
        this.selectedFile = file; // Fallback al original
      }
    }
  }

  // Modales
  openCreateModal() {
    this.isEditMode.set(false);
    this.projectForm.reset();
    this.selectedFile = null;
    this.selectedResearcherIds.set([]);
    this.imagePreviewUrl.set('/uploads/default_project.png');
    this.isModalOpen.set(true);
  }

  openEditModal(proj: Project) {
    this.isEditMode.set(true);
    this.editingId = proj.id;
    this.selectedFile = null;

    this.projectForm.patchValue({
      title: proj.title,
      description: proj.description,
      objectives: proj.objectives,
      results: proj.results
    });

    const participantIds = proj.participants ? proj.participants.map(p => p.id) : [];
    this.selectedResearcherIds.set(participantIds);

    this.imagePreviewUrl.set(this.getImageUrl(proj.image_url));
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  showAlert(message: string, type: 'success' | 'error') {
    this.alertMessage.set(message);
    this.alertType.set(type);

    setTimeout(() => {
      this.alertMessage.set('');
    }, 4000);
  }

  // Selección de coautores
  isResearcherSelected(id: number): boolean {
    return this.selectedResearcherIds().includes(id);
  }

  toggleResearcherSelection(id: number) {
    const current = this.selectedResearcherIds();
    if (current.includes(id)) {
      this.selectedResearcherIds.set(current.filter(x => x !== id));
    } else {
      this.selectedResearcherIds.set([...current, id]);
    }
  }

  // Guardar (POST / PUT)
  saveProject() {
    if (this.projectForm.invalid) return;

    this.isSaving.set(true);

    const formData = new FormData();
    const values = this.projectForm.value;

    Object.keys(values).forEach(key => {
      formData.append(key, values[key] || '');
    });

    // Añadir coautores como array en JSON stringificado
    formData.append('researcher_ids', JSON.stringify(this.selectedResearcherIds()));

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    const url = this.isEditMode()
      ? `/api/projects/${this.editingId}`
      : '/api/projects';

    const request$ = this.isEditMode()
      ? this.http.put<{ success: boolean; message: string }>(url, formData)
      : this.http.post<{ success: boolean; message: string }>(url, formData);

    request$.subscribe({
      next: (res) => {
        if (res && res.success) {
          this.showAlert(res.message, 'success');
          this.fetchProjectsAndResearchers();
          this.closeModal();
        } else {
          this.showAlert('No se pudo guardar la ficha del proyecto.', 'error');
        }
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Error al guardar proyecto:', err);
        const errorMsg = err.error?.message || 'Error de conexión con el servidor.';
        this.showAlert(errorMsg, 'error');
        this.isSaving.set(false);
      }
    });
  }

  // Eliminar
  deleteProject(id: number) {
    if (!confirm('¿Está seguro de eliminar permanentemente este proyecto?')) return;

    this.http.delete<{ success: boolean; message: string }>(`/api/projects/${id}`)
      .subscribe({
        next: (res) => {
          if (res && res.success) {
            this.showAlert(res.message, 'success');
            this.fetchProjectsAndResearchers();
          } else {
            this.showAlert('No se pudo eliminar el proyecto.', 'error');
          }
        },
        error: (err) => {
          console.error('Error al eliminar proyecto:', err);
          this.showAlert('Error al conectar con la API para eliminar el proyecto.', 'error');
        }
      });
  }
}
