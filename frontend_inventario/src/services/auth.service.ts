import { api } from './api';
import type { LoginDto, RegisterDto, AuthResponse, User } from '../types';

export const authService = {
  // Login
  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  // Register
  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  // Get profile
  async getProfile(): Promise<User> {
    const response = await api.get<{ user: User }>('/users/me');
    return response.data.user;
  },

  // Guardar token y usuario en localStorage
  saveAuth(authResponse: AuthResponse) {
    localStorage.setItem('token', authResponse.access_token);
    localStorage.setItem('user', JSON.stringify(authResponse.user));
  },

  // Limpiar autenticación
  clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Verificar si está autenticado
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },

  // Obtener usuario guardado
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};