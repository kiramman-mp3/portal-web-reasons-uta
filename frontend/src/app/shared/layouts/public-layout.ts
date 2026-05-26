import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../../core/services/config.service';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen flex flex-col bg-slate-50">
      
      <!-- NAVBAR DE CABECERA PREMIUM (GLASSMORPHISM) -->
      <nav class="sticky top-0 z-50 glass-header shadow-sm transition-all duration-300">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-20">
            
            <!-- Logotipo y Nombre Institucional -->
            <div class="flex items-center space-x-3 cursor-pointer" routerLink="/">
              <div class="relative overflow-hidden rounded-lg w-12 h-12 flex items-center justify-center p-1 bg-white border border-slate-100 shadow-sm">
                <img [src]="config.logoUrl()" alt="Logo REASONS" class="max-h-full max-w-full object-contain">
              </div>
              <div class="flex flex-col">
                <span class="text-xl font-bold tracking-tight text-slate-800 leading-tight">
                  {{ config.groupName() }}
                </span>
                <span class="text-xs text-slate-500 font-medium leading-none">
                  UTA
                </span>
              </div>
            </div>

            <!-- Menú Navegación Escritorio -->
            <div class="hidden md:flex items-center space-x-1">
              <a routerLink="/" routerLinkActive="active-nav" [routerLinkActiveOptions]="{exact: true}" 
                 class="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-primary hover:bg-slate-50 transition-all duration-200">
                Inicio
              </a>
              <a routerLink="/equipo" routerLinkActive="active-nav" 
                 class="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-primary hover:bg-slate-50 transition-all duration-200">
                Equipo
              </a>
              <a routerLink="/proyectos" routerLinkActive="active-nav" 
                 class="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-primary hover:bg-slate-50 transition-all duration-200">
                Proyectos
              </a>
              <a routerLink="/publicaciones" routerLinkActive="active-nav" 
                 class="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-primary hover:bg-slate-50 transition-all duration-200">
                Publicaciones
              </a>
              <a routerLink="/contacto" routerLinkActive="active-nav" 
                 class="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-primary hover:bg-slate-50 transition-all duration-200">
                Contacto
              </a>
            </div>

            <!-- Botón de Acceso Administrativo -->
            <div class="hidden md:flex items-center">
              <button routerLink="/admin/login" 
                      class="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 flex items-center space-x-1.5 transition-all duration-200 shadow-sm">
                <i class="bi bi-shield-lock-fill text-primary"></i>
                <span>Portal Administrador</span>
              </button>
            </div>

            <!-- Botón Menú Móvil -->
            <div class="flex items-center md:hidden">
              <button (click)="toggleMobileMenu()" class="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none transition-all">
                <i class="bi text-2xl" [ngClass]="isMobileMenuOpen() ? 'bi-x' : 'bi-list'"></i>
              </button>
            </div>

          </div>
        </div>

        <!-- Menú Móvil Desplegable -->
        <div *ngIf="isMobileMenuOpen()" class="md:hidden glass-header border-t border-slate-100 transition-all">
          <div class="px-2 pt-2 pb-4 space-y-1 sm:px-3 shadow-inner">
            <a routerLink="/" routerLinkActive="active-nav" [routerLinkActiveOptions]="{exact: true}" (click)="closeMobileMenu()"
               class="block px-4 py-3 rounded-lg text-base font-semibold text-slate-700 hover:text-primary hover:bg-slate-50">
              Inicio
            </a>
            <a routerLink="/equipo" routerLinkActive="active-nav" (click)="closeMobileMenu()"
               class="block px-4 py-3 rounded-lg text-base font-semibold text-slate-700 hover:text-primary hover:bg-slate-50">
              Equipo
            </a>
            <a routerLink="/proyectos" routerLinkActive="active-nav" (click)="closeMobileMenu()"
               class="block px-4 py-3 rounded-lg text-base font-semibold text-slate-700 hover:text-primary hover:bg-slate-50">
              Proyectos
            </a>
            <a routerLink="/publicaciones" routerLinkActive="active-nav" (click)="closeMobileMenu()"
               class="block px-4 py-3 rounded-lg text-base font-semibold text-slate-700 hover:text-primary hover:bg-slate-50">
              Publicaciones
            </a>
            <a routerLink="/contacto" routerLinkActive="active-nav" (click)="closeMobileMenu()"
               class="block px-4 py-3 rounded-lg text-base font-semibold text-slate-700 hover:text-primary hover:bg-slate-50">
              Contacto
            </a>
            <hr class="border-slate-100 my-2">
            <button routerLink="/admin/login" (click)="closeMobileMenu()"
                    class="w-full px-4 py-3 bg-primary text-white rounded-lg text-base font-semibold flex items-center justify-center space-x-2 transition-all">
              <i class="bi bi-shield-lock-fill"></i>
              <span>Portal Administrador</span>
            </button>
          </div>
        </div>
      </nav>

      <!-- SECCIÓN DE CONTENIDO DINÁMICO (VISTAS PÚBLICAS) -->
      <main class="flex-grow">
        <router-outlet></router-outlet>
      </main>

      <!-- FOOTER PREMIUM DINÁMICO -->
      <footer class="bg-slate-900 text-slate-400 border-t border-slate-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <!-- Columna 1: Info Grupo -->
            <div class="space-y-4">
              <div class="flex items-center space-x-3">
                <div class="p-1 bg-white rounded-md w-10 h-10 flex items-center justify-center">
                  <img [src]="config.logoUrl()" alt="Logo REASONS" class="max-h-full max-w-full object-contain">
                </div>
                <span class="text-white text-lg font-bold tracking-tight">{{ config.groupName() }}</span>
              </div>
              <p class="text-sm text-slate-400 max-w-sm">
                {{ config.settings()?.description }}
              </p>
              <p class="text-xs text-slate-500 font-semibold uppercase">
                {{ config.settings()?.institution }}
              </p>
            </div>

            <!-- Columna 2: Enlaces Rápidos -->
            <div>
              <h3 class="text-white text-sm font-bold tracking-wider uppercase mb-4">Navegación</h3>
              <ul class="space-y-2 text-sm">
                <li><a routerLink="/" class="hover:text-primary transition-all">Inicio</a></li>
                <li><a routerLink="/equipo" class="hover:text-primary transition-all">Equipo de Trabajo</a></li>
                <li><a routerLink="/proyectos" class="hover:text-primary transition-all">Catálogo de Proyectos</a></li>
                <li><a routerLink="/publicaciones" class="hover:text-primary transition-all">Publicaciones Científicas</a></li>
                <li><a routerLink="/contacto" class="hover:text-primary transition-all">Contacto</a></li>
              </ul>
            </div>

            <!-- Columna 3: Contacto Rápido -->
            <div class="space-y-3">
              <h3 class="text-white text-sm font-bold tracking-wider uppercase mb-4">Contacto</h3>
              <p class="text-sm flex items-start space-x-2">
                <i class="bi bi-geo-alt-fill text-primary mt-0.5"></i>
                <span>{{ config.settings()?.contact_address }}</span>
              </p>
              <p class="text-sm flex items-center space-x-2">
                <i class="bi bi-globe text-primary"></i>
                <span>{{ config.settings()?.contact_location }}</span>
              </p>
              <p class="text-sm flex items-center space-x-2">
                <i class="bi bi-envelope-fill text-primary"></i>
                <a [href]="'mailto:' + config.settings()?.contact_email" class="hover:text-white transition-all">
                  {{ config.settings()?.contact_email }}
                </a>
              </p>
            </div>

          </div>

          <div class="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
            <p>&copy; 2026 {{ config.groupName() }}. Todos los derechos reservados. Universidad Técnica de Ambato.</p>
            <p class="mt-2 md:mt-0 flex items-center space-x-1">
              <span>Desarrollado con</span>
              <i class="bi bi-heart-fill text-red-500"></i>
              <span>Angular & Tailwind</span>
            </p>
          </div>
        </div>
      </footer>

    </div>
  `,
  styles: [`
    .active-nav {
      color: var(--color-primary, #0A5C36) !important;
      background-color: var(--color-primary-light, #eaf2ed) !important;
    }
  `]
})

export class PublicLayoutComponent {
  config = inject(ConfigService);
  isMobileMenuOpen = signal(false);

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(val => !val);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }
}
