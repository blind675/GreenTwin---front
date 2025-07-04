import api from '../api';

export interface User {
  id: number;
  name: string;
  email: string;
  token?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await api.post('/auth/login', credentials);
      const user = response.data;

      // Store token in localStorage
      if (user && user.token) {
        localStorage.setItem('token', user.token);
        localStorage.setItem('user', JSON.stringify(user));
      }

      return user;
    } catch (error) {
      console.log('API not available');
      throw new Error('Invalid credentials');
    }
  },

  async register(data: RegisterData): Promise<User> {
    try {
      const response = await api.post('/auth/', data);
      const user = response.data;

      // Store token in localStorage
      if (user && user.token) {
        localStorage.setItem('token', user.token);
        localStorage.setItem('user', JSON.stringify(user));
      }

      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error('Registration failed');
    }
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};

export default authService;
