import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ConfigService } from '../../core/services/config.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-20 pb-20 font-sans bg-slate-50/50">
      
      <!-- HERO SECTION PREMIUM (CON CARRUSEL DE IMÁGENES COMPLETO Y GLASSMORPHISM) -->
      <section class="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-950 px-4 sm:px-6 lg:px-8 py-20">
        
        <!-- Carrusel de imágenes de fondo (abarca todo el fondo) -->
        <div class="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div *ngFor="let slide of slides(); let i = index" 
               [ngClass]="currentSlideIndex() === i ? 'opacity-100 scale-100' : 'opacity-0 scale-105'"
               class="absolute inset-0 w-full h-full transition-all duration-[1200ms] ease-in-out transform">
            <img [src]="'/' + slide.image_url" [alt]="slide.title" class="w-full h-full object-cover">
          </div>
          <!-- Difuminado (backdrop-blur) y oscurecimiento superpuestos para legibilidad -->
          <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-[7px]"></div>
        </div>

        <!-- Círculos de Luces de Acento en Background (Efecto Moderno) -->
        <div class="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] rounded-full bg-primary/20 blur-[130px] pointer-events-none z-10"></div>
        <div class="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[30rem] h-[30rem] rounded-full bg-secondary/15 blur-[110px] pointer-events-none z-10"></div>

        <!-- Contenido principal centrado -->
        <div class="relative z-20 max-w-4xl mx-auto text-center space-y-8 text-white py-16">
          
          <!-- Insignia Institucional con Logo Mini -->
          <div class="inline-flex items-center space-x-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md animate-fade-in">
            <span class="w-2.5 h-2.5 rounded-full bg-secondary animate-ping"></span>
            <img [src]="config.logoUrl()" alt="Mini Logo" class="w-5 h-5 object-contain bg-white rounded-sm p-0.5">
            <span class="text-slate-300 text-xs font-semibold uppercase tracking-wider">
              {{ config.settings()?.institution }}
            </span>
          </div>

          <!-- Logotipo de la Marca -->
          <div class="flex justify-center">
            <div class="p-2.5 bg-white rounded-2xl shadow-2xl w-24 h-24 flex items-center justify-center border border-white/10 transform hover:scale-105 transition-all">
              <img [src]="config.logoUrl()" alt="Logo REASONS" class="max-h-full max-w-full object-contain">
            </div>
          </div>

          <!-- Título Principal Dinámico del Slide -->
          <div class="space-y-4">
            <h1 class="text-4xl sm:text-6xl font-black tracking-tight leading-none drop-shadow-lg text-white">
              {{ slides()[currentSlideIndex()].title }}
            </h1>
            <p class="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-md">
              {{ slides()[currentSlideIndex()].subtitle }}
            </p>
          </div>

          <!-- Botones de Acción Premium -->
          <div class="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <button routerLink="/proyectos" 
                    class="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-hover text-white rounded-xl text-base font-bold shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
              Proyectos de Investigación
            </button>
            <button routerLink="/equipo" 
                    class="w-full sm:w-auto px-8 py-4 border border-white/20 hover:border-white/35 text-white rounded-xl text-base font-semibold hover:bg-white/5 backdrop-blur-sm hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
              Conocer al Equipo
            </button>
          </div>

          <!-- Controles de Carrusel Manuales (Flechas y Círculos) -->
          <div class="flex items-center justify-center space-x-6 pt-8">
            <button (click)="prevSlide()" class="p-2.5 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:scale-110 active:scale-95 transition-all cursor-pointer" title="Anterior">
              <i class="bi bi-arrow-left text-lg"></i>
            </button>
            
            <div class="flex space-x-2">
              <button *ngFor="let slide of slides(); let idx = index" 
                      (click)="setSlide(idx)" 
                      [ngClass]="currentSlideIndex() === idx ? 'bg-secondary w-8' : 'bg-white/30 w-2.5 hover:bg-white/60'"
                      class="h-2.5 rounded-full transition-all duration-300 cursor-pointer" [title]="'Diapositiva ' + (idx + 1)"></button>
            </div>

            <button (click)="nextSlide()" class="p-2.5 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:scale-110 active:scale-95 transition-all cursor-pointer" title="Siguiente">
              <i class="bi bi-arrow-right text-lg"></i>
            </button>
          </div>

        </div>

        <!-- Flecha de Desplazamiento Suave -->
        <div class="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/30 animate-bounce cursor-pointer">
          <i class="bi bi-chevron-down text-2xl"></i>
        </div>
      </section>

      <!-- SECCIÓN OBJETIVO GENERAL Y MISIÓN/VISIÓN -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <!-- Columna Izquierda: Imagen Ilustrativa de Marca -->
          <div class="lg:col-span-5 relative group">
            <div class="absolute inset-0 bg-gradient-to-tr from-primary to-secondary rounded-3xl blur-2xl opacity-10 group-hover:opacity-15 transition-opacity duration-300"></div>
            <div class="relative bg-white rounded-3xl overflow-hidden shadow-premium border border-slate-100 p-4">
              <img src="/sustainability_research.png" alt="Sostenibilidad y Desarrollo Tecnológico" class="w-full h-[450px] object-cover rounded-2xl transform hover:scale-[1.02] transition-transform duration-500">
              <div class="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-slate-100/50 shadow-lg text-slate-800">
                <span class="text-[9px] font-extrabold uppercase tracking-widest text-primary block mb-1">Impacto Global</span>
                <p class="text-xs font-semibold leading-relaxed">
                  Comprometidos con el desarrollo sustentable y el bienestar a través del conocimiento científico aplicado.
                </p>
              </div>
            </div>
          </div>

          <!-- Columna Derecha: Objetivo General y Propósito -->
          <div class="lg:col-span-7 space-y-8">
            
            <div class="relative bg-white rounded-3xl p-8 border border-slate-100 shadow-premium">
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

            <!-- Misión y Visión -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <!-- Tarjeta Misión -->
              <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-premium hover:shadow-md transition-all">
                <div class="flex items-start space-x-3.5">
                  <div class="p-2.5 bg-secondary-light rounded-xl text-secondary">
                    <i class="bi bi-compass text-lg"></i>
                  </div>
                  <div>
                    <h3 class="font-bold text-slate-800 text-base mb-1">Misión</h3>
                    <p class="text-slate-600 text-xs leading-relaxed font-medium">
                      {{ config.settings()?.mission }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Tarjeta Visión -->
              <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-premium hover:shadow-md transition-all">
                <div class="flex items-start space-x-3.5">
                  <div class="p-2.5 bg-accent/10 rounded-xl text-accent">
                    <i class="bi bi-eye text-lg"></i>
                  </div>
                  <div>
                    <h3 class="font-bold text-slate-800 text-base mb-1">Visión</h3>
                    <p class="text-slate-600 text-xs leading-relaxed font-medium">
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
                 class="group bg-white rounded-3xl p-8 border border-slate-200/50 shadow-premium hover:shadow-hover hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full">
              
              <div>
                <!-- Icono dinámico -->
                <div class="w-14 h-14 rounded-2xl bg-primary-light text-primary flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <i class="bi text-2xl" [ngClass]="line.icon || 'bi-gear'"></i>
                </div>

                <!-- Título -->
                <h3 class="text-xl font-bold text-slate-800 tracking-tight mb-4 group-hover:text-primary transition-colors leading-snug">
                  {{ line.title }}
                </h3>

                <!-- Descripción -->
                <p class="text-slate-600 text-sm leading-relaxed mb-4">
                  {{ line.description }}
                </p>
              </div>

              <!-- Líneas de Investigación específicas -->
              <div *ngIf="line.lines" class="mt-4 pt-4 border-t border-slate-100/80 space-y-2">
                <h4 class="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Líneas específicas:</h4>
                <ul class="space-y-2">
                  <li *ngFor="let item of line.lines.split(',')" class="flex items-start space-x-2 text-slate-600 text-xs font-semibold">
                    <span class="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 flex-shrink-0 animate-pulse"></span>
                    <span class="leading-tight">{{ item.trim() }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </section>

      <!-- SECCIÓN METAS / LLAMADO A LA ACCIÓN -->
      <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl p-8 sm:p-12 lg:p-16">
          
          <!-- Background de Acentos Lumínicos -->
          <div class="absolute -top-24 -left-24 w-[25rem] h-[25rem] rounded-full bg-primary/10 blur-[90px] pointer-events-none"></div>
          <div class="absolute -bottom-24 -right-24 w-[25rem] h-[25rem] rounded-full bg-secondary/10 blur-[90px] pointer-events-none"></div>

          <div class="relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <!-- Columna Izquierda: Ilustración de Colaboración -->
            <div class="lg:col-span-5 relative group">
              <div class="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-25"></div>
              <div class="relative bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                <img src="/team_collaboration.png" alt="Colaboración en REASONS" class="w-full h-[320px] object-cover object-center transform hover:scale-105 transition-transform duration-500">
              </div>
            </div>

            <!-- Columna Derecha: Texto e Interacción -->
            <div class="lg:col-span-7 space-y-6 text-left">
              <span class="text-xs font-bold text-secondary uppercase tracking-widest">Colaboración Científica</span>
              <h2 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                ¿Deseas saber más sobre nuestras investigaciones o colaborar con nosotros?
              </h2>
              <p class="text-slate-400 text-base leading-relaxed">
                Estamos en constante búsqueda de sinergias institucionales, proyectos interdisciplinarios aplicados y nuevos investigadores éticos comprometidos con el desarrollo tecnológico sustentable.
              </p>
              <div class="pt-2">
                <button routerLink="/contacto" 
                        class="w-full sm:w-auto px-8 py-4 bg-secondary hover:bg-secondary-hover text-slate-900 rounded-xl text-base font-bold shadow-lg hover:shadow-secondary/20 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                  Escríbenos Hoy Mismo
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

    </div>
  `
})
export class HomeComponent implements OnInit, OnDestroy {
  config = inject(ConfigService);

  currentSlideIndex = signal(0);
  private autoplayInterval: any = null;

  defaultSlides = [
    {
      image_url: 'uploads/hero_reasons.png',
      title: 'Ingeniería de Vanguardia',
      subtitle: 'Desarrollando investigación aplicada con un alto compromiso ético y tecnológico.'
    },
    {
      image_url: 'uploads/sustainability_research.png',
      title: 'Sostenibilidad e Impacto Global',
      subtitle: 'Comprometidos con el desarrollo sustentable y el bienestar a través del conocimiento científico aplicado.'
    },
    {
      image_url: 'uploads/team_collaboration.png',
      title: 'Colaboración Científica',
      subtitle: 'Estamos en constante búsqueda de sinergias institucionales y proyectos interdisciplinarios.'
    }
  ];

  // Señal computada para unir diapositivas del servidor con las de fallback
  slides = computed(() => {
    const list = this.config.settings()?.hero_slides;
    return list && list.length > 0 ? list : this.defaultSlides;
  });

  ngOnInit() {
    this.startAutoplay();
  }

  ngOnDestroy() {
    this.stopAutoplay();
  }

  startAutoplay() {
    this.stopAutoplay();
    this.autoplayInterval = setInterval(() => {
      this.nextSlide();
    }, 6000); // 6 segundos de ciclo
  }

  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  nextSlide() {
    const total = this.slides().length;
    if (total > 0) {
      this.currentSlideIndex.update(idx => (idx + 1) % total);
    }
  }

  prevSlide() {
    const total = this.slides().length;
    if (total > 0) {
      this.currentSlideIndex.update(idx => (idx - 1 + total) % total);
    }
  }

  setSlide(index: number) {
    this.currentSlideIndex.set(index);
    this.startAutoplay(); // Reinicia el temporizador
  }
}
