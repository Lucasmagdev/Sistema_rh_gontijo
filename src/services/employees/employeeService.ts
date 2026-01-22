import { Employee, EmployeeFormData } from '../types/employee';

const STORAGE_KEY = 'employees';

function getEmployees(): Employee[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    const employees = JSON.parse(stored);
    // Garantir compatibilidade: adicionar busCards vazio se não existir
    return employees.map((emp: Employee) => ({
      ...emp,
      busCards: emp.busCards || [],
    }));
  } catch {
    return [];
  }
}

function saveEmployees(employees: Employee[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
}

export async function getAllEmployees(): Promise<Employee[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return getEmployees();
}

export async function getEmployeeById(id: string): Promise<Employee | null> {
  await new Promise(resolve => setTimeout(resolve, 200));
  const employees = getEmployees();
  return employees.find(emp => emp.id === id) || null;
}

export async function createEmployee(data: EmployeeFormData): Promise<Employee> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const employees = getEmployees();
  const newEmployee: Employee = {
    id: crypto.randomUUID(),
    ...data,
    addresses: data.addresses.map(addr => ({
      ...addr,
      id: crypto.randomUUID(),
    })),
    busCards: (data.busCards || []).map(card => ({
      ...card,
      id: crypto.randomUUID(),
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  employees.push(newEmployee);
  saveEmployees(employees);
  return newEmployee;
}

export async function updateEmployee(id: string, data: EmployeeFormData | Partial<Employee>): Promise<Employee> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const employees = getEmployees();
  const index = employees.findIndex(emp => emp.id === id);
  
  if (index === -1) {
    throw new Error('Colaborador não encontrado');
  }
  
  const existingEmployee = employees[index];
  
  // Se for EmployeeFormData, processar endereços e cartões
  if ('addresses' in data && Array.isArray(data.addresses)) {
    const updatedAddresses = data.addresses.map((addr, idx) => {
      const existingAddr = existingEmployee.addresses.find(a => a.id === addr.id) ||
                          existingEmployee.addresses[idx];
      return {
        ...addr,
        id: addr.id || existingAddr?.id || crypto.randomUUID(),
      };
    });

    const updatedBusCards = (data.busCards || []).map((card, idx) => {
      const existingCard = existingEmployee.busCards?.find(c => c.id === card.id) ||
                          existingEmployee.busCards?.[idx];
      return {
        ...card,
        id: card.id || existingCard?.id || crypto.randomUUID(),
      };
    });
    
    const updatedEmployee: Employee = {
      ...existingEmployee,
      ...data,
      addresses: updatedAddresses,
      busCards: updatedBusCards,
      updatedAt: new Date().toISOString(),
    };
    
    employees[index] = updatedEmployee;
    saveEmployees(employees);
    return updatedEmployee;
  } else {
    // Se for Partial<Employee>, fazer merge direto (para rotas)
    const updatedEmployee: Employee = {
      ...existingEmployee,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    employees[index] = updatedEmployee;
    saveEmployees(employees);
    return updatedEmployee;
  }
}

export async function deleteEmployee(id: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const employees = getEmployees();
  const filtered = employees.filter(emp => emp.id !== id);
  saveEmployees(filtered);
}

