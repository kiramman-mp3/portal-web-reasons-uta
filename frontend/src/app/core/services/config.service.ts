import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface SiteSettings {
  id: number;
  logo_url: string;
  group_name: string;
  institution: string;
  description: string;
  objective_general: string;
  mission: string;
  vision: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  contact_address: string;
  contact_location: string;
  contact_email: string;
  specific_objectives?: any[];
  research_lines?: any[];
  hero_slides?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private readonly apiUrl = '/api/settings';

  // Signal para almacenar la configuración de forma reactiva
  settings = signal<SiteSettings | null>(null);

  // Computeds útiles para las diferentes partes del portal
  groupName = computed(() => this.settings()?.group_name || 'REASONS');
  institution = computed(() => this.settings()?.institution || 'Universidad Técnica de Ambato');
  logoUrl = computed(() => {
    const url = this.settings()?.logo_url || 'uploads/logo_reasons.png';
    return `/${url}`;
  });

  constructor(private http: HttpClient) {}

  // Cargar configuración de forma síncrona/inicial en el arranque de la app
  async loadConfig(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ success: boolean; data: SiteSettings }>(this.apiUrl)
      );

      if (response && response.success) {
        this.settings.set(response.data);
        this.applyDynamicColors(response.data);
      }
    } catch (error) {
      console.error('Error al cargar la configuración dinámica del sitio:', error);
      // Fallback predeterminado en caso de fallo de conexión a la API
      const fallback: SiteSettings = {
        id: 1,
        logo_url: 'uploads/logo_reasons.png',
        group_name: 'REASONS',
        institution: 'Universidad Técnica de Ambato',
        description: 'Grupo de investigación que impulsa soluciones innovadoras en ingeniería con un enfoque de sostenibilidad y compromiso social.',
        objective_general: 'Desarrollar investigación aplicada e interdisciplinaria en el campo de la ingeniería.',
        mission: 'Generar conocimiento científico y aplicado en el área de ingeniería mediante proyectos éticos de alto impacto.',
        vision: 'Ser reconocidos a nivel nacional e internacional como un grupo de investigación referente.',
        primary_color: '#0A5C36',
        secondary_color: '#F4A261',
        accent_color: '#1D3557',
        contact_address: 'Av. de Los Chasquis y Av. Río Payamino. Facultad de Ingeniería en Sistemas, Electrónica e Industrial.',
        contact_location: 'Universidad Técnica de Ambato. Ambato – Ecuador.',
        contact_email: 'reasons@uta.edu.ec'
      };
      this.settings.set(fallback);
      this.applyDynamicColors(fallback);
    }
  }

  // Inyectar variables CSS dinámicas en el :root
  private applyDynamicColors(data: SiteSettings): void {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', data.primary_color);
    root.style.setProperty('--color-secondary', data.secondary_color);
    root.style.setProperty('--color-accent', data.accent_color);

    // Generar variantes automáticas más oscuras para hovers
    root.style.setProperty('--color-primary-hover', this.adjustColorBrightness(data.primary_color, -20));
    root.style.setProperty('--color-secondary-hover', this.adjustColorBrightness(data.secondary_color, -20));
    root.style.setProperty('--color-accent-hover', this.adjustColorBrightness(data.accent_color, -20));

    // Generar variantes claras para fondos suaves
    root.style.setProperty('--color-primary-light', this.adjustColorBrightness(data.primary_color, 210));
    root.style.setProperty('--color-secondary-light', this.adjustColorBrightness(data.secondary_color, 210));
  }

  // Utilidad para aclarar u oscurecer un código hexadecimal
  private adjustColorBrightness(hex: string, percent: number): string {
    let R = parseInt(hex.substring(1, 3), 16);
    let G = parseInt(hex.substring(3, 5), 16);
    let B = parseInt(hex.substring(5, 7), 16);

    R = Math.max(0, Math.min(255, R + percent));
    G = Math.max(0, Math.min(255, G + percent));
    B = Math.max(0, Math.min(255, B + percent));

    const rHex = R.toString(16).padStart(2, '0');
    const gHex = G.toString(16).padStart(2, '0');
    const bHex = B.toString(16).padStart(2, '0');

    return `#${rHex}${gHex}${bHex}`;
  }
}
