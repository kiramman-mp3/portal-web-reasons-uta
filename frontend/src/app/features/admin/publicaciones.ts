import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { compressImage } from '../../core/utils/image-compressor';
import { Researcher } from './investigadores';

export interface Publication {
  id: number;
  title: string;
  abstract: string;
  citation: string;
  journal_cover_url?: string;
  doi_link?: string;
  authors?: any[];
}

@Component({
  selector: 'app-admin-publications',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-8 font-sans">
      
      <!-- Encabezado -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div class="space-y-1">
          <h1 class="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">Administrar Publicaciones</h1>
          <p class="text-sm text-slate-500 font-medium">Gestiona los artículos científicos e indexaciones del grupo, asocia coautores y registra citas bibliográficas.</p>
        </div>
        <button (click)="openCreateModal()" 
                class="px-5 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md flex items-center space-x-1.5 transition-all">
          <i class="bi bi-journal-plus"></i>
          <span>Agregar Artículo</span>
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

      <!-- Tabla de Publicaciones -->
      <div *ngIf="!isLoading()" class="bg-white rounded-3xl border border-slate-200/50 shadow-premium overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th class="px-6 py-4">Portada</th>
                <th class="px-6 py-4">Artículo</th>
                <th class="px-6 py-4">Coautores</th>
                <th class="px-6 py-4">Enlace DOI</th>
                <th class="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs text-slate-600 font-medium">
              <tr *ngFor="let pub of publications()" class="hover:bg-slate-50/50 transition-colors">
                
                <!-- Portada -->
                <td class="px-6 py-4">
                  <div class="w-12 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center p-1">
                    <img [src]="getCoverUrl(pub.journal_cover_url)" [alt]="pub.title" class="max-h-full max-w-full object-contain">
                  </div>
                </td>

                <!-- Título -->
                <td class="px-6 py-4 text-slate-800 font-bold text-sm max-w-sm truncate" [title]="pub.title">
                  {{ pub.title }}
                </td>

                <!-- Coautores -->
                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-1 max-w-xs">
                    <span *ngFor="let author of pub.authors" 
                          class="px-2 py-0.5 bg-slate-100 text-slate-600 font-semibold rounded text-[10px]">
                      {{ author.names.split(' ')[0] }}
                    </span>
                    <span *ngIf="!pub.authors?.length" class="text-slate-400 italic text-[10px]">Sin asignaciones</span>
                  </div>
                </td>

                <!-- DOI -->
                <td class="px-6 py-4">
                  <a *ngIf="pub.doi_link" [href]="pub.doi_link" target="_blank" 
                     class="text-emerald-600 hover:text-emerald-700 font-bold hover:underline inline-flex items-center space-x-1">
                    <i class="bi bi-box-arrow-up-right"></i>
                    <span>Ver Artículo</span>
                  </a>
                  <span *ngIf="!pub.doi_link" class="text-slate-400 italic">No asignado</span>
                </td>

                <!-- Acciones -->
                <td class="px-6 py-4 text-right">
                  <div class="inline-flex space-x-1">
                    <button (click)="openEditModal(pub)" 
                            class="p-2 rounded-lg bg-slate-100 hover:bg-primary-light text-slate-600 hover:text-primary transition-all" 
                            title="Editar">
                      <i class="bi bi-pencil-square"></i>
                    </button>
                    <button (click)="deletePublication(pub.id)" 
                            class="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-all" 
                            title="Eliminar">
                      <i class="bi bi-trash-fill"></i>
                    </button>
                  </div>
                </td>

              </tr>

              <tr *ngIf="publications().length === 0">
                <td colspan="5" class="px-6 py-12 text-center text-slate-400 italic">
                  No hay artículos registrados. Haz clic en "Agregar Artículo".
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
              {{ isEditMode() ? 'Editar Artículo' : 'Agregar Artículo' }}
            </h2>
            <p class="text-slate-400 text-xs">Registra los datos indexados de tu publicación y asocia los coautores participantes.</p>
          </div>

          <!-- Formulario -->
          <form [formGroup]="publicationForm" (ngSubmit)="savePublication()" class="flex-grow overflow-y-auto p-6 space-y-5 min-h-0">
            
            <!-- Título -->
            <div class="space-y-1">
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Título del Artículo *</label>
              <input type="text" formControlName="title" class="admin-input-small" placeholder="Ej: Analysis of clean energy models in active operations...">
            </div>

            <!-- Resumen (Abstract) -->
            <div class="space-y-1">
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Resumen del Artículo (Abstract) *</label>
              <textarea formControlName="abstract" rows="4" class="admin-input-small resize-none" placeholder="Copia el abstract del artículo en inglés o español..."></textarea>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <!-- Cita Bibliográfica -->
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Cita Bibliográfica Completa (Estilo APA/IEEE) *</label>
                <textarea formControlName="citation" rows="3" class="admin-input-small resize-none" placeholder="Ej: Gómez, D. (2026). Analysis of clean energy... Journal of Sustainability, 12(3), 45-56."></textarea>
              </div>
              <!-- DOI Link -->
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Enlace DOI Directo</label>
                <input type="text" formControlName="doi_link" class="admin-input-small" placeholder="Ej: https://doi.org/10.1016/...">
              </div>
            </div>

            <hr class="border-slate-100">

            <!-- Checkbox de Coautores (Many to Many) -->
            <div class="space-y-3">
              <label class="text-xs font-bold text-slate-700 uppercase tracking-wider block">Equipo de Trabajo Coautor</label>
              <p class="text-[10px] text-slate-400 leading-tight">Marque los investigadores que son coautores registrados de este artículo.</p>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-40 overflow-y-auto p-2 bg-slate-50 border border-slate-150 rounded-2xl">
                <div *ngFor="let res of allResearchers()" class="flex items-center space-x-2">
                  <input type="checkbox" [id]="'author-' + res.id" 
                         [checked]="isAuthorSelected(res.id)" 
                         (change)="toggleAuthorSelection(res.id)" 
                         class="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4">
                  <label [for]="'author-' + res.id" class="text-xs font-semibold text-slate-700 cursor-pointer select-none truncate">
                    {{ res.names }}
                  </label>
                </div>

                <span *ngIf="allResearchers().length === 0" class="text-xs text-slate-400 italic p-2">No hay investigadores registrados para asignar.</span>
              </div>
            </div>

            <hr class="border-slate-100">

            <!-- Portada de Revista -->
            <div class="space-y-2">
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Portada de la Revista / Volumen</label>
              
              <div class="flex items-center gap-4">
                <div class="w-16 h-20 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-inner flex-shrink-0 flex items-center justify-center p-1.5">
                  <img [src]="coverPreviewUrl()" alt="Previsualización" class="max-h-full max-w-full object-contain">
                </div>
                <div class="space-y-1 flex-grow">
                  <input type="file" (change)="onFileSelected($event)" accept="image/*" 
                         class="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 file:cursor-pointer">
                  <p class="text-[9px] text-slate-400">JPEG, PNG o WEBP. Peso máx. 5MB.</p>
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
            <button type="button" (click)="savePublication()" [disabled]="publicationForm.invalid || isSaving()"
                    class="px-5 py-2.5 bg-primary hover:bg-primary-hover disabled:bg-slate-300 text-white text-xs font-bold rounded-lg transition-all shadow-md">
              {{ isSaving() ? 'Guardando...' : 'Guardar Artículo' }}
            </button>
          </div>

        </div>
      </div>

    </div>
  `
})

export class AdminPublicationsComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  publications = signal<Publication[]>([]);
  allResearchers = signal<Researcher[]>([]);
  isLoading = signal(true);

  // Modal
  isModalOpen = signal(false);
  isEditMode = signal(false);
  isSaving = signal(false);
  publicationForm!: FormGroup;

  // Portada
  selectedFile: File | null = null;
  coverPreviewUrl = signal<string>('/uploads/default_journal.png');

  // Coautores
  selectedAuthorIds = signal<number[]>([]);

  // Alertas
  alertMessage = signal('');
  alertType = signal<'success' | 'error'>('success');

  editingId: number | null = null;

  ngOnInit() {
    this.initForm();
    this.fetchPublicationsAndResearchers();
  }

  private initForm() {
    this.publicationForm = this.fb.group({
      title: ['', [Validators.required]],
      abstract: ['', [Validators.required]],
      citation: ['', [Validators.required]],
      doi_link: ['']
    });
  }

  fetchPublicationsAndResearchers() {
    this.isLoading.set(true);

    this.http.get<{ success: boolean; data: Researcher[] }>('/api/researchers')
      .subscribe({
        next: (res) => {
          if (res && res.success) {
            this.allResearchers.set(res.data);
          }
        }
      });

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

  getCoverUrl(url?: string): string {
    if (!url) return '/uploads/default_journal.png';
    return `/${url}`;
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      try {
        console.log('Tamaño original (Publicación):', (file.size / 1024).toFixed(1), 'KB');
        const compressed = await compressImage(file, 800, 1000, 0.75); // Portadas verticales
        console.log('Tamaño comprimido (Publicación):', (compressed.size / 1024).toFixed(1), 'KB');
        
        this.selectedFile = compressed;
        
        const reader = new FileReader();
        reader.onload = () => {
          this.coverPreviewUrl.set(reader.result as string);
        };
        reader.readAsDataURL(compressed);
      } catch (err) {
        console.error('Error al comprimir la portada de la revista:', err);
        this.selectedFile = file; // Fallback al original
      }
    }
  }

  // Modales
  openCreateModal() {
    this.isEditMode.set(false);
    this.publicationForm.reset();
    this.selectedFile = null;
    this.selectedAuthorIds.set([]);
    this.coverPreviewUrl.set('/uploads/default_journal.png');
    this.isModalOpen.set(true);
  }

  openEditModal(pub: Publication) {
    this.isEditMode.set(true);
    this.editingId = pub.id;
    this.selectedFile = null;

    this.publicationForm.patchValue({
      title: pub.title,
      abstract: pub.abstract,
      citation: pub.citation,
      doi_link: pub.doi_link || ''
    });

    const coauthorIds = pub.authors ? pub.authors.map(a => a.id) : [];
    this.selectedAuthorIds.set(coauthorIds);

    this.coverPreviewUrl.set(this.getCoverUrl(pub.journal_cover_url));
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

  // Coautores
  isAuthorSelected(id: number): boolean {
    return this.selectedAuthorIds().includes(id);
  }

  toggleAuthorSelection(id: number) {
    const current = this.selectedAuthorIds();
    if (current.includes(id)) {
      this.selectedAuthorIds.set(current.filter(x => x !== id));
    } else {
      this.selectedAuthorIds.set([...current, id]);
    }
  }

  // Guardar (POST / PUT)
  savePublication() {
    if (this.publicationForm.invalid) return;

    this.isSaving.set(true);

    const formData = new FormData();
    const values = this.publicationForm.value;

    Object.keys(values).forEach(key => {
      formData.append(key, values[key] || '');
    });

    formData.append('author_ids', JSON.stringify(this.selectedAuthorIds()));

    if (this.selectedFile) {
      formData.append('cover', this.selectedFile);
    }

    const url = this.isEditMode()
      ? `/api/publications/${this.editingId}`
      : '/api/publications';

    const request$ = this.isEditMode()
      ? this.http.put<{ success: boolean; message: string }>(url, formData)
      : this.http.post<{ success: boolean; message: string }>(url, formData);

    request$.subscribe({
      next: (res) => {
        if (res && res.success) {
          this.showAlert(res.message, 'success');
          this.fetchPublicationsAndResearchers();
          this.closeModal();
        } else {
          this.showAlert('No se pudo guardar el artículo.', 'error');
        }
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Error al guardar artículo:', err);
        const errorMsg = err.error?.message || 'Error de conexión con el servidor.';
        this.showAlert(errorMsg, 'error');
        this.isSaving.set(false);
      }
    });
  }

  // Eliminar
  deletePublication(id: number) {
    if (!confirm('¿Está seguro de eliminar permanentemente este artículo científico?')) return;

    this.http.delete<{ success: boolean; message: string }>(`/api/publications/${id}`)
      .subscribe({
        next: (res) => {
          if (res && res.success) {
            this.showAlert(res.message, 'success');
            this.fetchPublicationsAndResearchers();
          } else {
            this.showAlert('No se pudo eliminar el artículo.', 'error');
          }
        },
        error: (err) => {
          console.error('Error al eliminar publicación:', err);
          this.showAlert('Error al conectar con la API para eliminar el recurso.', 'error');
        }
      });
  }
}
