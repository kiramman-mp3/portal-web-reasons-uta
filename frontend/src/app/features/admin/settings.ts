import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { ConfigService, SiteSettings } from '../../core/services/config.service';
import { compressImage } from '../../core/utils/image-compressor';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-8 font-sans">
      
      <!-- Encabezado de Página -->
      <div class="space-y-1">
        <h1 class="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">Configurar Portal REASONS</h1>
        <p class="text-sm text-slate-500 font-medium">Gestiona los colores institucionales, el logotipo, la misión, visión, objetivos y líneas de investigación del portal.</p>
      </div>

      <!-- Alertas de Guardado -->
      <div *ngIf="messageStatus() === 'success'" 
           class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold rounded-2xl flex items-center space-x-3 shadow-sm animate-scale-in">
        <i class="bi bi-patch-check-fill text-xl text-emerald-500"></i>
        <span>{{ statusMessage() }}</span>
      </div>

      <div *ngIf="messageStatus() === 'error'" 
           class="p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-2xl flex items-center space-x-3 shadow-sm animate-scale-in">
        <i class="bi bi-exclamation-triangle-fill text-xl text-red-500"></i>
        <span>{{ statusMessage() }}</span>
      </div>

      <!-- Tabs Navegación Interna -->
      <div class="flex border-b border-slate-200 gap-1.5 flex-wrap">
        <button (click)="activeTab.set('general')" 
                class="px-5 py-3 text-sm font-bold border-b-2 transition-all"
                [ngClass]="activeTab() === 'general' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'">
          Información General
        </button>
        <button (click)="activeTab.set('appearance')" 
                class="px-5 py-3 text-sm font-bold border-b-2 transition-all"
                [ngClass]="activeTab() === 'appearance' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'">
          Colores y Logotipo
        </button>
        <button (click)="activeTab.set('objectives')" 
                class="px-5 py-3 text-sm font-bold border-b-2 transition-all"
                [ngClass]="activeTab() === 'objectives' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'">
          Objetivos Específicos
        </button>
        <button (click)="activeTab.set('lines')" 
                class="px-5 py-3 text-sm font-bold border-b-2 transition-all"
                [ngClass]="activeTab() === 'lines' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'">
          Líneas de Investigación
        </button>
        <button (click)="activeTab.set('carousel')" 
                class="px-5 py-3 text-sm font-bold border-b-2 transition-all"
                [ngClass]="activeTab() === 'carousel' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'">
          Carrusel de Portada
        </button>
      </div>

      <!-- FORMULARIO PRINCIPAL -->
      <form *ngIf="activeTab() !== 'carousel'" [formGroup]="settingsForm" (ngSubmit)="saveSettings()" class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/50 shadow-premium space-y-6">
        
        <!-- ==================== TAB 1: INFORMACIÓN GENERAL ==================== -->
        <div *ngIf="activeTab() === 'general'" class="space-y-6 animate-scale-in">
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-1.5">
              <label for="group_name" class="text-xs font-bold text-slate-700 uppercase tracking-wider">Nombre del Grupo *</label>
              <input type="text" id="group_name" formControlName="group_name" class="admin-input">
            </div>
            <div class="space-y-1.5">
              <label for="institution" class="text-xs font-bold text-slate-700 uppercase tracking-wider">Institución *</label>
              <input type="text" id="institution" formControlName="institution" class="admin-input">
            </div>
          </div>

          <div class="space-y-1.5">
            <label for="description" class="text-xs font-bold text-slate-700 uppercase tracking-wider">Descripción del Grupo (Muestra en Home y Footer) *</label>
            <textarea id="description" formControlName="description" rows="3" class="admin-input resize-none"></textarea>
          </div>

          <div class="space-y-1.5">
            <label for="objective_general" class="text-xs font-bold text-slate-700 uppercase tracking-wider">Objetivo General *</label>
            <textarea id="objective_general" formControlName="objective_general" rows="3" class="admin-input resize-none"></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-1.5">
              <label for="mission" class="text-xs font-bold text-slate-700 uppercase tracking-wider">Misión *</label>
              <textarea id="mission" formControlName="mission" rows="4" class="admin-input resize-none"></textarea>
            </div>
            <div class="space-y-1.5">
              <label for="vision" class="text-xs font-bold text-slate-700 uppercase tracking-wider">Visión *</label>
              <textarea id="vision" formControlName="vision" rows="4" class="admin-input resize-none"></textarea>
            </div>
          </div>

          <hr class="border-slate-100">

          <div class="text-slate-800 font-bold text-sm uppercase tracking-wider mb-4">Datos de Contacto</div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="space-y-1.5 md:col-span-2">
              <label for="contact_address" class="text-xs font-bold text-slate-700 uppercase tracking-wider">Dirección Física *</label>
              <input type="text" id="contact_address" formControlName="contact_address" class="admin-input">
            </div>
            <div class="space-y-1.5">
              <label for="contact_email" class="text-xs font-bold text-slate-700 uppercase tracking-wider">Email de Contacto *</label>
              <input type="email" id="contact_email" formControlName="contact_email" class="admin-input">
            </div>
          </div>

          <div class="space-y-1.5">
            <label for="contact_location" class="text-xs font-bold text-slate-700 uppercase tracking-wider">Ubicación (Ciudad/País) *</label>
            <input type="text" id="contact_location" formControlName="contact_location" class="admin-input">
          </div>

        </div>

        <!-- ==================== TAB 2: APARIENCIA (COLORES Y LOGO) ==================== -->
        <div *ngIf="activeTab() === 'appearance'" class="space-y-8 animate-scale-in">
          
          <!-- SECCIÓN COLORES -->
          <div class="space-y-4">
            <h3 class="text-slate-800 font-bold text-sm uppercase tracking-wider border-b border-slate-100 pb-2">Paleta de Colores Corporativos</h3>
            <p class="text-slate-500 text-xs">Usa los selectores visuales de color. Al guardar, todo el portal adoptará estos tonos dinámicamente.</p>
            
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              
              <!-- Color Primario -->
              <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center space-x-4">
                <input type="color" id="primary_color" formControlName="primary_color" 
                       class="w-12 h-12 rounded-xl cursor-pointer border-0 p-0 shadow-sm overflow-hidden flex-shrink-0">
                <div class="flex flex-col min-w-0">
                  <span class="text-slate-700 font-bold text-xs uppercase">Color Primario</span>
                  <span class="text-slate-400 font-mono text-[10px]">{{ settingsForm.get('primary_color')?.value }}</span>
                </div>
              </div>

              <!-- Color Secundario -->
              <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center space-x-4">
                <input type="color" id="secondary_color" formControlName="secondary_color" 
                       class="w-12 h-12 rounded-xl cursor-pointer border-0 p-0 shadow-sm overflow-hidden flex-shrink-0">
                <div class="flex flex-col min-w-0">
                  <span class="text-slate-700 font-bold text-xs uppercase">Color Secundario</span>
                  <span class="text-slate-400 font-mono text-[10px]">{{ settingsForm.get('secondary_color')?.value }}</span>
                </div>
              </div>

              <!-- Color de Acento -->
              <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center space-x-4">
                <input type="color" id="accent_color" formControlName="accent_color" 
                       class="w-12 h-12 rounded-xl cursor-pointer border-0 p-0 shadow-sm overflow-hidden flex-shrink-0">
                <div class="flex flex-col min-w-0">
                  <span class="text-slate-700 font-bold text-xs uppercase">Color de Acento</span>
                  <span class="text-slate-400 font-mono text-[10px]">{{ settingsForm.get('accent_color')?.value }}</span>
                </div>
              </div>

            </div>
          </div>

          <!-- SECCIÓN LOGOTIPO -->
          <div class="space-y-4 pt-4 border-t border-slate-100">
            <h3 class="text-slate-800 font-bold text-sm uppercase tracking-wider">Logotipo Institucional</h3>
            
            <div class="flex flex-col sm:flex-row items-center gap-6">
              
              <!-- Vista previa actual -->
              <div class="w-32 h-32 bg-slate-50 border border-slate-200/50 rounded-2xl flex items-center justify-center p-3 shadow-inner flex-shrink-0">
                <img [src]="config.logoUrl()" alt="Logo Actual" class="max-h-full max-w-full object-contain">
              </div>

              <!-- Formulario de subida -->
              <div class="space-y-3 flex-grow text-center sm:text-left">
                <span class="text-xs font-bold text-slate-700 uppercase tracking-wider block">Subir Nuevo Logotipo</span>
                <input type="file" (change)="onLogoFileSelected($event)" accept="image/*" 
                       class="block w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary-light file:text-primary hover:file:bg-primary-light/80 file:cursor-pointer">
                <p class="text-[10px] text-slate-400">Se recomiendan imágenes PNG transparentes cuadradas de hasta 2MB.</p>
                
                <button type="button" *ngIf="selectedLogoFile" (click)="uploadLogo()" [disabled]="isUploadingLogo()"
                        class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-bold rounded-lg shadow transition-all">
                  {{ isUploadingLogo() ? 'Subiendo...' : 'Confirmar Subida de Logo' }}
                </button>
              </div>

            </div>
          </div>

        </div>

        <!-- ==================== TAB 3: OBJETIVOS ESPECÍFICOS ==================== -->
        <div *ngIf="activeTab() === 'objectives'" class="space-y-6 animate-scale-in">
          <div class="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 class="text-slate-800 font-bold text-sm uppercase tracking-wider">Objetivos Específicos del Grupo</h3>
            <button type="button" (click)="addObjective()" 
                    class="px-3 py-1.5 bg-primary-light text-primary hover:bg-primary-light/80 text-xs font-bold rounded-lg transition-all flex items-center space-x-1">
              <i class="bi bi-plus-circle-fill"></i>
              <span>Agregar Objetivo</span>
            </button>
          </div>

          <div formArrayName="specific_objectives" class="space-y-4">
            <div *ngFor="let obj of objectivesArray.controls; let i = index" 
                 [formGroupName]="i" 
                 class="flex items-center space-x-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 animate-scale-in">
              
              <span class="flex-shrink-0 w-6 h-6 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-xs">
                {{ i + 1 }}
              </span>
              
              <input type="text" formControlName="objective" placeholder="Describa el objetivo específico..." 
                     class="flex-grow bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 font-medium">

              <button type="button" (click)="removeObjective(i)" 
                      class="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-all flex items-center justify-center">
                <i class="bi bi-trash-fill text-base"></i>
              </button>

            </div>

            <div *ngIf="objectivesArray.length === 0" class="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
              No hay objetivos específicos definidos. Haz clic en "Agregar Objetivo".
            </div>
          </div>

        </div>

        <!-- ==================== TAB 4: LÍNEAS DE INVESTIGACIÓN ==================== -->
        <div *ngIf="activeTab() === 'lines'" class="space-y-6 animate-scale-in">
          <div class="flex justify-between items-center border-b border-slate-100 pb-2">
            <div>
              <h3 class="text-slate-800 font-bold text-sm uppercase tracking-wider">Ejes y Líneas de Investigación</h3>
              <p class="text-slate-500 text-xs">Configura los ejes temáticos prioritarios del grupo y asóciales sus líneas de investigación.</p>
            </div>
            <button type="button" (click)="addResearchLine()" 
                    class="px-3 py-1.5 bg-primary-light text-primary hover:bg-primary-light/80 text-xs font-bold rounded-lg transition-all flex items-center space-x-1">
              <i class="bi bi-plus-circle-fill"></i>
              <span>Agregar Eje Temático</span>
            </button>
          </div>

          <div formArrayName="research_lines" class="space-y-6">
            <div *ngFor="let line of linesArray.controls; let i = index" 
                 [formGroupName]="i" 
                 class="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4 relative animate-scale-in">
              
              <div class="flex justify-between items-center">
                <span class="px-2.5 py-1 bg-primary text-white text-[10px] font-bold rounded-md uppercase tracking-wider">
                  Eje Temático #{{ i + 1 }}
                </span>
                <button type="button" (click)="removeResearchLine(i)" 
                        class="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-all flex items-center justify-center">
                  <i class="bi bi-trash-fill text-base"></i>
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Título -->
                <div class="md:col-span-2 space-y-1.5">
                  <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Título del Eje Temático *</label>
                  <input type="text" formControlName="title" class="admin-input-small-white" placeholder="Ej: Software y Ciencia de Datos">
                </div>
                <!-- Icono -->
                <div class="space-y-1.5">
                  <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Icono Bootstrap (ej: bi-code-slash) *</label>
                  <div class="relative flex items-center">
                    <i class="bi {{ line.get('icon')?.value || 'bi-gear' }} absolute left-3 text-slate-500 text-base"></i>
                    <input type="text" formControlName="icon" class="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 font-medium">
                  </div>
                </div>
              </div>

              <!-- Descripción -->
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Descripción del Eje *</label>
                <textarea formControlName="description" rows="2" class="admin-input-small-white resize-none" placeholder="Describa el alcance de este eje..."></textarea>
              </div>

              <!-- Líneas específicas -->
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Líneas de Investigación asociadas (separadas por comas) *</label>
                <textarea formControlName="lines" rows="2" class="admin-input-small-white resize-none" placeholder="Ej: Inteligencia Artificial, Big Data y Analítica, Desarrollo Móvil y Web"></textarea>
              </div>

            </div>

            <div *ngIf="linesArray.length === 0" class="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
              No hay ejes temáticos definidos. Haz clic en "Agregar Eje Temático".
            </div>
          </div>

        </div>

        <!-- BOTÓN DE GUARDADO PRINCIPAL -->
        <div class="pt-4 border-t border-slate-100 flex justify-end">
          <button type="submit" [disabled]="isSaving() || settingsForm.invalid"
                  class="px-8 py-4 bg-primary hover:bg-primary-hover disabled:bg-slate-300 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 disabled:translate-y-0 flex items-center space-x-2 transition-all duration-200">
            <i *ngIf="isSaving()" class="animate-spin bi bi-arrow-repeat text-lg"></i>
            <span>{{ isSaving() ? 'Guardando Ajustes...' : 'Guardar y Aplicar Cambios' }}</span>
          </button>
        </div>

      </form>

      <!-- ==================== TAB 5: CARRUSEL DE PORTADA ==================== -->
      <div *ngIf="activeTab() === 'carousel'" class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/50 shadow-premium space-y-6 animate-scale-in">
        
        <div class="border-b border-slate-100 pb-3">
          <h3 class="text-slate-800 font-bold text-sm uppercase tracking-wider">Gestión del Carrusel de Diapositivas</h3>
          <p class="text-slate-500 text-xs">Agrega, edita o elimina las imágenes y textos del carrusel de fondo que se muestra en la pantalla de inicio.</p>
        </div>

        <!-- Listado de Diapositivas Existentes -->
        <div class="space-y-6">
          <div *ngFor="let slide of slides(); let i = index" 
               class="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            
            <!-- Imagen actual -->
            <div class="w-full md:w-44 h-28 bg-slate-900 border border-slate-200/50 rounded-2xl overflow-hidden flex-shrink-0 relative shadow-inner">
              <img [src]="'/' + slide.image_url" [alt]="slide.title" class="w-full h-full object-cover">
              <span class="absolute top-2 left-2 px-2 py-1 bg-primary text-white text-[9px] font-bold rounded shadow-sm">
                Diapositiva #{{ i + 1 }}
              </span>
            </div>

            <!-- Inputs en caliente -->
            <div class="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              <!-- Título -->
              <div class="sm:col-span-2 space-y-1.5">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Título de la diapositiva</label>
                <input type="text" [id]="'slide_title_' + slide.id" [value]="slide.title || ''" class="admin-input-small-white" placeholder="Ej: Ingeniería de Vanguardia">
              </div>
              <!-- Orden -->
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Orden numérico</label>
                <input type="number" [id]="'slide_order_' + slide.id" [value]="slide.order_index || 0" class="admin-input-small-white" placeholder="Ej: 1">
              </div>
              <!-- Subtítulo / Descripción -->
              <div class="sm:col-span-3 space-y-1.5">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Subtítulo / Mensaje descriptivo</label>
                <textarea [id]="'slide_subtitle_' + slide.id" rows="2" class="admin-input-small-white resize-none" placeholder="Escriba la descripción corta...">{{ slide.subtitle || '' }}</textarea>
              </div>
              <!-- Reemplazar imagen -->
              <div class="sm:col-span-3 space-y-1.5">
                <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Reemplazar imagen de diapositiva</label>
                <input type="file" (change)="onEditSlideFileSelected($event, slide.id)" [id]="'slide_file_' + slide.id" accept="image/*" 
                       class="block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-primary-light file:text-primary hover:file:bg-primary-light/80 file:cursor-pointer">
              </div>
            </div>

            <!-- Acciones de Diapositiva -->
            <div class="flex md:flex-col gap-2 w-full md:w-auto shrink-0 justify-end pt-2 md:pt-0">
              <button type="button" (click)="updateSlide(slide)" [disabled]="updatingSlideIds()[slide.id]"
                      class="px-4 py-2.5 bg-primary hover:bg-primary-hover disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center space-x-1.5 cursor-pointer">
                <i *ngIf="updatingSlideIds()[slide.id]" class="animate-spin bi bi-arrow-repeat text-sm"></i>
                <span>{{ updatingSlideIds()[slide.id] ? 'Guardando...' : 'Actualizar' }}</span>
              </button>
              <button type="button" (click)="deleteSlide(slide.id)" [disabled]="deletingSlideIds()[slide.id]"
                      class="px-4 py-2.5 bg-red-50 hover:bg-red-100 disabled:bg-slate-100 text-red-500 text-xs font-bold rounded-xl border border-red-200/50 transition-all flex items-center justify-center space-x-1.5 cursor-pointer">
                <i *ngIf="deletingSlideIds()[slide.id]" class="animate-spin bi bi-arrow-repeat text-sm"></i>
                <span>{{ deletingSlideIds()[slide.id] ? 'Borrando...' : 'Eliminar' }}</span>
              </button>
            </div>

          </div>

          <div *ngIf="slides().length === 0" class="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
            No hay diapositivas en el carrusel de portada. Agrega una nueva diapositiva a continuación.
          </div>
        </div>

        <!-- Formulario Agregar Nueva Diapositiva -->
        <div class="bg-slate-50/50 p-6 rounded-3xl border border-slate-200/50 space-y-6">
          <h4 class="text-slate-800 font-bold text-sm uppercase tracking-wider flex items-center space-x-2">
            <i class="bi bi-plus-circle-fill text-primary"></i>
            <span>Cargar Nueva Diapositiva al Carrusel</span>
          </h4>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="md:col-span-2 space-y-1.5">
              <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Título de Diapositiva</label>
              <input type="text" [value]="newSlideTitle()" (input)="newSlideTitle.set($any($event.target).value)" 
                     class="admin-input-small-white" placeholder="Ej: Investigación Interdisciplinaria">
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Orden numérico</label>
              <input type="number" [value]="newSlideOrder()" (input)="newSlideOrder.set(+$any($event.target).value)" 
                     class="admin-input-small-white" placeholder="Ej: 4">
            </div>
            <div class="md:col-span-3 space-y-1.5">
              <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Subtítulo / Mensaje descriptivo</label>
              <textarea [value]="newSlideSubtitle()" (input)="newSlideSubtitle.set($any($event.target).value)" 
                        rows="2" class="admin-input-small-white resize-none" placeholder="Describa brevemente el enfoque de esta diapositiva..."></textarea>
            </div>
            <div class="md:col-span-3 space-y-1.5">
              <label class="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Archivo de Imagen de Diapositiva *</label>
              <input type="file" (change)="onNewSlideFileSelected($event)" id="new_slide_file" accept="image/*" 
                     class="block w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-primary-light file:text-primary hover:file:bg-primary-light/80 file:cursor-pointer">
              <p class="text-[10px] text-slate-400">Se recomiendan imágenes paisajísticas horizontales de alta resolución (ej: 1920x1080) de hasta 4MB.</p>
            </div>
          </div>

          <div class="flex justify-end pt-2">
            <button type="button" (click)="addSlide()" [disabled]="isAddingSlide() || !selectedSlideFile"
                    class="px-6 py-3 bg-primary hover:bg-primary-hover disabled:bg-slate-300 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center space-x-1.5 cursor-pointer">
              <i *ngIf="isAddingSlide()" class="animate-spin bi bi-arrow-repeat text-sm"></i>
              <span>{{ isAddingSlide() ? 'Cargando Diapositiva...' : 'Agregar Nueva Diapositiva' }}</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  `
})
export class AdminSettingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  config = inject(ConfigService);

  settingsForm!: FormGroup;
  activeTab = signal('general');
  isSaving = signal(false);
  isUploadingLogo = signal(false);
  messageStatus = signal<'idle' | 'success' | 'error'>('idle');
  statusMessage = signal('');

  selectedLogoFile: File | null = null;

  // NUEVAS SEÑALES Y PROPIEDADES PARA EL CARRUSEL
  slides = computed(() => this.config.settings()?.hero_slides || []);
  
  newSlideTitle = signal('');
  newSlideSubtitle = signal('');
  newSlideOrder = signal(0);
  selectedSlideFile: File | null = null;
  
  isAddingSlide = signal(false);
  selectedEditFiles: { [id: number]: File } = {};
  
  updatingSlideIds = signal<{ [id: number]: boolean }>({});
  deletingSlideIds = signal<{ [id: number]: boolean }>({});

  ngOnInit() {
    this.initForm();
    this.populateForm();
  }

  private initForm() {
    this.settingsForm = this.fb.group({
      group_name: ['', [Validators.required]],
      institution: ['', [Validators.required]],
      description: ['', [Validators.required]],
      objective_general: ['', [Validators.required]],
      mission: ['', [Validators.required]],
      vision: ['', [Validators.required]],
      primary_color: ['#0A5C36', [Validators.required]],
      secondary_color: ['#F4A261', [Validators.required]],
      accent_color: ['#1D3557', [Validators.required]],
      contact_address: ['', [Validators.required]],
      contact_location: ['', [Validators.required]],
      contact_email: ['', [Validators.required, Validators.email]],
      specific_objectives: this.fb.array([]),
      research_lines: this.fb.array([])
    });
  }

  // Getters para FormArrays
  get objectivesArray() {
    return this.settingsForm.get('specific_objectives') as FormArray;
  }

  get linesArray() {
    return this.settingsForm.get('research_lines') as FormArray;
  }

  // Cargar datos actuales en los controles
  populateForm() {
    const s = this.config.settings();
    if (!s) return;

    this.settingsForm.patchValue({
      group_name: s.group_name,
      institution: s.institution,
      description: s.description,
      objective_general: s.objective_general,
      mission: s.mission,
      vision: s.vision,
      primary_color: s.primary_color,
      secondary_color: s.secondary_color,
      accent_color: s.accent_color,
      contact_address: s.contact_address,
      contact_location: s.contact_location,
      contact_email: s.contact_email
    });

    // Cargar objetivos específicos
    this.objectivesArray.clear();
    if (s.specific_objectives) {
      s.specific_objectives.forEach(obj => {
        this.objectivesArray.push(this.fb.group({
          objective: [obj.objective, [Validators.required]]
        }));
      });
    }

    // Cargar líneas de investigación
    this.linesArray.clear();
    if (s.research_lines) {
      s.research_lines.forEach(line => {
        this.linesArray.push(this.fb.group({
          title: [line.title, [Validators.required]],
          description: [line.description, [Validators.required]],
          icon: [line.icon, [Validators.required]],
          lines: [line.lines || '', [Validators.required]]
        }));
      });
    }
  }

  // Objetivos específicos
  addObjective() {
    this.objectivesArray.push(this.fb.group({
      objective: ['', [Validators.required]]
    }));
  }

  removeObjective(index: number) {
    this.objectivesArray.removeAt(index);
  }

  // Ejes y líneas de investigación
  addResearchLine() {
    this.linesArray.push(this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      icon: ['bi-gear', [Validators.required]],
      lines: ['', [Validators.required]]
    }));
  }

  removeResearchLine(index: number) {
    this.linesArray.removeAt(index);
  }

  async onLogoFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      try {
        console.log('Tamaño original (Logo):', (file.size / 1024).toFixed(1), 'KB');
        const compressed = await compressImage(file, 500, 500, 0.85); // Resoluciones cuadradas
        console.log('Tamaño comprimido (Logo):', (compressed.size / 1024).toFixed(1), 'KB');
        this.selectedLogoFile = compressed;
      } catch (err) {
        console.error('Error al comprimir el logotipo:', err);
        this.selectedLogoFile = file; // Fallback al original
      }
    }
  }

  // Subir logotipo a la API
  uploadLogo() {
    if (!this.selectedLogoFile) return;

    this.isUploadingLogo.set(true);
    this.messageStatus.set('idle');

    const formData = new FormData();
    formData.append('logo', this.selectedLogoFile);

    this.http.post<{ success: boolean; logo_url: string }>('/api/settings/logo', formData)
      .subscribe({
        next: (res) => {
          if (res && res.success) {
            this.messageStatus.set('success');
            this.statusMessage.set('El logotipo se ha subido y aplicado exitosamente.');
            this.selectedLogoFile = null;
            // Recargar configuraciones locales globales
            this.config.loadConfig();
          } else {
            this.messageStatus.set('error');
            this.statusMessage.set('No se pudo subir el logotipo.');
          }
          this.isUploadingLogo.set(false);
        },
        error: (err) => {
          console.error('Error al subir logo:', err);
          this.messageStatus.set('error');
          this.statusMessage.set(err.error?.message || 'Error de conexión al subir el archivo.');
          this.isUploadingLogo.set(false);
        }
      });
  }

  // Guardar todas las configuraciones del formulario principal
  saveSettings() {
    if (this.settingsForm.invalid) return;

    this.isSaving.set(true);
    this.messageStatus.set('idle');

    // Mapear específicos a formato adecuado (ej: listado simple)
    const formValue = {
      ...this.settingsForm.value,
      specific_objectives: this.objectivesArray.value.map((obj: any) => obj.objective)
    };

    this.http.put<{ success: boolean; message: string }>('/api/settings', formValue)
      .subscribe({
        next: (res) => {
          if (res && res.success) {
            this.messageStatus.set('success');
            this.statusMessage.set('Los cambios en la configuración del portal se han guardado exitosamente.');
            // Recargar configuraciones en memoria global
            this.config.loadConfig();
          } else {
            this.messageStatus.set('error');
            this.statusMessage.set(res.message || 'No se pudo guardar la configuración.');
          }
          this.isSaving.set(false);
        },
        error: (err) => {
          console.error('Error al guardar configuraciones:', err);
          this.messageStatus.set('error');
          this.statusMessage.set(err.error?.message || 'Error de conexión al guardar los datos.');
          this.isSaving.set(false);
        }
      });
  }

  // MÉTODOS DEL CARRUSEL DINÁMICO
  async onNewSlideFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      try {
        console.log('Comprimiendo nueva diapositiva...');
        const compressed = await compressImage(file, 1920, 1080, 0.85); // Alta resolución horizontal
        this.selectedSlideFile = compressed;
      } catch (err) {
        console.error('Error al comprimir diapositiva:', err);
        this.selectedSlideFile = file;
      }
    }
  }

  addSlide() {
    if (!this.selectedSlideFile) {
      this.messageStatus.set('error');
      this.statusMessage.set('Por favor, seleccione una imagen para la nueva diapositiva.');
      return;
    }

    this.isAddingSlide.set(true);
    this.messageStatus.set('idle');

    const formData = new FormData();
    formData.append('image', this.selectedSlideFile);
    formData.append('title', this.newSlideTitle());
    formData.append('subtitle', this.newSlideSubtitle());
    formData.append('order_index', this.newSlideOrder().toString());

    this.http.post<{ success: boolean }>('/api/settings/slides', formData)
      .subscribe({
        next: (res) => {
          if (res && res.success) {
            this.messageStatus.set('success');
            this.statusMessage.set('Diapositiva agregada exitosamente al carrusel.');
            this.newSlideTitle.set('');
            this.newSlideSubtitle.set('');
            this.newSlideOrder.set(0);
            this.selectedSlideFile = null;
            
            const fileInput = document.getElementById('new_slide_file') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
            
            this.config.loadConfig(); // Recargar datos
          } else {
            this.messageStatus.set('error');
            this.statusMessage.set('No se pudo agregar la diapositiva.');
          }
          this.isAddingSlide.set(false);
        },
        error: (err) => {
          console.error('Error al agregar diapositiva:', err);
          this.messageStatus.set('error');
          this.statusMessage.set(err.error?.message || 'Error al conectar con la API de diapositivas.');
          this.isAddingSlide.set(false);
        }
      });
  }

  async onEditSlideFileSelected(event: any, slideId: number) {
    const file = event.target.files[0];
    if (file) {
      try {
        console.log(`Comprimiendo imagen de reemplazo para slide ${slideId}...`);
        const compressed = await compressImage(file, 1920, 1080, 0.85);
        this.selectedEditFiles[slideId] = compressed;
      } catch (err) {
        console.error('Error al comprimir:', err);
        this.selectedEditFiles[slideId] = file;
      }
    }
  }

  updateSlide(slide: any) {
    const id = slide.id;
    this.updatingSlideIds.update(val => ({ ...val, [id]: true }));
    this.messageStatus.set('idle');

    const titleInput = document.getElementById(`slide_title_${id}`) as HTMLInputElement;
    const subtitleInput = document.getElementById(`slide_subtitle_${id}`) as HTMLTextAreaElement;
    const orderInput = document.getElementById(`slide_order_${id}`) as HTMLInputElement;

    const formData = new FormData();
    if (titleInput) formData.append('title', titleInput.value);
    if (subtitleInput) formData.append('subtitle', subtitleInput.value);
    if (orderInput) formData.append('order_index', orderInput.value);
    
    if (this.selectedEditFiles[id]) {
      formData.append('image', this.selectedEditFiles[id]);
    }

    this.http.put<{ success: boolean }>(`/api/settings/slides/${id}`, formData)
      .subscribe({
        next: (res) => {
          if (res && res.success) {
            this.messageStatus.set('success');
            this.statusMessage.set('Diapositiva actualizada exitosamente.');
            delete this.selectedEditFiles[id];
            
            const fileInput = document.getElementById(`slide_file_${id}`) as HTMLInputElement;
            if (fileInput) fileInput.value = '';
            
            this.config.loadConfig(); // Recargar datos
          } else {
            this.messageStatus.set('error');
            this.statusMessage.set('No se pudo actualizar la diapositiva.');
          }
          this.updatingSlideIds.update(val => ({ ...val, [id]: false }));
        },
        error: (err) => {
          console.error('Error al actualizar slide:', err);
          this.messageStatus.set('error');
          this.statusMessage.set(err.error?.message || 'Error al guardar los cambios de la diapositiva.');
          this.updatingSlideIds.update(val => ({ ...val, [id]: false }));
        }
      });
  }

  deleteSlide(slideId: number) {
    if (!confirm('¿Está seguro de que desea eliminar esta diapositiva del carrusel?')) return;

    this.deletingSlideIds.update(val => ({ ...val, [slideId]: true }));
    this.messageStatus.set('idle');

    this.http.delete<{ success: boolean }>(`/api/settings/slides/${slideId}`)
      .subscribe({
        next: (res) => {
          if (res && res.success) {
            this.messageStatus.set('success');
            this.statusMessage.set('Diapositiva eliminada con éxito del carrusel.');
            this.config.loadConfig(); // Recargar datos
          } else {
            this.messageStatus.set('error');
            this.statusMessage.set('No se pudo eliminar la diapositiva.');
          }
          this.deletingSlideIds.update(val => ({ ...val, [slideId]: false }));
        },
        error: (err) => {
          console.error('Error al eliminar slide:', err);
          this.messageStatus.set('error');
          this.statusMessage.set(err.error?.message || 'Error de conexión al eliminar la diapositiva.');
          this.deletingSlideIds.update(val => ({ ...val, [slideId]: false }));
        }
      });
  }
}
