import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ConfigService } from '../../core/services/config.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen flex bg-slate-100 font-sans">
      
      <!-- SIDEBAR EN ESCRITORIO -->
      <aside class="hidden lg:flex flex-col w-72 bg-slate-900 text-slate-300 border-r border-slate-800">
        
        <!-- Cabecera del Panel Admin -->
        <div class="h-20 flex items-center px-6 border-b border-slate-800 space-x-3">
          <div class="p-1 bg-white rounded-md w-10 h-10 flex items-center justify-center shadow-sm">
            <img [src]="config.logoUrl()" alt="Logo" class="max-h-full max-w-full object-contain">
          </div>
          <div class="flex flex-col">
            <span class="text-white font-bold tracking-tight text-base">{{ config.groupName() }}</span>
            <span class="text-xs text-slate-500 font-medium">Panel de Control</span>
          </div>
        </div>

        <!-- Perfil del Administrador Activo -->
        <div class="px-6 py-5 border-b border-slate-800 flex items-center space-x-3 bg-slate-950/40">
          <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-lg font-bold shadow-inner">
            {{ auth.currentUser()?.username?.substring(0, 1)?.toUpperCase() }}
          </div>
          <div class="flex flex-col overflow-hidden">
            <span class="text-white text-sm font-semibold truncate">{{ auth.currentUser()?.username }}</span>
            <span class="text-xs text-slate-500 capitalize">Administrador</span>
          </div>
        </div>

        <!-- Enlaces de Control del Panel -->
        <nav class="flex-grow p-4 space-y-1">
          <a routerLink="/admin/dashboard" routerLinkActive="active-admin"
             class="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-150">
            <i class="bi bi-speedometer2 text-lg"></i>
            <span>Dashboard Principal</span>
          </a>
          <a routerLink="/admin/configuracion" routerLinkActive="active-admin"
             class="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-150">
            <i class="bi bi-sliders text-lg"></i>
            <span>Configurar Portal</span>
          </a>
          <a routerLink="/admin/investigadores" routerLinkActive="active-admin"
             class="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-150">
            <i class="bi bi-people-fill text-lg"></i>
            <span>Investigadores</span>
          </a>
          <a routerLink="/admin/proyectos" routerLinkActive="active-admin"
             class="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-150">
            <i class="bi bi-kanban-fill text-lg"></i>
            <span>Proyectos</span>
          </a>
          <a routerLink="/admin/publicaciones" routerLinkActive="active-admin"
             class="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-150">
            <i class="bi bi-journal-text text-lg"></i>
            <span>Publicaciones</span>
          </a>
          <a routerLink="/admin/mensajes" routerLinkActive="active-admin"
             class="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all duration-150 justify-between">
            <div class="flex items-center space-x-3">
              <i class="bi bi-envelope-open-fill text-lg"></i>
              <span>Mensajes de Contacto</span>
            </div>
          </a>
        </nav>

        <!-- Botones Inferiores -->
        <div class="p-4 border-t border-slate-800 space-y-2 bg-slate-950/20">
          <a routerLink="/" target="_blank"
             class="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all">
            <i class="bi bi-box-arrow-up-right"></i>
            <span>Ver Portal Público</span>
          </a>
          <button (click)="logout()"
                  class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 active:bg-red-500/20 transition-all">
            <i class="bi bi-power text-lg"></i>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <!-- CONTENEDOR PRINCIPAL DERECHO -->
      <div class="flex-grow flex flex-col min-w-0">
        
        <!-- CABECERA SUPERIOR MÓVIL Y DE ACCIONES -->
        <header class="h-20 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex justify-between items-center shadow-sm">
          
          <!-- Botón Menú Móvil -->
          <div class="flex items-center lg:hidden">
            <button (click)="toggleMobileMenu()" class="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none transition-all">
              <i class="bi bi-list text-2xl"></i>
            </button>
            <span class="ml-3 font-bold text-slate-800 text-lg">{{ config.groupName() }} Admin</span>
          </div>

          <!-- Título Dinámico e Información de Conexión -->
          <div class="hidden lg:flex items-center space-x-2 text-sm text-slate-500 font-medium">
            <i class="bi bi-shield-check text-primary text-base"></i>
            <span>Sesión protegida por JWT</span>
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          </div>

          <!-- Acciones de Usuario Superior Derecha -->
          <div class="flex items-center space-x-4">
            <span class="hidden md:inline text-xs text-slate-400 font-semibold uppercase">Ambato, Ecuador</span>
            <div class="h-8 w-px bg-slate-200 hidden md:block"></div>
            <button (click)="logout()" class="lg:hidden p-2 rounded-lg text-red-500 hover:bg-red-50 focus:outline-none transition-all">
              <i class="bi bi-power text-xl"></i>
            </button>
            <span class="hidden lg:inline text-xs text-slate-400 font-semibold">UTA &copy; 2026</span>
          </div>
        </header>

        <!-- MENÚ MÓVIL DESPLEGABLE (DRAWER) -->
        <div *ngIf="isMobileMenuOpen()" class="lg:hidden fixed inset-0 z-50 flex">
          
          <!-- Overlay de fondo oscuro -->
          <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" (click)="toggleMobileMenu()"></div>

          <!-- Panel de Navegación Lateral -->
          <div class="relative flex flex-col w-72 max-w-xs bg-slate-900 text-slate-300 shadow-2xl h-full animate-slide-in">
            <div class="h-20 flex items-center justify-between px-6 border-b border-slate-800">
              <div class="flex items-center space-x-3">
                <div class="p-1 bg-white rounded-md w-8 h-8 flex items-center justify-center">
                  <img [src]="config.logoUrl()" alt="Logo" class="max-h-full max-w-full object-contain">
                </div>
                <span class="text-white font-bold text-base">{{ config.groupName() }}</span>
              </div>
              <button (click)="toggleMobileMenu()" class="p-1 rounded-md text-slate-400 hover:text-white">
                <i class="bi bi-x-lg text-xl"></i>
              </button>
            </div>

            <!-- Navegación móvil -->
            <nav class="flex-grow p-4 space-y-1 overflow-y-auto">
              <a routerLink="/admin/dashboard" routerLinkActive="active-admin" (click)="toggleMobileMenu()"
                 class="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all">
                <i class="bi bi-speedometer2"></i>
                <span>Dashboard</span>
              </a>
              <a routerLink="/admin/configuracion" routerLinkActive="active-admin" (click)="toggleMobileMenu()"
                 class="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all">
                <i class="bi bi-sliders"></i>
                <span>Configurar Portal</span>
              </a>
              <a routerLink="/admin/investigadores" routerLinkActive="active-admin" (click)="toggleMobileMenu()"
                 class="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all">
                <i class="bi bi-people-fill"></i>
                <span>Investigadores</span>
              </a>
              <a routerLink="/admin/proyectos" routerLinkActive="active-admin" (click)="toggleMobileMenu()"
                 class="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all">
                <i class="bi bi-kanban-fill"></i>
                <span>Proyectos</span>
              </a>
              <a routerLink="/admin/publicaciones" routerLinkActive="active-admin" (click)="toggleMobileMenu()"
                 class="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all">
                <i class="bi bi-journal-text"></i>
                <span>Publicaciones</span>
              </a>
              <a routerLink="/admin/mensajes" routerLinkActive="active-admin" (click)="toggleMobileMenu()"
                 class="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all">
                <i class="bi bi-envelope-open-fill"></i>
                <span>Mensajes</span>
              </a>
            </nav>

            <div class="p-4 border-t border-slate-800 space-y-2">
              <button (click)="logout(); toggleMobileMenu()"
                      class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-all">
                <i class="bi bi-power"></i>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>

        <!-- ÁREA DE CONTENIDO PRINCIPAL DE VISTAS PRIVADAS -->
        <main class="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <router-outlet></router-outlet>
        </main>

      </div>

    </div>
  `,
  styles: [`
    .active-admin {
      color: #ffffff !important;
      background-color: rgb(30, 41, 59) !important;
      border-left: 4px solid var(--color-primary, #0A5C36) !important;
    }
  `]
})

export class AdminLayoutComponent {
  auth = inject(AuthService);
  config = inject(ConfigService);
  router = inject(Router);

  isMobileMenuOpen = signal(false);

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(val => !val);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/admin/login']);
  }
}
