import { Employee, AssignedRoute } from '../types/employee';
import { Route, Location, RouteRequest } from '../types/route';
import { getEmployeeById, updateEmployee } from './employeeService';

export async function assignRouteToEmployee(
  employeeId: string,
  route: Route,
  origin: Location,
  destination: Location,
  routeType: 'toWork' | 'fromWork'
): Promise<Employee> {
  const employee = await getEmployeeById(employeeId);
  if (!employee) {
    throw new Error('Colaborador não encontrado');
  }

  const assignedRoute: AssignedRoute = {
    id: crypto.randomUUID(),
    route,
    origin,
    destination,
    assignedAt: new Date().toISOString(),
    isActive: true,
  };

  // Criar objeto parcial com apenas a rota atualizada
  const routeUpdate: Partial<Employee> = {
    [routeType === 'toWork' ? 'routeToWork' : 'routeFromWork']: assignedRoute,
  };

  // Usar spread para manter outros campos
  const updatedEmployee = {
    ...employee,
    ...routeUpdate,
  };

  return await updateEmployee(employeeId, updatedEmployee);
}

export async function removeRouteFromEmployee(
  employeeId: string,
  routeType: 'toWork' | 'fromWork'
): Promise<Employee> {
  const employee = await getEmployeeById(employeeId);
  if (!employee) {
    throw new Error('Colaborador não encontrado');
  }

  const routeUpdate: Partial<Employee> = {
    [routeType === 'toWork' ? 'routeToWork' : 'routeFromWork']: undefined,
  };

  const updatedEmployee = {
    ...employee,
    ...routeUpdate,
  };

  return await updateEmployee(employeeId, updatedEmployee);
}

export async function toggleRouteActive(
  employeeId: string,
  routeType: 'toWork' | 'fromWork',
  isActive: boolean
): Promise<Employee> {
  const employee = await getEmployeeById(employeeId);
  if (!employee) {
    throw new Error('Colaborador não encontrado');
  }

  const route = routeType === 'toWork' ? employee.routeToWork : employee.routeFromWork;
  if (!route) {
    throw new Error('Rota não encontrada');
  }

  const updatedRoute: AssignedRoute = {
    ...route,
    isActive,
  };

  const routeUpdate: Partial<Employee> = {
    [routeType === 'toWork' ? 'routeToWork' : 'routeFromWork']: updatedRoute,
  };

  const updatedEmployee = {
    ...employee,
    ...routeUpdate,
  };

  return await updateEmployee(employeeId, updatedEmployee);
}

/**
 * Verifica se um colaborador já tem uma rota atribuída para a origem e destino especificados
 * Se encontrar, retorna a rota salva (evitando chamada à API)
 */
export function getEmployeeSavedRoute(
  employee: Employee,
  request: RouteRequest,
  routeType?: 'toWork' | 'fromWork'
): Route | null {
  // Se routeType especificado, verificar apenas essa rota
  if (routeType) {
    const assignedRoute = routeType === 'toWork' ? employee.routeToWork : employee.routeFromWork;
    if (assignedRoute?.isActive && isSameLocation(assignedRoute.origin, request.origin) && 
        isSameLocation(assignedRoute.destination, request.destination)) {
      console.log(`✅ Usando rota ${routeType === 'toWork' ? 'de ida' : 'de volta'} salva do colaborador - economia de requisição à API`);
      return assignedRoute.route;
    }
    return null;
  }

  // Se não especificado, verificar ambas as rotas
  const routeToWork = employee.routeToWork;
  const routeFromWork = employee.routeFromWork;

  // Verificar rota de ida
  if (routeToWork?.isActive && 
      isSameLocation(routeToWork.origin, request.origin) && 
      isSameLocation(routeToWork.destination, request.destination)) {
    console.log('✅ Usando rota de ida salva do colaborador - economia de requisição à API');
    return routeToWork.route;
  }

  // Verificar rota de volta
  if (routeFromWork?.isActive && 
      isSameLocation(routeFromWork.origin, request.origin) && 
      isSameLocation(routeFromWork.destination, request.destination)) {
    console.log('✅ Usando rota de volta salva do colaborador - economia de requisição à API');
    return routeFromWork.route;
  }

  return null;
}

/**
 * Verifica se duas localizações são a mesma (com tolerância de 0.001 graus ~= 100m)
 */
function isSameLocation(loc1: Location, loc2: Location): boolean {
  const tolerance = 0.001; // ~100 metros
  return (
    Math.abs(loc1.lat - loc2.lat) < tolerance &&
    Math.abs(loc1.lng - loc2.lng) < tolerance
  );
}
