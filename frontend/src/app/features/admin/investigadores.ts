import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { compressImage } from '../../core/utils/image-compressor';

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
  selector: 'app-admin-researchers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-8 font-sans">
      
      <!-- Encabezado de Sección -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div class="space-y-1">
          <h1 class="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">Administrar Investigadores</h1>
          <p class="text-sm text-slate-500 font-medium">Gestiona el listado del equipo de trabajo, asigna roles, edita biografías y enlaces de investigación.</p>
        </div>
        <button (click)="openCreateModal()" 
                class="px-5 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md flex items-center space-x-1.5 transition-all">
          <i class="bi bi-person-plus-fill"></i>
          <span>Agregar Investigador</span>
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

      <!-- Tabla de Datos (Responsivo) -->
      <div *ngIf="!isLoading()" class="bg-white rounded-3xl border border-slate-200/50 shadow-premium overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th class="px-6 py-4">Foto</th>
                <th class="px-6 py-4">Investigador</th>
                <th class="px-6 py-4">Posición / Rol</th>
                <th class="px-6 py-4">Correo Institucional</th>
                <th class="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs text-slate-600 font-medium">
              <tr *ngFor="let res of researchers()" class="hover:bg-slate-50/50 transition-colors">
                
                <!-- Foto -->
                <td class="px-6 py-4">
                  <div class="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-50 flex items-center justify-center">
                    <img [src]="getPhotoUrl(res.photo_url)" [alt]="res.names" class="w-full h-full object-cover">
                  </div>
                </td>

                <!-- Nombre -->
                <td class="px-6 py-4 text-slate-800 font-bold text-sm">
                  {{ res.names }}
                </td>

                <!-- Posición -->
                <td class="px-6 py-4">
                  <span class="inline-block px-2.5 py-1 bg-secondary-light text-secondary font-bold rounded-full uppercase text-[10px]">
                    {{ res.position }}
                  </span>
                </td>

                <!-- Correo -->
                <td class="px-6 py-4 font-semibold text-slate-500">
                  {{ res.institutional_email }}
                </td>

                <!-- Acciones -->
                <td class="px-6 py-4 text-right">
                  <div class="inline-flex space-x-1">
                    <button (click)="openEditModal(res)" 
                            class="p-2 rounded-lg bg-slate-100 hover:bg-primary-light text-slate-600 hover:text-primary transition-all" 
                            title="Editar">
                      <i class="bi bi-pencil-square"></i>
                    </button>
                    <button (click)="deleteResearcher(res.id)" 
                            class="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-all" 
                            title="Eliminar">
                      <i class="bi bi-trash-fill"></i>
                    </button>
                  </div>
                </td>

              </tr>

              <tr *ngIf="researchers().length === 0">
                <td colspan="5" class="px-6 py-12 text-center text-slate-400 italic">
                  No hay investigadores registrados. Haz clic en "Agregar Investigador".
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL CREACIÓN / EDICIÓN -->
      <div *ngIf="isModalOpen()" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" (click)="closeModal()"></div>

        <!-- Ventana Modal -->
        <div class="relative bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-in border border-slate-100 flex flex-col max-h-[90vh]">
          
          <button (click)="closeModal()" class="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all shadow-sm">
            <i class="bi bi-x-lg"></i>
          </button>

          <!-- Cabecera -->
          <div class="p-6 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
            <h2 class="text-xl font-extrabold text-slate-800 tracking-tight">
              {{ isEditMode() ? 'Editar Investigador' : 'Agregar Investigador' }}
            </h2>
            <p class="text-slate-400 text-xs">Completa la ficha profesional y guarda los cambios en el sistema.</p>
          </div>

          <!-- Formulario -->
          <form [formGroup]="researcherForm" (ngSubmit)="saveResearcher()" class="flex-grow overflow-y-auto p-6 space-y-5 min-h-0">
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <!-- Nombres -->
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Nombres y Apellidos *</label>
                <input type="text" formControlName="names" class="admin-input-small" placeholder="Ej: Diana Elizabeth Gómez">
              </div>
              <!-- Correo -->
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Correo Institucional *</label>
                <input type="email" formControlName="institutional_email" class="admin-input-small" placeholder="Ej: dgomez@uta.edu.ec">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <!-- Posición -->
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Posición en el Grupo *</label>
                <input type="text" formControlName="position" class="admin-input-small" placeholder="Ej: Investigador Principal">
              </div>
              <!-- ORCID -->
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Enlace ORCID</label>
                <input type="text" formControlName="orcid_link" class="admin-input-small" placeholder="Ej: https://orcid.org/0000-...">
              </div>
            </div>

            <!-- Biografía -->
            <div class="space-y-1">
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Biografía Profesional *</label>
              <textarea formControlName="bio" rows="4" class="admin-input-small resize-none" placeholder="Escriba un extracto de su perfil académico, títulos y áreas de interés..."></textarea>
            </div>

            <hr class="border-slate-100">

            <div class="text-xs font-bold text-slate-700 uppercase tracking-wider">Enlaces de Redes Sociales (Opcional)</div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Facebook Link</label>
                <input type="text" formControlName="facebook_link" class="admin-input-small">
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">LinkedIn Link</label>
                <input type="text" formControlName="linkedin_link" class="admin-input-small">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Instagram Link</label>
                <input type="text" formControlName="instagram_link" class="admin-input-small">
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Telegram Link</label>
                <input type="text" formControlName="telegram_link" class="admin-input-small">
              </div>
            </div>

            <hr class="border-slate-100">

            <!-- Subida de Foto -->
            <div class="space-y-2">
              <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Foto de Perfil (Tamaño sugerido 5x5 cm)</label>
              
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-inner flex-shrink-0 flex items-center justify-center">
                  <img [src]="photoPreviewUrl()" alt="Previsualización" class="w-full h-full object-cover">
                </div>
                <div class="space-y-1 flex-grow">
                  <input type="file" (change)="onFileSelected($event)" accept="image/*" 
                         class="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 file:cursor-pointer">
                  <p class="text-[9px] text-slate-400">Solo imágenes en formato JPEG, PNG o WEBP. Peso máx. 5MB.</p>
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
            <button type="button" (click)="saveResearcher()" [disabled]="researcherForm.invalid || isSaving()"
                    class="px-5 py-2.5 bg-primary hover:bg-primary-hover disabled:bg-slate-300 text-white text-xs font-bold rounded-lg transition-all shadow-md">
              {{ isSaving() ? 'Guardando...' : 'Guardar Ficha' }}
            </button>
          </div>

        </div>

      </div>

    </div>
  `
})

export class AdminResearchersComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  researchers = signal<Researcher[]>([]);
  isLoading = signal(true);

  // Modal
  isModalOpen = signal(false);
  isEditMode = signal(false);
  isSaving = signal(false);
  researcherForm!: FormGroup;

  // Foto
  selectedFile: File | null = null;
  photoPreviewUrl = signal<string>('/uploads/default_avatar.png');

  // Alertas
  alertMessage = signal('');
  alertType = signal<'success' | 'error'>('success');

  editingId: number | null = null;

  ngOnInit() {
    this.initForm();
    this.fetchResearchers();
  }

  private initForm() {
    this.researcherForm = this.fb.group({
      names: ['', [Validators.required]],
      orcid_link: [''],
      facebook_link: [''],
      linkedin_link: [''],
      instagram_link: [''],
      telegram_link: [''],
      institutional_email: ['', [Validators.required, Validators.email]],
      bio: ['', [Validators.required]],
      position: ['', [Validators.required]]
    });
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

  getPhotoUrl(url?: string): string {
    if (!url) return '/uploads/default_avatar.png';
    return `/${url}`;
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      try {
        console.log('Tamaño original:', (file.size / 1024).toFixed(1), 'KB');
        const compressed = await compressImage(file, 800, 800, 0.8); // 800x800 es excelente para fotos de perfil 5x5
        console.log('Tamaño comprimido:', (compressed.size / 1024).toFixed(1), 'KB');
        
        this.selectedFile = compressed;
        
        // Crear preview local
        const reader = new FileReader();
        reader.onload = () => {
          this.photoPreviewUrl.set(reader.result as string);
        };
        reader.readAsDataURL(compressed);
      } catch (err) {
        console.error('Error al comprimir la imagen:', err);
        this.selectedFile = file; // Fallback al original
      }
    }
  }

  // Modales
  openCreateModal() {
    this.isEditMode.set(false);
    this.researcherForm.reset();
    this.selectedFile = null;
    this.photoPreviewUrl.set('/uploads/default_avatar.png');
    this.isModalOpen.set(true);
  }

  openEditModal(res: Researcher) {
    this.isEditMode.set(true);
    this.editingId = res.id;
    this.selectedFile = null;
    
    this.researcherForm.patchValue({
      names: res.names,
      orcid_link: res.orcid_link || '',
      facebook_link: res.facebook_link || '',
      linkedin_link: res.linkedin_link || '',
      instagram_link: res.instagram_link || '',
      telegram_link: res.telegram_link || '',
      institutional_email: res.institutional_email,
      bio: res.bio,
      position: res.position
    });

    this.photoPreviewUrl.set(this.getPhotoUrl(res.photo_url));
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

  // Guardar datos (Crear / Actualizar con FormData)
  saveResearcher() {
    if (this.researcherForm.invalid) return;

    this.isSaving.set(true);

    const formData = new FormData();
    const values = this.researcherForm.value;

    Object.keys(values).forEach(key => {
      formData.append(key, values[key] || '');
    });

    if (this.selectedFile) {
      formData.append('photo', this.selectedFile);
    }

    const url = this.isEditMode() 
      ? `/api/researchers/${this.editingId}` 
      : '/api/researchers';

    const request$ = this.isEditMode()
      ? this.http.put<{ success: boolean; message: string }>(url, formData)
      : this.http.post<{ success: boolean; message: string }>(url, formData);

    request$.subscribe({
      next: (res) => {
        if (res && res.success) {
          this.showAlert(res.message, 'success');
          this.fetchResearchers();
          this.closeModal();
        } else {
          this.showAlert('No se pudo guardar la ficha del investigador.', 'error');
        }
        this.isSaving.set(false);
      },
      error: (err) => {
        console.error('Error al guardar investigador:', err);
        const errorMsg = err.error?.message || 'Error de conexión con el servidor.';
        this.showAlert(errorMsg, 'error');
        this.isSaving.set(false);
      }
    });
  }

  // Eliminar
  deleteResearcher(id: number) {
    if (!confirm('¿Está completamente seguro de eliminar a este investigador? Esta acción también lo removerá de sus proyectos asociados y es irreversible.')) return;

    this.http.delete<{ success: boolean; message: string }>(`/api/researchers/${id}`)
      .subscribe({
        next: (res) => {
          if (res && res.success) {
            this.showAlert(res.message, 'success');
            this.fetchResearchers();
          } else {
            this.showAlert('No se pudo eliminar el investigador.', 'error');
          }
        },
        error: (err) => {
          console.error('Error al eliminar investigador:', err);
          this.showAlert('Error al conectar con la API para eliminar el recurso.', 'error');
        }
      });
  }
}
