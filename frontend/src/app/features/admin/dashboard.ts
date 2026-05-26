import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ConfigService } from '../../core/services/config.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-8 font-sans">
      
      <!-- Bienvenida -->
      <div class="space-y-1">
        <h1 class="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
          ¡Hola de nuevo, {{ auth.currentUser()?.username }}!
        </h1>
        <p class="text-sm text-slate-500 font-medium">
          Bienvenido al panel autoadministrable del grupo **{{ config.groupName() }}**. Desde aquí puedes controlar los contenidos expuestos en el portal institucional.
        </p>
      </div>

      <!-- Spinner de Carga Inicial -->
      <div *ngIf="isLoading()" class="flex justify-center py-20 bg-white rounded-3xl border border-slate-200/50 shadow-premium">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <div *ngIf="!isLoading()" class="space-y-8">
        
        <!-- Grid de Contadores de Recursos (Cards Modernos) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <!-- Card Investigadores -->
          <div routerLink="/admin/investigadores" 
               class="bg-white rounded-3xl p-6 border border-slate-200/50 shadow-premium hover:shadow-hover hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-between">
            <div class="space-y-2">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-widest block">Investigadores</span>
              <span class="text-3xl font-extrabold text-slate-800 block">{{ countResearchers() }}</span>
              <span class="text-xs text-primary font-bold flex items-center space-x-1">
                <i class="bi bi-people-fill"></i>
                <span>Gestionar Equipo</span>
              </span>
            </div>
            <div class="p-4 bg-primary-light rounded-2xl text-primary">
              <i class="bi bi-people-fill text-2xl"></i>
            </div>
          </div>

          <!-- Card Proyectos -->
          <div routerLink="/admin/proyectos" 
               class="bg-white rounded-3xl p-6 border border-slate-200/50 shadow-premium hover:shadow-hover hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-between">
            <div class="space-y-2">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-widest block">Proyectos</span>
              <span class="text-3xl font-extrabold text-slate-800 block">{{ countProjects() }}</span>
              <span class="text-xs text-secondary font-bold flex items-center space-x-1">
                <i class="bi bi-kanban-fill"></i>
                <span>Catálogo Activo</span>
              </span>
            </div>
            <div class="p-4 bg-secondary-light rounded-2xl text-secondary">
              <i class="bi bi-kanban-fill text-2xl"></i>
            </div>
          </div>

          <!-- Card Publicaciones -->
          <div routerLink="/admin/publicaciones" 
               class="bg-white rounded-3xl p-6 border border-slate-200/50 shadow-premium hover:shadow-hover hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-between">
            <div class="space-y-2">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-widest block">Artículos</span>
              <span class="text-3xl font-extrabold text-slate-800 block">{{ countPublications() }}</span>
              <span class="text-xs text-accent font-bold flex items-center space-x-1">
                <i class="bi bi-journal-text"></i>
                <span>Revistas Indexadas</span>
              </span>
            </div>
            <div class="p-4 bg-accent/10 rounded-2xl text-accent">
              <i class="bi bi-journal-text text-2xl"></i>
            </div>
          </div>

          <!-- Card Buzón de Mensajes -->
          <div routerLink="/admin/mensajes" 
               class="bg-white rounded-3xl p-6 border border-slate-200/50 shadow-premium hover:shadow-hover hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-between"
               [ngClass]="{'ring-2 ring-secondary/30 bg-secondary-light/20': countUnreadMessages() > 0}">
            <div class="space-y-2">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-widest block">Mensajes Nuevos</span>
              <span class="text-3xl font-extrabold text-slate-800 block">{{ countUnreadMessages() }}</span>
              <span class="text-xs font-bold flex items-center space-x-1" [ngClass]="countUnreadMessages() > 0 ? 'text-amber-600' : 'text-slate-400'">
                <i class="bi bi-envelope-open-fill"></i>
                <span>{{ countUnreadMessages() > 0 ? 'Responder Mensajes' : 'Bandeja Vacía' }}</span>
              </span>
            </div>
            <div class="p-4 rounded-2xl" [ngClass]="countUnreadMessages() > 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'">
              <i class="bi bi-envelope-open-fill text-2xl animate-pulse"></i>
            </div>
          </div>

        </div>

        <!-- Secciones de Acciones Rápidas -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <!-- Panel de Ajustes del Sitio -->
          <div class="bg-white rounded-3xl p-6 border border-slate-200/50 shadow-premium space-y-4">
            <h2 class="text-xl font-bold text-slate-800 tracking-tight flex items-center space-x-2">
              <i class="bi bi-sliders text-primary"></i>
              <span>Configuración Dinámica Visual</span>
            </h2>
            <p class="text-slate-500 text-xs leading-relaxed">
              Modifica en tiempo real los colores principales del portal, sube un nuevo logo o actualiza la misión, visión, dirección y objetivos generales desde el módulo de configuración.
            </p>
            <div class="pt-2">
              <button routerLink="/admin/configuracion" 
                      class="px-5 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-md">
                Configurar Datos del Portal
              </button>
            </div>
          </div>

          <!-- Panel de Estado del Servidor -->
          <div class="bg-white rounded-3xl p-6 border border-slate-200/50 shadow-premium space-y-4">
            <h2 class="text-xl font-bold text-slate-800 tracking-tight flex items-center space-x-2">
              <i class="bi bi-shield-check text-emerald-600"></i>
              <span>Seguridad & API Swagger</span>
            </h2>
            <p class="text-slate-500 text-xs leading-relaxed">
              La conexión con la base de datos MySQL está activa. Puedes revisar la especificación técnica interactiva de OpenAPI y Swagger en el endpoint del backend.
            </p>
            <div class="pt-2">
              <a href="/api-docs" target="_blank" 
                 class="inline-block px-5 py-3 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all shadow-md">
                Abrir Documentación Swagger (API)
              </a>
            </div>
          </div>

        </div>

      </div>

    </div>
  `
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  config = inject(ConfigService);
  private http = inject(HttpClient);

  countResearchers = signal(0);
  countProjects = signal(0);
  countPublications = signal(0);
  countUnreadMessages = signal(0);
  isLoading = signal(true);

  ngOnInit() {
    this.fetchStatistics();
  }

  fetchStatistics() {
    this.isLoading.set(true);

    // Ejecutar consultas concurrentes al backend usando forkJoin
    forkJoin({
      res: this.http.get<{ success: boolean; data: any[] }>('/api/researchers'),
      proj: this.http.get<{ success: boolean; data: any[] }>('/api/projects'),
      pub: this.http.get<{ success: boolean; data: any[] }>('/api/publications'),
      messages: this.http.get<{ success: boolean; data: any[] }>('/api/contact')
    }).subscribe({
      next: (result) => {
        if (result.res?.success) this.countResearchers.set(result.res.data.length);
        if (result.proj?.success) this.countProjects.set(result.proj.data.length);
        if (result.pub?.success) this.countPublications.set(result.pub.data.length);
        
        if (result.messages?.success) {
          const unread = result.messages.data.filter(m => m.status === 'unread').length;
          this.countUnreadMessages.set(unread);
        }
        
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al descargar estadísticas para el Dashboard:', err);
        this.isLoading.set(false);
      }
    });
  }
}
