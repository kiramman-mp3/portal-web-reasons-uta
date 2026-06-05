import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ConfigService } from '../../core/services/config.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-900 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      
      <!-- Luces de Fondo Estéticas -->
      <div class="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] rounded-full bg-primary/20 blur-[100px] pointer-events-none"></div>
      <div class="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[25rem] h-[25rem] rounded-full bg-secondary/10 blur-[80px] pointer-events-none"></div>
 
      <div class="max-w-md w-full relative z-10 space-y-8">
        
        <!-- Tarjeta de Login (Glassmorphism Oscuro) -->
        <div class="bg-slate-950/65 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-8">
          
          <!-- Encabezado Logo -->
          <div class="space-y-4">
            <div class="flex justify-center">
              <div class="p-2 bg-white rounded-2xl w-20 h-20 flex items-center justify-center border border-white/10 shadow-xl cursor-pointer" routerLink="/">
                <img [src]="config.logoUrl()" alt="Logo" class="max-h-full max-w-full object-contain">
              </div>
            </div>
            <div class="space-y-1">
              <h2 class="text-white text-xl font-bold tracking-tight">Acceso Privado Administrador</h2>
              <span class="text-xs text-slate-500 font-semibold uppercase tracking-wider">{{ config.groupName() }} - UTA</span>
            </div>
          </div>
 
          <!-- Alerta de Error de Autenticación -->
          <div *ngIf="errorMessage()" 
               class="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-2xl flex items-center space-x-2.5 shadow-sm animate-scale-in text-left">
            <i class="bi bi-exclamation-triangle-fill text-lg text-red-500 flex-shrink-0"></i>
            <span>{{ errorMessage() }}</span>
          </div>
 
          <!-- Formulario Reactivo -->
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5 text-left">
            
            <!-- Campo Usuario -->
            <div class="space-y-1.5">
              <label for="username" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Usuario Administrador *</label>
              <div class="relative flex items-center">
                <i class="bi bi-person-fill absolute left-4 text-slate-500 text-lg"></i>
                <input type="text" id="username" formControlName="username" placeholder="Ingrese su usuario (ej: admin)"
                       class="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-white font-medium placeholder-slate-600 transition-all"
                       [ngClass]="{'ring-2 ring-red-500/40 bg-red-500/5': isFieldInvalid('username')}">
              </div>
            </div>
 
            <!-- Campo Contraseña -->
            <div class="space-y-1.5">
              <label for="password" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Contraseña Secreta *</label>
              <div class="relative flex items-center">
                <i class="bi bi-shield-lock-fill absolute left-4 text-slate-500 text-lg"></i>
                <input type="password" id="password" formControlName="password" placeholder="Ingrese su contraseña"
                       class="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-white font-medium placeholder-slate-600 transition-all"
                       [ngClass]="{'ring-2 ring-red-500/40 bg-red-500/5': isFieldInvalid('password')}">
              </div>
            </div>
 
            <div class="pt-3">
              <button type="submit" [disabled]="isSubmitting() || loginForm.invalid"
                      class="w-full py-4 bg-primary hover:bg-primary-hover disabled:bg-slate-700 disabled:text-slate-400 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 disabled:translate-y-0 flex items-center justify-center space-x-2 transition-all duration-200">
                <i *ngIf="isSubmitting()" class="animate-spin bi bi-arrow-repeat text-lg"></i>
                <span>{{ isSubmitting() ? 'Iniciando Sesión...' : 'Iniciar Sesión en el Panel' }}</span>
              </button>
            </div>
 
          </form>
 
          <div class="pt-4 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-500 font-semibold uppercase">
            <a routerLink="/" class="hover:text-slate-300 transition-all">← Volver al Portal</a>
            <span>Sistema Protegido</span>
          </div>
 
        </div>
 
      </div>
 
    </div>
  `
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  config = inject(ConfigService);
 
  loginForm: FormGroup;
  isSubmitting = signal(false);
  errorMessage = signal('');
 
  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const { username, password } = this.loginForm.value;

    this.auth.login(username, password).subscribe({
      next: (res) => {
        if (res.success) {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.errorMessage.set(res.message || 'Error de autenticación.');
        }
        this.isSubmitting.set(false);
      },
      error: (err) => {
        console.error('Error en login:', err);
        const errorMsg = err.error?.message || 'Error de conexión. Es posible que el servidor backend esté apagado o haya excedido el límite de intentos (5 intentos por IP cada 15 min).';
        this.errorMessage.set(errorMsg);
        this.isSubmitting.set(false);
      }
    });
  }
}
