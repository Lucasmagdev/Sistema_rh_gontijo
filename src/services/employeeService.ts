import { Employee, EmployeeFormData } from '../types/employee';

const STORAGE_KEY = 'employees';

function getEmployees(): Employee[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  employees.push(newEmployee);
  saveEmployees(employees);
  return newEmployee;
}

export async function updateEmployee(id: string, data: EmployeeFormData): Promise<Employee> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const employees = getEmployees();
  const index = employees.findIndex(emp => emp.id === id);
  
  if (index === -1) {
    throw new Error('Colaborador não encontrado');
  }
  
  const existingEmployee = employees[index];
  
  const updatedAddresses = data.addresses.map((addr, idx) => {
    const existingAddr = existingEmployee.addresses.find(a => a.id === addr.id) ||
                        existingEmployee.addresses[idx];
    return {
      ...addr,
      id: addr.id || existingAddr?.id || crypto.randomUUID(),
    };
  });
  
  const updatedEmployee: Employee = {
    ...existingEmployee,
    ...data,
    addresses: updatedAddresses,
    updatedAt: new Date().toISOString(),
  };
  
  employees[index] = updatedEmployee;
  saveEmployees(employees);
  return updatedEmployee;
}

export async function deleteEmployee(id: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const employees = getEmployees();
  const filtered = employees.filter(emp => emp.id !== id);
  saveEmployees(filtered);
}

