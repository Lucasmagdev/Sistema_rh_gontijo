import { Route, RouteRequest } from '../types/route';
import { ROUTE_SERVICE_CONFIG } from './routeServiceConfig';
import { calculateRoutesMock } from './routeServiceMock';
import { calculateRoutesGoogle } from './routeServiceGoogle';
import { getCachedRoute, setCachedRoute } from './routeCache';

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
 * 
 * Otimizações:
 * - Cache de rotas calculadas (30 minutos)
 * - Reutilização de rotas para locais próximos
 */
export async function calculateRoutes(request: RouteRequest): Promise<Route[]> {
  // Verificar cache primeiro (apenas para API real, não para mock)
  if (!ROUTE_SERVICE_CONFIG.USE_MOCK) {
    const cached = getCachedRoute(request);
    if (cached) {
      console.log('✅ Usando rota do cache - economia de requisição à API');
      return cached;
    }
  }

  // Calcular rotas
  let routes: Route[];
  if (ROUTE_SERVICE_CONFIG.USE_MOCK) {
    routes = await calculateRoutesMock(request);
  } else {
    console.log('🌐 Fazendo requisição à API do Google Routes...');
    routes = await calculateRoutesGoogle(request);
    
    // Armazenar no cache apenas se a requisição foi bem-sucedida
    if (routes && routes.length > 0) {
      setCachedRoute(request, routes);
      console.log('💾 Rota armazenada no cache para futuras requisições');
    }
  }

  return routes;
}
