import { Employee, AssignedRoute } from '../types/employee';
import { Route, Location, RouteRequest } from '../types/route';
import { getEmployeeById, updateEmployee } from './employeeServiceSupabase';

export async function assignRouteToEmployee(
  employeeId: string,
  route: Route,
  origin: Location,
  destination: Location,
  routeType: 'toWork' | 'fromWork'
): Promise<Employee> {
  console.log('🔄 Atribuindo rota ao colaborador:', { employeeId, routeType });
  
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

  console.log('💾 Salvando rota no banco de dados...');
  const updatedEmployee = await updateEmployee(employeeId, routeUpdate);
  console.log('✅ Rota atribuída com sucesso!');
  
  return updatedEmployee;
}

export async function removeRouteFromEmployee(
  employeeId: string,
  routeType: 'toWork' | 'fromWork'
): Promise<Employee> {
  console.log('🗑️ Removendo rota do colaborador:', { employeeId, routeType });
  
  const employee = await getEmployeeById(employeeId);
  if (!employee) {
    throw new Error('Colaborador não encontrado');
  }

  const routeUpdate: Partial<Employee> = {
    [routeType === 'toWork' ? 'routeToWork' : 'routeFromWork']: undefined,
  };

  console.log('💾 Removendo rota do banco de dados...');
  const updatedEmployee = await updateEmployee(employeeId, routeUpdate);
  console.log('✅ Rota removida com sucesso!');
  
  return updatedEmployee;
}

export async function toggleRouteActive(
  employeeId: string,
  routeType: 'toWork' | 'fromWork',
  isActive: boolean
): Promise<Employee> {
  console.log('🔄 Alterando status da rota:', { employeeId, routeType, isActive });
  
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

  console.log('💾 Atualizando status da rota no banco de dados...');
  const updatedEmployee = await updateEmployee(employeeId, routeUpdate);
  console.log('✅ Status da rota atualizado com sucesso!');
  
  return updatedEmployee;
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
