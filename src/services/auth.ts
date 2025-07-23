// Authentication service for GreenTwin application

// User interface
export interface User {
  id: number;
  email: string;
  name: string;
  imageUrl?: string;
  role: 'USER' | 'ADMIN';
  totalScore: number;
}

// Login credentials interface
export interface LoginCredentials {
  email: string;
  password: string;
}

// Authentication response interface
export interface AuthResponse {
  user: User;
  token: string;
}

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Local storage keys
const TOKEN_KEY = 'greentwin_token';
const USER_KEY = 'greentwin_user';

/**
 * Login function
 * @param credentials User credentials
 * @returns AuthResponse with user and token
 */
export async function login(credentials: LoginCredentials): Promise<User> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Autentificare eșuată');
    }

    const data = await response.json();

    // Store token and user in local storage
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data));

    console.log('data:', data);

    return data;
  } catch (error) {
    console.error('Eroare la autentificare:', error);
    throw error;
  }
}

/**
 * Register function
 * @param userData User registration data
 * @returns AuthResponse with user and token
 */
export async function register(userData: { email: string; password: string; name: string }): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Înregistrare eșuată');
    }

    const data = await response.json();

    // Store token and user in local storage
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));

    return data;
  } catch (error) {
    console.error('Eroare la înregistrare:', error);
    throw error;
  }
}

/**
 * Logout function
 */
export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Get current user from local storage
 * @returns User object or null if not logged in
 */
export function getCurrentUser(): User | null {
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;

  try {
    return JSON.parse(userJson) as User;
  } catch (error) {
    console.error('Eroare la parsarea datelor utilizatorului:', error);
    return null;
  }
}

/**
 * Get authentication token
 * @returns Token string or null if not logged in
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Check if user is authenticated
 * @returns boolean indicating if user is logged in
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}

/**
 * Check if current user is an admin
 * @returns boolean indicating if user is an admin
 */
export function isAdmin(): boolean {
  const user = getCurrentUser();
  return !!user && user.role === 'ADMIN';
}
