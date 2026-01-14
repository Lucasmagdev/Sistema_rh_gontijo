import { Route, RouteRequest } from '../types/route';
import { ROUTE_SERVICE_CONFIG } from './routeServiceConfig';
import { calculateRoutesMock } from './routeServiceMock';
import { calculateRoutesGoogle } from './routeServiceGoogle';

/**
 * Serviço principal de cálculo de rotas
 * 
 * Esta função decide automaticamente qual implementação usar
 * baseado na configuração em routeServiceConfig.ts
 * 
 * Para usar a API do Google Routes:
 * 1. Configure USE_MOCK = false em routeServiceConfig.ts
 * 2. Adicione VITE_GOOGLE_ROUTES_API_KEY no arquivo .env
 * 3. Obtenha sua API Key em: https://console.cloud.google.com/
 */
export async function calculateRoutes(request: RouteRequest): Promise<Route[]> {
  if (ROUTE_SERVICE_CONFIG.USE_MOCK) {
    return calculateRoutesMock(request);
  } else {
    return calculateRoutesGoogle(request);
  }
}
