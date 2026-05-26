import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ConfigService } from '../../core/services/config.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 font-sans">
      
      <!-- Cabecera de Página -->
      <div class="text-center space-y-3">
        <span class="text-xs font-bold text-primary uppercase tracking-widest">Canales de Enlace</span>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">Formulario de Contacto</h1>
        <div class="w-16 h-1 bg-primary mx-auto rounded-full"></div>
        <p class="text-slate-500 text-sm max-w-xl mx-auto">
          ¿Tienes alguna inquietud, propuesta de proyecto o interés de cooperación científica? Escríbenos directamente o visítanos en la facultad.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
        
        <!-- Tarjetas de Información de Contacto (4 cols) -->
        <div class="lg:col-span-5 space-y-6 flex flex-col justify-between">
          
          <div class="space-y-6">
            <span class="text-xs font-bold text-secondary uppercase tracking-widest block">Ubicación Física</span>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">Coordenadas Institucionales</h2>
            
            <div class="space-y-4">
              <!-- Tarjeta Dirección -->
              <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-premium flex items-start space-x-4 hover:shadow-md transition-shadow">
                <div class="p-3 bg-primary-light rounded-xl text-primary flex-shrink-0">
                  <i class="bi bi-geo-alt-fill text-xl"></i>
                </div>
                <div class="space-y-1">
                  <h3 class="font-bold text-slate-800 text-sm uppercase tracking-wider">Dirección</h3>
                  <p class="text-slate-600 text-xs leading-relaxed">
                    {{ config.settings()?.contact_address }}
                  </p>
                </div>
              </div>

              <!-- Tarjeta Ubicación -->
              <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-premium flex items-start space-x-4 hover:shadow-md transition-shadow">
                <div class="p-3 bg-secondary-light rounded-xl text-secondary flex-shrink-0">
                  <i class="bi bi-map-fill text-xl"></i>
                </div>
                <div class="space-y-1">
                  <h3 class="font-bold text-slate-800 text-sm uppercase tracking-wider">Ubicación</h3>
                  <p class="text-slate-600 text-xs leading-relaxed">
                    {{ config.settings()?.contact_location }}
                  </p>
                </div>
              </div>

              <!-- Tarjeta Correo -->
              <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-premium flex items-start space-x-4 hover:shadow-md transition-shadow">
                <div class="p-3 bg-accent/10 rounded-xl text-accent flex-shrink-0">
                  <i class="bi bi-envelope-at-fill text-xl"></i>
                </div>
                <div class="space-y-1">
                  <h3 class="font-bold text-slate-800 text-sm uppercase tracking-wider">Correo Institucional</h3>
                  <a [href]="'mailto:' + config.settings()?.contact_email" class="text-primary hover:underline text-xs font-semibold leading-relaxed">
                    {{ config.settings()?.contact_email }}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Mapa Estático UTA Representativo de Diseño Premium -->
          <div class="relative overflow-hidden rounded-3xl h-52 bg-slate-900 border border-slate-100 shadow-premium flex items-center justify-center p-6 text-center">
            <div class="absolute inset-0 bg-gradient-to-tr from-primary/40 to-slate-950/90 mix-blend-multiply pointer-events-none"></div>
            <div class="relative space-y-3">
              <i class="bi bi-compass text-white text-3xl animate-spin-slow"></i>
              <h4 class="text-white font-bold text-sm">FISEI - Campus Huachi</h4>
              <p class="text-slate-300 text-xs max-w-xs mx-auto">
                Facultad de Ingeniería en Sistemas, Electrónica e Industrial. Ambato – Ecuador.
              </p>
            </div>
          </div>

        </div>

        <!-- Formulario Reactivo Funcional (7 cols) -->
        <div class="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-premium flex flex-col justify-between">
          
          <div class="space-y-6">
            <div class="space-y-1">
              <h2 class="text-2xl font-extrabold text-slate-800 tracking-tight leading-tight">Buzón de Mensajería</h2>
              <p class="text-slate-400 text-xs">Todos los campos con (*) son de llenado obligatorio y se validan con seguridad.</p>
            </div>

            <!-- Alertas de Envío -->
            <div *ngIf="messageStatus() === 'success'" 
                 class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold rounded-2xl flex items-center space-x-3 shadow-sm animate-scale-in">
              <i class="bi bi-patch-check-fill text-xl text-emerald-500"></i>
              <span>{{ alertMessage() }}</span>
            </div>

            <div *ngIf="messageStatus() === 'error'" 
                 class="p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-2xl flex items-center space-x-3 shadow-sm animate-scale-in">
              <i class="bi bi-exclamation-triangle-fill text-xl text-red-500"></i>
              <span>{{ alertMessage() }}</span>
            </div>

            <!-- Formulario HTML -->
            <form [formGroup]="contactForm" (ngSubmit)="onSubmit()" class="space-y-5">
              
              <!-- Nombres -->
              <div class="space-y-1.5">
                <label for="names" class="text-xs font-bold text-slate-700 uppercase tracking-wider block">Nombres y Apellidos *</label>
                <div class="relative flex items-center">
                  <i class="bi bi-person-fill absolute left-4 text-slate-400 text-lg"></i>
                  <input type="text" id="names" formControlName="names" placeholder="Ej: Diana Elizabeth Gómez"
                         class="w-full bg-slate-50 border-0 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 font-medium placeholder-slate-400 transition-all"
                         [ngClass]="{'ring-2 ring-red-500/20 bg-red-50/10': isFieldInvalid('names')}">
                </div>
                <span *ngIf="isFieldInvalid('names')" class="text-xs text-red-500 font-medium block">
                  Los nombres son requeridos y deben ser un formato válido.
                </span>
              </div>

              <!-- Email -->
              <div class="space-y-1.5">
                <label for="email" class="text-xs font-bold text-slate-700 uppercase tracking-wider block">Correo Electrónico *</label>
                <div class="relative flex items-center">
                  <i class="bi bi-envelope-fill absolute left-4 text-slate-400 text-lg"></i>
                  <input type="email" id="email" formControlName="email" placeholder="Ej: dgomez@example.com"
                         class="w-full bg-slate-50 border-0 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 font-medium placeholder-slate-400 transition-all"
                         [ngClass]="{'ring-2 ring-red-500/20 bg-red-50/10': isFieldInvalid('email')}">
                </div>
                <span *ngIf="isFieldInvalid('email')" class="text-xs text-red-500 font-medium block">
                  Por favor, ingrese un correo electrónico válido.
                </span>
              </div>

              <!-- Asunto -->
              <div class="space-y-1.5">
                <label for="subject" class="text-xs font-bold text-slate-700 uppercase tracking-wider block">Asunto del Mensaje *</label>
                <div class="relative flex items-center">
                  <i class="bi bi-bookmark-fill absolute left-4 text-slate-400 text-lg"></i>
                  <input type="text" id="subject" formControlName="subject" placeholder="Ej: Solicitud de cooperación académica"
                         class="w-full bg-slate-50 border-0 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 font-medium placeholder-slate-400 transition-all"
                         [ngClass]="{'ring-2 ring-red-500/20 bg-red-50/10': isFieldInvalid('subject')}">
                </div>
                <span *ngIf="isFieldInvalid('subject')" class="text-xs text-red-500 font-medium block">
                  El asunto es requerido.
                </span>
              </div>

              <!-- Mensaje -->
              <div class="space-y-1.5">
                <label for="message" class="text-xs font-bold text-slate-700 uppercase tracking-wider block">Mensaje Completo *</label>
                <textarea id="message" formControlName="message" rows="4" placeholder="Escriba su consulta aquí de manera detallada (mínimo 10 caracteres)..."
                          class="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-700 font-medium placeholder-slate-400 transition-all resize-none"
                          [ngClass]="{'ring-2 ring-red-500/20 bg-red-50/10': isFieldInvalid('message')}"></textarea>
                <span *ngIf="isFieldInvalid('message')" class="text-xs text-red-500 font-medium block">
                  El mensaje debe contener al menos 10 caracteres.
                </span>
              </div>

              <div class="pt-2">
                <button type="submit" [disabled]="isSubmitting() || contactForm.invalid"
                        class="w-full py-4 bg-primary hover:bg-primary-hover disabled:bg-slate-300 disabled:shadow-none text-white rounded-xl text-base font-bold shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 disabled:translate-y-0 flex items-center justify-center space-x-2 transition-all duration-200">
                  <i *ngIf="isSubmitting()" class="animate-spin bi bi-arrow-repeat text-lg"></i>
                  <span>{{ isSubmitting() ? 'Procesando Envío...' : 'Enviar Mensaje de Contacto' }}</span>
                </button>
              </div>

            </form>
          </div>

        </div>

      </div>

    </div>
  `,
  styles: [`
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .animate-spin-slow {
      animation: spin-slow 15s linear infinite;
    }
  `]
})
export class ContactComponent {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  config = inject(ConfigService);

  contactForm: FormGroup;
  isSubmitting = signal(false);
  messageStatus = signal<'idle' | 'success' | 'error'>('idle');
  alertMessage = signal('');

  constructor() {
    // Configurar validaciones del formulario reactivo
    this.contactForm = this.fb.group({
      names: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.maxLength(200)]],
      message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]]
    });
  }

  // Comprobar validez de campos para alertas CSS
  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.contactForm.invalid) return;

    this.isSubmitting.set(true);
    this.messageStatus.set('idle');

    this.http.post<{ success: boolean; message: string }>('/api/contact', this.contactForm.value)
      .subscribe({
        next: (res) => {
          if (res && res.success) {
            this.messageStatus.set('success');
            this.alertMessage.set(res.message);
            this.contactForm.reset(); // Limpiar el formulario
          } else {
            this.messageStatus.set('error');
            this.alertMessage.set(res.message || 'Ocurrió un error al enviar el mensaje.');
          }
          this.isSubmitting.set(false);
        },
        error: (err) => {
          console.error('Error al enviar mensaje de contacto:', err);
          this.messageStatus.set('error');
          
          const errorMsg = err.error?.message || 'Error de conexión. Es posible que haya excedido el límite de envíos (3 mensajes por IP cada 15 min).';
          this.alertMessage.set(errorMsg);
          this.isSubmitting.set(false);
        }
      });
  }
}
