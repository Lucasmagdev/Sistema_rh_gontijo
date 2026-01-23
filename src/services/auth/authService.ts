/**
 * Serviço de autenticação
 * 
 * Este serviço gerencia autenticação local usando localStorage.
 * Foi projetado para ser facilmente substituído por autenticação real
 * (Supabase, SSO, Microsoft, etc.) no futuro sem refatorações grandes.
 */

import { validateCredentials } from '../users/userService';

const AUTH_STORAGE_KEY = 'transit_route_auth';
const AUTH_TOKEN_KEY = 'transit_route_token';

export interface AuthUser {
  email: string;
  name: string;
  role?: 'admin' | 'operador' | 'gestor';
  // Campos adicionais podem ser adicionados aqui no futuro
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
}

/**
 * Realiza login - valida contra usuários do sistema
 * No futuro, esta função será substituída por chamada real ao backend
 */
export async function login(email: string, password: string): Promise<AuthState> {
  // Simulação de delay de rede
  await new Promise(resolve => setTimeout(resolve, 500));

  // Valida credenciais usando o serviço de usuários
  const userCredentials = validateCredentials(email, password);

  if (!userCredentials) {
    throw new Error('Credenciais inválidas. Verifique seu email e senha.');
  }

  const user: AuthUser = {
    email: userCredentials.email,
    name: userCredentials.name,
    role: userCredentials.role,
  };

  const token = `temp_token_${Date.now()}`;
  const authState: AuthState = {
    isAuthenticated: true,
    user,
    token,
  };

  // Salva no localStorage
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
  localStorage.setItem(AUTH_TOKEN_KEY, token);

  return authState;
}

/**
 * Realiza logout do usuário
 */
export function logout(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

/**
 * Verifica se o usuário está autenticado
 */
export function isAuthenticated(): boolean {
  const authState = getAuthState();
  return authState.isAuthenticated && authState.user !== null;
}

/**
 * Obtém o estado atual de autenticação
 */
export function getAuthState(): AuthState {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) {
      return { isAuthenticated: false, user: null, token: null };
    }

    const authState = JSON.parse(stored) as AuthState;
    
    // Validação básica
    if (authState.isAuthenticated && authState.user && authState.token) {
      return authState;
    }

    return { isAuthenticated: false, user: null, token: null };
  } catch (error) {
    console.error('Error reading auth state:', error);
    return { isAuthenticated: false, user: null, token: null };
  }
}

/**
 * Obtém o usuário atual autenticado
 */
export function getCurrentUser(): AuthUser | null {
  const authState = getAuthState();
  return authState.user;
}

/**
 * Obtém o token de autenticação
 * Útil para futuras integrações com APIs
 */
export function getAuthToken(): string | null {
  const authState = getAuthState();
  return authState.token;
}

