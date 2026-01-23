/**
 * Serviço de gerenciamento de usuários
 * 
 * Gerencia usuários do sistema usando localStorage.
 * No futuro, será migrado para Supabase ou outro backend.
 */

const USERS_STORAGE_KEY = 'saferoutehub_users';

export interface SystemUser {
  id: string;
  email: string;
  password: string; // Em produção, deve ser hash
  name: string;
  role: 'admin' | 'operador' | 'gestor';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Inicializa usuários padrão se não existirem
 */
function initializeDefaultUsers(): void {
  const existing = localStorage.getItem(USERS_STORAGE_KEY);
  if (existing) return;

  const defaultUsers: SystemUser[] = [
    {
      id: 'admin-001',
      email: 'admin@saferoutehub.com',
      password: 'admin123', // Em produção, deve ser hash
      name: 'Administrador',
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
}

/**
 * Obtém todos os usuários
 */
export function getAllUsers(): SystemUser[] {
  initializeDefaultUsers();
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as SystemUser[];
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
    return [];
  }
}

/**
 * Busca usuário por email
 */
export function getUserByEmail(email: string): SystemUser | null {
  const users = getAllUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.isActive) || null;
}

/**
 * Valida credenciais de login
 */
export function validateCredentials(email: string, password: string): SystemUser | null {
  const user = getUserByEmail(email);
  if (!user) return null;
  
  // Em produção, comparar hash da senha
  if (user.password !== password) return null;
  
  return user;
}

/**
 * Cria um novo usuário
 */
export function createUser(
  email: string,
  password: string,
  name: string,
  role: 'admin' | 'operador' | 'gestor' = 'operador'
): SystemUser {
  const users = getAllUsers();
  
  // Verificar se email já existe
  if (getUserByEmail(email)) {
    throw new Error('Email já cadastrado');
  }

  const newUser: SystemUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email: email.toLowerCase(),
    password, // Em produção, fazer hash
    name,
    role,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  
  return newUser;
}

/**
 * Atualiza um usuário
 */
export function updateUser(userId: string, updates: Partial<Omit<SystemUser, 'id' | 'createdAt'>>): SystemUser {
  const users = getAllUsers();
  const index = users.findIndex(u => u.id === userId);
  
  if (index === -1) {
    throw new Error('Usuário não encontrado');
  }

  users[index] = {
    ...users[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  return users[index];
}

/**
 * Remove um usuário (soft delete)
 */
export function deleteUser(userId: string): void {
  const user = getAllUsers().find(u => u.id === userId);
  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  // Não permitir deletar o admin padrão
  if (user.id === 'admin-001') {
    throw new Error('Não é possível deletar o usuário administrador padrão');
  }

  updateUser(userId, { isActive: false });
}

/**
 * Função helper para criar usuário via console (desenvolvimento)
 * Exemplo de uso no console do navegador:
 * window.createUser('novo@email.com', 'senha123', 'Nome do Usuário', 'admin')
 */
if (typeof window !== 'undefined') {
  (window as any).createUser = (
    email: string,
    password: string,
    name: string,
    role: 'admin' | 'operador' | 'gestor' = 'operador'
  ) => {
    try {
      const user = createUser(email, password, name, role);
      console.log('✅ Usuário criado com sucesso:', user);
      return user;
    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error);
      throw error;
    }
  };

  (window as any).listUsers = () => {
    const users = getAllUsers();
    console.table(users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      isActive: u.isActive,
    })));
    return users;
  };
}

// Inicializar usuários padrão ao importar
initializeDefaultUsers();

