import { DriverRoute, DriverRouteFormData, DriverRouteAssignment, RouteStop, PickupPoint } from '../types/driverRoute';
import { Employee } from '../types/employee';
import { Location } from '../types/route';
import { getAllEmployees } from './employeeServiceSupabase';

const STORAGE_KEY = 'driver_routes';
const ASSIGNMENTS_KEY = 'driver_route_assignments';
const PICKUP_POINTS_KEY = 'pickup_points';

/**
 * Cores pré-definidas para rotas de motoristas
 */
export const DRIVER_ROUTE_COLORS = [
  '#3B82F6', // Azul
  '#10B981', // Verde
  '#F59E0B', // Laranja
  '#EF4444', // Vermelho
  '#8B5CF6', // Roxo
  '#EC4899', // Rosa
  '#06B6D4', // Ciano
  '#84CC16', // Lima
  '#F97316', // Laranja escuro
  '#6366F1', // Índigo
];

/**
 * Decodifica um encoded polyline do Google em uma lista de coordenadas [lat, lng]
 */
function decodePolyline(encoded: string): [number, number][] {
  const coordinates: [number, number][] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let result = 0;
    let shift = 0;
    let b: number;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coordinates.push([lat / 1e5, lng / 1e5]);
  }

  return coordinates;
}

/**
 * Calcula a rota real de carro usando Google Directions API
 * Suporta paradas (waypoints) opcionais
 */
export async function calculateCarRoute(
  origin: Location, 
  destination: Location, 
  stops?: RouteStop[]
): Promise<[number, number][]> {
  const apiKey = import.meta.env.VITE_GOOGLE_ROUTES_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  console.log('🚗 Calculando rota de carro:', {
    origem: `${origin.name} (${origin.lat}, ${origin.lng})`,
    destino: `${destination.name} (${destination.lat}, ${destination.lng})`,
    apiKey: apiKey ? 'Configurada' : 'NÃO CONFIGURADA',
  });
  
  if (!apiKey) {
    console.warn('⚠️ Google API Key não configurada. Usando linha reta como fallback.');
    alert('⚠️ API Key do Google não configurada. A rota será exibida como linha reta. Configure VITE_GOOGLE_ROUTES_API_KEY no arquivo .env');
    // Fallback: linha reta
    return [
      [origin.lat, origin.lng],
      [destination.lat, destination.lng],
    ];
  }

  try {
    console.log('🌐 Fazendo requisição à API do Google Routes...', {
      stops: stops?.length || 0,
    });
    
    // Preparar waypoints se houver paradas
    const waypoints = stops && stops.length > 0
      ? stops
          .sort((a, b) => a.order - b.order) // Ordenar por ordem
          .map(stop => ({
            location: {
              latLng: {
                latitude: stop.location.lat,
                longitude: stop.location.lng,
              },
            },
            via: false, // Parada obrigatória (não apenas passar perto)
          }))
      : undefined;

    const requestBody: any = {
      origin: {
        location: {
          latLng: {
            latitude: origin.lat,
            longitude: origin.lng,
          },
        },
      },
      destination: {
        location: {
          latLng: {
            latitude: destination.lat,
            longitude: destination.lng,
          },
        },
      },
      travelMode: 'DRIVE', // Modo de carro
      routingPreference: 'TRAFFIC_AWARE', // Considerar tráfego
      languageCode: 'pt-BR',
      units: 'METRIC',
    };

    // Adicionar waypoints se houver
    if (waypoints && waypoints.length > 0) {
      requestBody.intermediates = waypoints;
    }

    const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'routes.polyline',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro ao calcular rota de carro:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      
      let errorMessage = 'Erro ao calcular rota';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorMessage;
      } catch {}
      
      alert(`⚠️ Erro ao calcular rota: ${errorMessage}. Usando linha reta como fallback.`);
      
      // Fallback: linha reta
      return [
        [origin.lat, origin.lng],
        [destination.lat, destination.lng],
      ];
    }

    const data = await response.json();
    console.log('✅ Resposta da API recebida:', data);
    
    const route = data.routes?.[0];
    
    if (!route || !route.polyline?.encodedPolyline) {
      console.warn('⚠️ Rota sem polyline. Usando linha reta como fallback.');
      // Fallback: linha reta
      return [
        [origin.lat, origin.lng],
        [destination.lat, destination.lng],
      ];
    }

    // Decodificar o polyline
    const path = decodePolyline(route.polyline.encodedPolyline);
    console.log(`✅ Rota calculada com sucesso! ${path.length} pontos no caminho.`);
    
    if (path.length <= 2) {
      console.warn('⚠️ Rota tem poucos pontos. Pode estar incorreta.');
    }
    
    return path;
  } catch (error) {
    console.error('❌ Erro ao calcular rota de carro:', error);
    alert(`⚠️ Erro ao calcular rota: ${error instanceof Error ? error.message : 'Erro desconhecido'}. Usando linha reta como fallback.`);
    // Fallback: linha reta
    return [
      [origin.lat, origin.lng],
      [destination.lat, destination.lng],
    ];
  }
}

/**
 * Salva rotas de motoristas no localStorage
 */
function saveDriverRoutes(routes: DriverRoute[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));
}

/**
 * Carrega rotas de motoristas do localStorage
 */
function loadDriverRoutes(): DriverRoute[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as DriverRoute[];
  } catch {
    return [];
  }
}

/**
 * Salva associações de colaboradores a rotas
 */
function saveAssignments(assignments: DriverRouteAssignment[]): void {
  localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments));
}

/**
 * Carrega associações de colaboradores a rotas
 */
function loadAssignments(): DriverRouteAssignment[] {
  const stored = localStorage.getItem(ASSIGNMENTS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as DriverRouteAssignment[];
  } catch {
    return [];
  }
}

/**
 * Busca todas as rotas de motoristas
 */
export async function getAllDriverRoutes(): Promise<DriverRoute[]> {
  const routes = loadDriverRoutes();
  const employees = await getAllEmployees();
  
  // Enriquecer rotas com dados dos motoristas e garantir que stops existe
  return routes.map(route => ({
    ...route,
    stops: route.stops || [], // Garantir que stops sempre existe
    driver: employees.find(emp => emp.id === route.driverId),
  }));
}

/**
 * Busca uma rota de motorista por ID
 */
export async function getDriverRouteById(id: string): Promise<DriverRoute | null> {
  const routes = await getAllDriverRoutes();
  return routes.find(r => r.id === id) || null;
}

/**
 * Busca rotas de um motorista específico
 */
export async function getDriverRoutesByDriver(driverId: string): Promise<DriverRoute[]> {
  const routes = await getAllDriverRoutes();
  return routes.filter(r => r.driverId === driverId && r.isActive);
}

/**
 * Cria uma nova rota de motorista
 */
export async function createDriverRoute(data: DriverRouteFormData): Promise<DriverRoute> {
  const routes = loadDriverRoutes();
  const newRoute: DriverRoute = {
    id: `driver_route_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...data,
    stops: data.stops || [],
    currentPassengers: [],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  routes.push(newRoute);
  saveDriverRoutes(routes);
  return newRoute;
}

/**
 * Atualiza uma rota de motorista
 */
export async function updateDriverRoute(
  id: string,
  data: Partial<DriverRouteFormData>
): Promise<DriverRoute> {
  const routes = loadDriverRoutes();
  const index = routes.findIndex(r => r.id === id);
  
  if (index === -1) {
    throw new Error('Rota de motorista não encontrada');
  }
  
  routes[index] = {
    ...routes[index],
    ...data,
    stops: data.stops !== undefined ? data.stops : routes[index].stops || [], // Preservar paradas se não fornecidas
    updatedAt: new Date().toISOString(),
  };
  
  saveDriverRoutes(routes);
  return routes[index];
}

/**
 * Remove uma rota de motorista
 */
export async function deleteDriverRoute(id: string): Promise<void> {
  const routes = loadDriverRoutes();
  const filtered = routes.filter(r => r.id !== id);
  saveDriverRoutes(filtered);
  
  // Remove também as associações desta rota
  const assignments = loadAssignments();
  const filteredAssignments = assignments.filter(a => a.driverRouteId !== id);
  saveAssignments(filteredAssignments);
}

/**
 * Associa um colaborador a uma rota de motorista
 */
export async function assignEmployeeToDriverRoute(
  employeeId: string,
  driverRouteId: string
): Promise<DriverRouteAssignment> {
  const assignments = loadAssignments();
  const routes = await getAllDriverRoutes();
  const route = routes.find(r => r.id === driverRouteId);
  
  if (!route) {
    throw new Error('Rota de motorista não encontrada');
  }
  
  // Remove associações anteriores do colaborador
  const otherAssignments = assignments.filter(
    a => a.employeeId === employeeId && a.isActive
  );
  otherAssignments.forEach(a => {
    a.isActive = false;
  });
  
  // Verifica capacidade
  const activePassengers = assignments.filter(
    a => a.driverRouteId === driverRouteId && a.isActive
  ).length;
  
  if (activePassengers >= route.capacity) {
    throw new Error('Rota de motorista está com capacidade máxima');
  }
  
  // Cria nova associação
  const newAssignment: DriverRouteAssignment = {
    id: `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    employeeId,
    driverRouteId,
    assignedAt: new Date().toISOString(),
    isActive: true,
  };
  
  assignments.push(...otherAssignments.map(a => ({ ...a })), newAssignment);
  saveAssignments(assignments);
  
  // Atualiza lista de passageiros na rota
  const updatedRoutes = loadDriverRoutes();
  const routeIndex = updatedRoutes.findIndex(r => r.id === driverRouteId);
  if (routeIndex !== -1) {
    updatedRoutes[routeIndex].currentPassengers = [
      ...updatedRoutes[routeIndex].currentPassengers.filter(p => p !== employeeId),
      employeeId,
    ];
    saveDriverRoutes(updatedRoutes);
  }
  
  return newAssignment;
}

/**
 * Remove associação de colaborador a rota de motorista
 */
export async function unassignEmployeeFromDriverRoute(
  employeeId: string,
  driverRouteId: string
): Promise<void> {
  const assignments = loadAssignments();
  const assignment = assignments.find(
    a => a.employeeId === employeeId && a.driverRouteId === driverRouteId && a.isActive
  );
  
  if (assignment) {
    assignment.isActive = false;
    saveAssignments(assignments);
    
    // Remove da lista de passageiros
    const routes = loadDriverRoutes();
    const routeIndex = routes.findIndex(r => r.id === driverRouteId);
    if (routeIndex !== -1) {
      routes[routeIndex].currentPassengers = routes[routeIndex].currentPassengers.filter(
        p => p !== employeeId
      );
      saveDriverRoutes(routes);
    }
  }
}

/**
 * Busca associações ativas de um colaborador
 */
export async function getEmployeeDriverRouteAssignments(
  employeeId: string
): Promise<DriverRouteAssignment[]> {
  const assignments = loadAssignments();
  return assignments.filter(a => a.employeeId === employeeId && a.isActive);
}

/**
 * Busca todos os passageiros de uma rota
 */
export async function getDriverRoutePassengers(
  driverRouteId: string
): Promise<Employee[]> {
  const assignments = loadAssignments();
  const activeAssignments = assignments.filter(
    a => a.driverRouteId === driverRouteId && a.isActive
  );
  const employees = await getAllEmployees();
  
  return activeAssignments
    .map(a => employees.find(emp => emp.id === a.employeeId))
    .filter((emp): emp is Employee => emp !== undefined);
}

// ==================== FUNÇÕES DE PONTOS DE EMBARQUE ====================

/**
 * Salva pontos de embarque no localStorage
 */
function savePickupPoints(points: PickupPoint[]): void {
  localStorage.setItem(PICKUP_POINTS_KEY, JSON.stringify(points));
}

/**
 * Carrega pontos de embarque do localStorage
 */
function loadPickupPoints(): PickupPoint[] {
  const stored = localStorage.getItem(PICKUP_POINTS_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as PickupPoint[];
  } catch {
    return [];
  }
}

/**
 * Busca todos os pontos de embarque
 */
export async function getAllPickupPoints(): Promise<PickupPoint[]> {
  return loadPickupPoints();
}

/**
 * Busca pontos de embarque ativos
 */
export async function getActivePickupPoints(): Promise<PickupPoint[]> {
  const points = loadPickupPoints();
  return points.filter(p => p.isActive);
}

/**
 * Busca pontos de embarque de uma rota específica
 */
export async function getPickupPointsByRoute(routeId: string): Promise<PickupPoint[]> {
  const points = loadPickupPoints();
  return points.filter(p => p.driverRouteIds.includes(routeId) && p.isActive);
}

/**
 * Cria um novo ponto de embarque
 */
export async function createPickupPoint(
  location: Location,
  name: string,
  description?: string,
  driverRouteIds: string[] = []
): Promise<PickupPoint> {
  const points = loadPickupPoints();
  const newPoint: PickupPoint = {
    id: `pickup_point_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    location,
    name,
    description,
    driverRouteIds,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  points.push(newPoint);
  savePickupPoints(points);
  return newPoint;
}

/**
 * Atualiza um ponto de embarque
 */
export async function updatePickupPoint(
  id: string,
  data: Partial<PickupPoint>
): Promise<PickupPoint> {
  const points = loadPickupPoints();
  const index = points.findIndex(p => p.id === id);
  
  if (index === -1) {
    throw new Error('Ponto de embarque não encontrado');
  }
  
  points[index] = {
    ...points[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  
  savePickupPoints(points);
  return points[index];
}

/**
 * Remove um ponto de embarque
 */
export async function deletePickupPoint(id: string): Promise<void> {
  const points = loadPickupPoints();
  const filtered = points.filter(p => p.id !== id);
  savePickupPoints(filtered);
}

/**
 * Adiciona uma rota a um ponto de embarque
 */
export async function addRouteToPickupPoint(
  pickupPointId: string,
  routeId: string
): Promise<void> {
  const points = loadPickupPoints();
  const point = points.find(p => p.id === pickupPointId);
  
  if (point && !point.driverRouteIds.includes(routeId)) {
    point.driverRouteIds.push(routeId);
    point.updatedAt = new Date().toISOString();
    savePickupPoints(points);
  }
}

/**
 * Remove uma rota de um ponto de embarque
 */
export async function removeRouteFromPickupPoint(
  pickupPointId: string,
  routeId: string
): Promise<void> {
  const points = loadPickupPoints();
  const point = points.find(p => p.id === pickupPointId);
  
  if (point) {
    point.driverRouteIds = point.driverRouteIds.filter(id => id !== routeId);
    point.updatedAt = new Date().toISOString();
    savePickupPoints(points);
  }
}
