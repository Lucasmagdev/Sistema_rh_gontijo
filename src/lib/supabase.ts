/**
 * Cliente Supabase
 * 
 * Configuração e inicialização do cliente Supabase para uso em toda a aplicação.
 * 
 * Variáveis de ambiente necessárias:
 * - VITE_SUPABASE_URL: URL do projeto Supabase
 * - VITE_SUPABASE_ANON_KEY: Chave pública (anon) do Supabase
 */

import { createClient } from '@supabase/supabase-js';

// Tipos do banco de dados (gerados automaticamente pelo Supabase CLI)
// Por enquanto, definimos manualmente baseado no schema criado
export interface Database {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          document: string;
          position: string;
          department: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone: string;
          document: string;
          position: string;
          department?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          document?: string;
          position?: string;
          department?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      addresses: {
        Row: {
          id: string;
          employee_id: string;
          street: string;
          number: string;
          complement: string | null;
          neighborhood: string;
          city: string;
          state: string;
          zip_code: string;
          lat: number | null;
          lng: number | null;
          is_main: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          street: string;
          number: string;
          complement?: string | null;
          neighborhood: string;
          city: string;
          state?: string;
          zip_code: string;
          lat?: number | null;
          lng?: number | null;
          is_main?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          street?: string;
          number?: string;
          complement?: string | null;
          neighborhood?: string;
          city?: string;
          state?: string;
          zip_code?: string;
          lat?: number | null;
          lng?: number | null;
          is_main?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      bus_cards: {
        Row: {
          id: string;
          employee_id: string;
          card_number: string;
          card_type: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          card_number: string;
          card_type?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          card_number?: string;
          card_type?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      assigned_routes: {
        Row: {
          id: string;
          employee_id: string;
          route_type: 'to_work' | 'from_work';
          route_data: Record<string, any>; // JSONB
          origin_data: Record<string, any>; // JSONB
          destination_data: Record<string, any>; // JSONB
          assigned_at: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employee_id: string;
          route_type: 'to_work' | 'from_work';
          route_data: Record<string, any>;
          origin_data: Record<string, any>;
          destination_data: Record<string, any>;
          assigned_at: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employee_id?: string;
          route_type?: 'to_work' | 'from_work';
          route_data?: Record<string, any>;
          origin_data?: Record<string, any>;
          destination_data?: Record<string, any>;
          assigned_at?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      locations: {
        Row: {
          id: string;
          name: string;
          city: string;
          lat: number;
          lng: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          city: string;
          lat: number;
          lng: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          city?: string;
          lat?: number;
          lng?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      bus_lines: {
        Row: {
          id: string;
          number: string;
          name: string;
          type: 'urbano' | 'metropolitano';
          route_id: string | null;
          direction_id: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          number: string;
          name: string;
          type: 'urbano' | 'metropolitano';
          route_id?: string | null;
          direction_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          number?: string;
          name?: string;
          type?: 'urbano' | 'metropolitano';
          route_id?: string | null;
          direction_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      system_settings: {
        Row: {
          id: string;
          user_id: string | null;
          settings_data: Record<string, any>; // JSONB
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          settings_data: Record<string, any>;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          settings_data?: Record<string, any>;
          updated_at?: string;
        };
      };
    };
  };
}

// Obter variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validação das variáveis de ambiente
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Variáveis de ambiente do Supabase não configuradas.\n' +
    'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env\n' +
    'O sistema continuará funcionando com localStorage como fallback.'
  );
}

// Criar cliente Supabase
// Se as variáveis não estiverem configuradas, o cliente ainda será criado
// mas as operações falharão (permitindo fallback para localStorage)
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// Log de debug para verificar configuração
console.log('🔧 Supabase URL:', supabaseUrl ? '✅ Configurado' : '❌ Não configurado');
console.log('🔧 Supabase Key:', supabaseAnonKey ? '✅ Configurado' : '❌ Não configurado');

/**
 * Verifica se o Supabase está configurado corretamente
 */
export function isSupabaseConfigured(): boolean {
  const configured = !!(supabaseUrl && supabaseAnonKey && 
           supabaseUrl !== 'https://placeholder.supabase.co' &&
           supabaseAnonKey !== 'placeholder-key');
  
  if (!configured) {
    console.warn('⚠️ Supabase não configurado. Verifique o arquivo .env');
    console.warn('   VITE_SUPABASE_URL:', supabaseUrl || 'NÃO DEFINIDO');
    console.warn('   VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'DEFINIDO' : 'NÃO DEFINIDO');
  }
  
  return configured;
}

/**
 * Testa a conexão com o Supabase
 */
export async function testSupabaseConnection(): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    const { error } = await supabase.from('employees').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}

