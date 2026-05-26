import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ConfigService } from '../../core/services/config.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-20 pb-20 font-sans">
      
      <!-- HERO SECTION PREMIUM (CON DIFUMINADOS Y GLASSMORPHISM) -->
      <section class="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-slate-950 px-4 sm:px-6 lg:px-8 py-24">
        
        <!-- Círculos de Luces de Acento en Background (Efecto Moderno) -->
        <div class="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-full bg-primary/20 blur-[120px] pointer-events-none"></div>
        <div class="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[35rem] h-[35rem] rounded-full bg-secondary/10 blur-[100px] pointer-events-none"></div>

        <div class="relative max-w-5xl mx-auto text-center space-y-8">
          
          <!-- Insignia Institucional -->
          <div class="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <span class="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span class="text-slate-300 text-xs font-semibold uppercase tracking-wider">
              {{ config.settings()?.institution }}
            </span>
          </div>

          <!-- Logotipo Gigante -->
          <div class="flex justify-center">
            <div class="p-3 bg-white rounded-2xl shadow-2xl w-32 h-32 flex items-center justify-center border border-white/10 transform hover:scale-105 transition-all duration-300">
              <img [src]="config.logoUrl()" alt="Logo REASONS" class="max-h-full max-w-full object-contain">
            </div>
          </div>

          <!-- Título Principal -->
          <h1 class="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-none">
            Grupo de Investigación <span class="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-gradient">{{ config.groupName() }}</span>
          </h1>

          <!-- Descripción Principal -->
          <p class="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-medium leading-relaxed">
            {{ config.settings()?.description }}
          </p>

          <!-- Botones de Acción -->
          <div class="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <button routerLink="/proyectos" 
                    class="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-hover text-white rounded-xl text-base font-bold shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200">
              Ver Proyectos de Investigación
            </button>
            <button routerLink="/equipo" 
                    class="w-full sm:w-auto px-8 py-4 border border-white/20 hover:border-white/30 text-white rounded-xl text-base font-semibold hover:bg-white/5 backdrop-blur-sm hover:-translate-y-0.5 transition-all duration-200">
              Conocer al Equipo
            </button>
          </div>

        </div>

        <!-- Flecha de Desplazamiento Suave -->
        <div class="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 animate-bounce cursor-pointer">
          <i class="bi bi-chevron-down text-2xl"></i>
        </div>
      </section>

      <!-- SECCIÓN OBJETIVO GENERAL Y MISIÓN/VISIÓN -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <!-- Ilustración/Tarjeta de Sostenibilidad -->
          <div class="relative group">
            <div class="absolute inset-0 bg-gradient-to-tr from-primary to-secondary rounded-3xl blur-2xl opacity-10 group-hover:opacity-15 transition-opacity duration-300"></div>
            <div class="relative bg-white rounded-3xl p-8 border border-slate-100 shadow-premium group-hover:shadow-hover transition-all duration-300">
              <div class="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center mb-6">
                <i class="bi bi-bullseye text-primary text-xl"></i>
              </div>
              <h2 class="text-3xl font-extrabold text-slate-800 tracking-tight mb-4">
                Objetivo General
              </h2>
              <p class="text-slate-600 text-lg leading-relaxed mb-6 font-medium">
                {{ config.settings()?.objective_general }}
              </p>
              
              <hr class="border-slate-100 my-6">

              <!-- Objetivos Específicos -->
              <h3 class="text-base font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center space-x-2">
                <i class="bi bi-patch-check-fill text-primary"></i>
                <span>Objetivos Específicos</span>
              </h3>
              <ul class="space-y-3.5">
                <li *ngFor="let obj of config.settings()?.specific_objectives" class="flex items-start space-x-3 text-slate-600 text-sm leading-relaxed">
                  <span class="flex-shrink-0 w-6 h-6 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-xs mt-0.5">
                    {{ obj.order_index }}
                  </span>
                  <span>{{ obj.objective }}</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Misión y Visión con Diseño Moderno -->
          <div class="space-y-8">
            <div class="space-y-2">
              <span class="text-xs font-bold text-secondary uppercase tracking-widest">Nuestro Compromiso</span>
              <h2 class="text-4xl font-extrabold text-slate-800 tracking-tight">Propósito Institucional</h2>
              <p class="text-slate-500 text-sm">Impulsando soluciones innovadoras en ingeniería con enfoque de sostenibilidad y compromiso social.</p>
            </div>

            <div class="space-y-6">
              <!-- Tarjeta Misión -->
              <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-premium hover:shadow-md transition-all">
                <div class="flex items-start space-x-4">
                  <div class="p-3 bg-secondary-light rounded-xl text-secondary">
                    <i class="bi bi-compass text-xl"></i>
                  </div>
                  <div>
                    <h3 class="font-bold text-slate-800 text-lg mb-1">Misión</h3>
                    <p class="text-slate-600 text-sm leading-relaxed font-medium">
                      {{ config.settings()?.mission }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Tarjeta Visión -->
              <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-premium hover:shadow-md transition-all">
                <div class="flex items-start space-x-4">
                  <div class="p-3 bg-accent/10 rounded-xl text-accent">
                    <i class="bi bi-eye text-xl"></i>
                  </div>
                  <div>
                    <h3 class="font-bold text-slate-800 text-lg mb-1">Visión</h3>
                    <p class="text-slate-600 text-sm leading-relaxed font-medium">
                      {{ config.settings()?.vision }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <!-- SECCIÓN LÍNEAS DE INVESTIGACIÓN (CARDS PRESETED) -->
      <section class="bg-slate-100 py-24 border-y border-slate-200/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div class="text-center space-y-3 mb-16">
            <span class="text-xs font-bold text-primary uppercase tracking-widest">Ejes de Estudio</span>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">Líneas de Investigación</h2>
            <div class="w-16 h-1 bg-primary mx-auto rounded-full"></div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div *ngFor="let line of config.settings()?.research_lines" 
                 class="group bg-white rounded-3xl p-8 border border-slate-200/50 shadow-premium hover:shadow-hover hover:-translate-y-1.5 transition-all duration-300">
              
              <!-- Icono dinámico -->
              <div class="w-14 h-14 rounded-2xl bg-primary-light text-primary flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                <i class="bi text-2xl" [ngClass]="line.icon || 'bi-gear'"></i>
              </div>

              <!-- Título -->
              <h3 class="text-xl font-bold text-slate-800 tracking-tight mb-4 group-hover:text-primary transition-colors leading-snug">
                {{ line.title }}
              </h3>

              <!-- Descripción -->
              <p class="text-slate-600 text-sm leading-relaxed">
                {{ line.description }}
              </p>
            </div>
          </div>

        </div>
      </section>

      <!-- SECCIÓN METAS / LLAMADO A LA ACCIÓN -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="relative rounded-3xl overflow-hidden bg-slate-900 px-8 py-12 md:py-20 shadow-2xl text-center space-y-8">
          
          <!-- Background de Acento -->
          <div class="absolute inset-0 bg-gradient-to-tr from-primary/30 to-secondary/10 opacity-30 pointer-events-none"></div>

          <div class="relative max-w-2xl mx-auto space-y-6">
            <h2 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              ¿Deseas saber más sobre nuestras investigaciones o colaborar con nosotros?
            </h2>
            <p class="text-slate-300 text-base leading-relaxed">
              Estamos en constante búsqueda de sinergias institucionales, proyectos aplicados y nuevos investigadores éticos comprometidos con el desarrollo sustentable.
            </p>
            <div class="pt-4">
              <button routerLink="/contacto" 
                      class="px-8 py-4 bg-secondary hover:bg-secondary-hover text-slate-900 rounded-xl text-base font-bold shadow-lg hover:shadow-secondary/20 hover:-translate-y-0.5 transition-all duration-200">
                Escríbenos Hoy Mismo
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  `
})
export class HomeComponent {
  config = inject(ConfigService);
}
