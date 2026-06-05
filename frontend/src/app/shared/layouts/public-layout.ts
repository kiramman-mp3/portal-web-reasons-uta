import { Component, inject, signal, ViewEncapsulation } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../../core/services/config.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  encapsulation: ViewEncapsulation.None,
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
              <button [routerLink]="auth.isAuthenticated() ? '/admin/dashboard' : '/admin/login'" 
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
            <button [routerLink]="auth.isAuthenticated() ? '/admin/dashboard' : '/admin/login'" (click)="closeMobileMenu()"
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

      <!-- WIDGET FLOTANTE DE ACCESIBILIDAD -->
      <div class="fixed bottom-6 right-6 z-50 font-sans">
        
        <!-- Botón Lanzador Principal -->
        <button (click)="toggleAccessMenu()" 
                class="w-14 h-14 rounded-full bg-primary hover:bg-primary-hover text-white shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none cursor-pointer"
                title="Menú de Accesibilidad"
                aria-label="Menú de Accesibilidad">
          <i class="bi bi-universal-access text-3xl"></i>
        </button>

        <!-- Panel de Opciones de Accesibilidad -->
        <div *ngIf="isAccessMenuOpen()" 
             class="absolute bottom-16 right-0 w-80 bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-5 animate-scale-in flex flex-col text-slate-800">
          
          <div class="flex justify-between items-center border-b border-slate-100 pb-3">
            <div class="flex items-center space-x-2">
              <i class="bi bi-universal-access text-xl text-primary animate-pulse"></i>
              <span class="font-extrabold text-xs uppercase tracking-wider text-slate-800">Accesibilidad Web</span>
            </div>
            <button (click)="closeAccessMenu()" class="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <!-- Tamaño de Texto -->
          <div class="space-y-2">
            <span class="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Tamaño del Texto</span>
            <div class="grid grid-cols-3 gap-2">
              <button (click)="setTextSize(14)" 
                      [ngClass]="currentTextSize() === 14 ? 'bg-primary text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                      class="py-2 text-[10px] font-bold rounded-xl transition-all cursor-pointer">
                A- (Pequeño)
              </button>
              <button (click)="setTextSize(16)" 
                      [ngClass]="currentTextSize() === 16 ? 'bg-primary text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                      class="py-2 text-[10px] font-bold rounded-xl transition-all cursor-pointer">
                A (Normal)
              </button>
              <button (click)="setTextSize(19)" 
                      [ngClass]="currentTextSize() === 19 ? 'bg-primary text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                      class="py-2 text-[10px] font-bold rounded-xl transition-all cursor-pointer">
                A+ (Grande)
              </button>
            </div>
          </div>

          <!-- Opciones con Toggles -->
          <div class="space-y-4 pt-2 border-t border-slate-100/60">
            
            <!-- Contraste Alto -->
            <div class="flex items-center justify-between">
              <div class="flex flex-col">
                <span class="text-xs font-bold text-slate-700">Contraste Alto</span>
                <span class="text-[9px] text-slate-400">Texto amarillo en fondo negro</span>
              </div>
              <button (click)="toggleHighContrast()" 
                      [ngClass]="isHighContrast() ? 'bg-primary text-white' : 'bg-slate-200 text-slate-400'"
                      class="w-11 h-6 rounded-full relative transition-all cursor-pointer focus:outline-none flex items-center p-0.5">
                <div [ngClass]="isHighContrast() ? 'translate-x-5' : 'translate-x-0'"
                     class="w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200"></div>
              </button>
            </div>

            <!-- Fuente Accesible -->
            <div class="flex items-center justify-between">
              <div class="flex flex-col">
                <span class="text-xs font-bold text-slate-700">Fuente Accesible</span>
                <span class="text-[9px] text-slate-400">Separación y tipografía legible</span>
              </div>
              <button (click)="toggleDyslexicFont()" 
                      [ngClass]="isDyslexicFont() ? 'bg-primary text-white' : 'bg-slate-200 text-slate-400'"
                      class="w-11 h-6 rounded-full relative transition-all cursor-pointer focus:outline-none flex items-center p-0.5">
                <div [ngClass]="isDyslexicFont() ? 'translate-x-5' : 'translate-x-0'"
                     class="w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200"></div>
              </button>
            </div>

            <!-- Detener Animaciones -->
            <div class="flex items-center justify-between">
              <div class="flex flex-col">
                <span class="text-xs font-bold text-slate-700">Detener Animaciones</span>
                <span class="text-[9px] text-slate-400">Reduce movimiento de la web</span>
              </div>
              <button (click)="toggleReduceMotion()" 
                      [ngClass]="isReduceMotion() ? 'bg-primary text-white' : 'bg-slate-200 text-slate-400'"
                      class="w-11 h-6 rounded-full relative transition-all cursor-pointer focus:outline-none flex items-center p-0.5">
                <div [ngClass]="isReduceMotion() ? 'translate-x-5' : 'translate-x-0'"
                     class="w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200"></div>
              </button>
            </div>

            <!-- Resaltar Enlaces -->
            <div class="flex items-center justify-between">
              <div class="flex flex-col">
                <span class="text-xs font-bold text-slate-700">Destacar Enlaces</span>
                <span class="text-[9px] text-slate-400">Subraya e ilumina clics</span>
              </div>
              <button (click)="toggleHighlightLinks()" 
                      [ngClass]="isHighlightLinks() ? 'bg-primary text-white' : 'bg-slate-200 text-slate-400'"
                      class="w-11 h-6 rounded-full relative transition-all cursor-pointer focus:outline-none flex items-center p-0.5">
                <div [ngClass]="isHighlightLinks() ? 'translate-x-5' : 'translate-x-0'"
                     class="w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200"></div>
              </button>
            </div>

          </div>

          <!-- Restablecer Valores -->
          <div class="border-t border-slate-100 pt-3 flex justify-between items-center">
            <span class="text-[9px] text-slate-400 font-semibold">REASONS Portal</span>
            <button (click)="resetAccessibility()" 
                    class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer border border-slate-200/50">
              Restablecer Ajustes
            </button>
          </div>

        </div>

      </div>

    </div>
  `,
  styles: [`
    .active-nav {
      color: var(--color-primary, #0A5C36) !important;
      background-color: var(--color-primary-light, #eaf2ed) !important;
    }
    
    /* ANIMACIONES DEL PANEL DE ACCESIBILIDAD */
    .animate-scale-in {
      animation: scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    @keyframes scaleIn {
      from { transform: scale(0.9) translateY(10px); opacity: 0; }
      to { transform: scale(1) translateY(0); opacity: 1; }
    }

    /* ESTILOS GLOBALES DE ACCESIBILIDAD INYECTADOS */
    body.high-contrast {
      background-color: #000000 !important;
      background: #000000 !important;
      color: #ffffff !important;
    }
    body.high-contrast a, 
    body.high-contrast button, 
    body.high-contrast span,
    body.high-contrast h1,
    body.high-contrast h2,
    body.high-contrast h3,
    body.high-contrast h4,
    body.high-contrast p,
    body.high-contrast li,
    body.high-contrast i,
    body.high-contrast label,
    body.high-contrast input,
    body.high-contrast textarea,
    body.high-contrast td,
    body.high-contrast th {
      color: #ffff00 !important;
    }
    body.high-contrast .bg-white, 
    body.high-contrast .bg-slate-50, 
    body.high-contrast .bg-slate-100, 
    body.high-contrast .bg-slate-200, 
    body.high-contrast .bg-slate-900,
    body.high-contrast .bg-slate-950,
    body.high-contrast nav,
    body.high-contrast footer,
    body.high-contrast section,
    body.high-contrast div.bg-white,
    body.high-contrast div.bg-slate-50,
    body.high-contrast div.bg-slate-100,
    body.high-contrast div.bg-slate-900,
    body.high-contrast input,
    body.high-contrast textarea,
    body.high-contrast select,
    body.high-contrast form,
    body.high-contrast table,
    body.high-contrast tr,
    body.high-contrast td {
      background-color: #000000 !important;
      background: #000000 !important;
      border-color: #ffffff !important;
      box-shadow: none !important;
    }
    body.high-contrast border, 
    body.high-contrast .border-slate-100,
    body.high-contrast .border-slate-200,
    body.high-contrast hr {
      border-color: #ffffff !important;
    }
    body.high-contrast button.bg-primary,
    body.high-contrast a.bg-primary {
      background-color: #000000 !important;
      border: 2px solid #ffff00 !important;
    }

    body.dyslexic-font,
    body.dyslexic-font * {
      font-family: 'Arial', 'Helvetica', sans-serif !important;
      letter-spacing: 0.06em !important;
      word-spacing: 0.12em !important;
      line-height: 1.8 !important;
    }

    body.reduce-motion,
    body.reduce-motion * {
      animation: none !important;
      transition: none !important;
      transform: none !important;
    }

    body.highlight-links a, 
    body.highlight-links button[routerLink],
    body.highlight-links a[routerLink],
    body.highlight-links .cursor-pointer {
      outline: 3px solid #ff5722 !important;
      background-color: rgba(255, 87, 34, 0.15) !important;
      text-decoration: underline !important;
      font-weight: 800 !important;
    }
  `]
})

export class PublicLayoutComponent {
  config = inject(ConfigService);
  auth = inject(AuthService);
  isMobileMenuOpen = signal(false);

  isAccessMenuOpen = signal(false);
  currentTextSize = signal(16);
  isHighContrast = signal(false);
  isDyslexicFont = signal(false);
  isReduceMotion = signal(false);
  isHighlightLinks = signal(false);

  constructor() {
    this.loadSettings();
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(val => !val);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  toggleAccessMenu() {
    this.isAccessMenuOpen.update(val => !val);
  }

  closeAccessMenu() {
    this.isAccessMenuOpen.set(false);
  }

  setTextSize(size: number) {
    this.currentTextSize.set(size);
    if (typeof document !== 'undefined') {
      document.documentElement.style.fontSize = `${size}px`;
    }
    this.saveSettings();
  }

  toggleHighContrast() {
    this.isHighContrast.update(val => {
      const next = !val;
      this.updateBodyClass('high-contrast', next);
      return next;
    });
    this.saveSettings();
  }

  toggleDyslexicFont() {
    this.isDyslexicFont.update(val => {
      const next = !val;
      this.updateBodyClass('dyslexic-font', next);
      return next;
    });
    this.saveSettings();
  }

  toggleReduceMotion() {
    this.isReduceMotion.update(val => {
      const next = !val;
      this.updateBodyClass('reduce-motion', next);
      return next;
    });
    this.saveSettings();
  }

  toggleHighlightLinks() {
    this.isHighlightLinks.update(val => {
      const next = !val;
      this.updateBodyClass('highlight-links', next);
      return next;
    });
    this.saveSettings();
  }

  resetAccessibility() {
    this.currentTextSize.set(16);
    this.isHighContrast.set(false);
    this.isDyslexicFont.set(false);
    this.isReduceMotion.set(false);
    this.isHighlightLinks.set(false);

    if (typeof document !== 'undefined') {
      document.documentElement.style.fontSize = '';
      this.updateBodyClass('high-contrast', false);
      this.updateBodyClass('dyslexic-font', false);
      this.updateBodyClass('reduce-motion', false);
      this.updateBodyClass('highlight-links', false);
    }
    this.saveSettings();
  }

  private updateBodyClass(className: string, add: boolean) {
    if (typeof document !== 'undefined') {
      if (add) {
        document.body.classList.add(className);
      } else {
        document.body.classList.remove(className);
      }
    }
  }

  private saveSettings() {
    if (typeof localStorage !== 'undefined') {
      const settings = {
        textSize: this.currentTextSize(),
        highContrast: this.isHighContrast(),
        dyslexicFont: this.isDyslexicFont(),
        reduceMotion: this.isReduceMotion(),
        highlightLinks: this.isHighlightLinks()
      };
      localStorage.setItem('reasons_accessibility', JSON.stringify(settings));
    }
  }

  private loadSettings() {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('reasons_accessibility');
      if (saved) {
        try {
          const settings = JSON.parse(saved);
          if (settings.textSize) {
            this.currentTextSize.set(settings.textSize);
            if (typeof document !== 'undefined') {
              document.documentElement.style.fontSize = `${settings.textSize}px`;
            }
          }
          if (settings.highContrast) {
            this.isHighContrast.set(true);
            this.updateBodyClass('high-contrast', true);
          }
          if (settings.dyslexicFont) {
            this.isDyslexicFont.set(true);
            this.updateBodyClass('dyslexic-font', true);
          }
          if (settings.reduceMotion) {
            this.isReduceMotion.set(true);
            this.updateBodyClass('reduce-motion', true);
          }
          if (settings.highlightLinks) {
            this.isHighlightLinks.set(true);
            this.updateBodyClass('highlight-links', true);
          }
        } catch (e) {
          console.error('Error loading accessibility settings', e);
        }
      }
    }
  }
}
