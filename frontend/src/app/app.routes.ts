import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  
  // 1. RUTAS PÚBLICAS CON PUBLIC LAYOUT (Cabecera y Pie de página públicos)
  {
    path: '',
    loadComponent: () => import('./shared/layouts/public-layout').then(m => m.PublicLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home').then(m => m.HomeComponent)
      },
      {
        path: 'equipo',
        loadComponent: () => import('./features/researchers/researchers').then(m => m.ResearchersComponent)
      },
      {
        path: 'proyectos',
        loadComponent: () => import('./features/projects/projects').then(m => m.ProjectsComponent)
      },
      {
        path: 'publicaciones',
        loadComponent: () => import('./features/publications/publications').then(m => m.PublicationsComponent)
      },
      {
        path: 'contacto',
        loadComponent: () => import('./features/contact/contact').then(m => m.ContactComponent)
      }
    ]
  },

  // 2. RUTA DE INICIO DE SESIÓN DE ADMINISTRACIÓN (Limpia sin layouts)
  {
    path: 'admin/login',
    loadComponent: () => import('./features/admin/login').then(m => m.LoginComponent)
  },

  // 3. RUTAS PRIVADAS DE ADMINISTRACIÓN CON ADMIN LAYOUT (Protegidas por JWT en AuthGuard)
  {
    path: 'admin',
    loadComponent: () => import('./shared/layouts/admin-layout').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard], // Protección estricta con guardia
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard').then(m => m.DashboardComponent)
      },
      {
        path: 'configuracion',
        loadComponent: () => import('./features/admin/settings').then(m => m.AdminSettingsComponent)
      },
      {
        path: 'investigadores',
        loadComponent: () => import('./features/admin/investigadores').then(m => m.AdminResearchersComponent)
      },
      {
        path: 'proyectos',
        loadComponent: () => import('./features/admin/proyectos').then(m => m.AdminProjectsComponent)
      },
      {
        path: 'publicaciones',
        loadComponent: () => import('./features/admin/publicaciones').then(m => m.AdminPublicationsComponent)
      },
      {
        path: 'mensajes',
        loadComponent: () => import('./features/admin/mensajes').then(m => m.AdminMessagesComponent)
      }
    ]
  },

  // 4. FALLBACK RUTA (Redirigir a Inicio en caso de ruta inexistente)
  {
    path: '**',
    redirectTo: ''
  }

];
