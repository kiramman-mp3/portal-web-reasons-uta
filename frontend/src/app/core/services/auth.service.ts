import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  username: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = '/api/auth';
  
  // Signal reactiva para almacenar el usuario activo
  currentUser = signal<User | null>(null);
  
  // computed para revisar el estado de autenticación
  isAuthenticated = computed(() => this.currentUser() !== null);

  constructor(private http: HttpClient) {
    this.restoreSession();
  }

  // Iniciar sesión como administrador
  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap(res => {
        if (res.success && res.token) {
          this.saveSession(res.token, res.user);
        }
      })
    );
  }

  // Guardar sesión en almacenamiento local
  private saveSession(token: string, user: User): void {
    localStorage.setItem('reasons_token', token);
    localStorage.setItem('reasons_user', JSON.stringify(user));
    this.currentUser.set(user);
  }

  // Cerrar sesión
  logout(): void {
    localStorage.removeItem('reasons_token');
    localStorage.removeItem('reasons_user');
    this.currentUser.set(null);
  }

  // Restaurar sesión persistente al recargar la página
  private restoreSession(): void {
    const token = localStorage.getItem('reasons_token');
    const userStr = localStorage.getItem('reasons_user');
    
    if (token && userStr) {
      try {
        this.currentUser.set(JSON.parse(userStr));
      } catch (e) {
        this.logout();
      }
    }
  }

  // Obtener el token JWT actual
  getToken(): string | null {
    return localStorage.getItem('reasons_token');
  }
}
