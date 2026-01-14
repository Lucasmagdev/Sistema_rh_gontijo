import { Route, RouteRequest, BusLine } from '../types/route';
import { ROUTE_SERVICE_CONFIG } from './routeServiceConfig';

/**
 * Converte a resposta da API do Google Routes para o formato interno Route
 */
function convertGoogleRouteToRoute(googleRoute: any, request: RouteRequest, index: number): Route {
  const legs = googleRoute.legs || [];
  const totalDuration = legs.reduce((sum: number, leg: any) => {
    return sum + (leg.duration?.value || 0);
  }, 0);
  
  const totalDistance = legs.reduce((sum: number, leg: any) => {
    return sum + (leg.distance?.value || 0) / 1000; // Converter metros para km
  }, 0);

  const segments = legs.map((leg: any, legIndex: number) => {
    const busLine: BusLine = {
      number: `LINHA-${index + 1}-${legIndex + 1}`,
      name: legIndex === 0 ? `${request.origin.city} - ${request.destination.city}` : 'Integração',
      type: totalDistance > 30 ? 'metropolitano' : 'urbano',
    };

    return {
      busLine,
      from: leg.startAddress || request.origin.name,
      to: leg.endAddress || request.destination.name,
      duration: Math.round((leg.duration?.value || 0) / 60), // Converter segundos para minutos
      distance: (leg.distance?.value || 0) / 1000, // Converter metros para km
    };
  });

  // Extrair o polyline da rota
  const path: [number, number][] = [];
  if (googleRoute.polyline?.encodedPolyline) {
    // Aqui você precisaria decodificar o polyline do Google
    // Por enquanto, vamos usar pontos aproximados
    const steps = legs.flatMap((leg: any) => leg.steps || []);
    steps.forEach((step: any) => {
      if (step.startLocation) {
        path.push([step.startLocation.latLng.latitude, step.startLocation.latLng.longitude]);
      }
      if (step.endLocation) {
        path.push([step.endLocation.latLng.latitude, step.endLocation.latLng.longitude]);
      }
    });
  }

  // Determinar badges baseado nas características da rota
  const badges: ('economico' | 'rapido' | 'equilibrado')[] = [];
  if (segments.length === 1) {
    badges.push('rapido');
  } else if (segments.length > 1) {
    badges.push('economico');
  } else {
    badges.push('equilibrado');
  }

  return {
    id: `google-${index}`,
    segments,
    totalDuration: Math.round(totalDuration / 60), // Converter segundos para minutos
    totalDistance,
    totalCost: 4.50, // Você pode calcular baseado na distância ou usar dados reais
    integrations: segments.length - 1,
    path: path.length > 0 ? path : [[request.origin.lat, request.origin.lng], [request.destination.lat, request.destination.lng]],
    badges,
  };
}

/**
 * Implementação usando a API do Google Routes
 * 
 * Documentação: https://developers.google.com/maps/documentation/routes
 */
export async function calculateRoutesGoogle(request: RouteRequest): Promise<Route[]> {
  if (!ROUTE_SERVICE_CONFIG.GOOGLE_API_KEY) {
    throw new Error('Google Routes API Key não configurada. Configure VITE_GOOGLE_ROUTES_API_KEY no arquivo .env');
  }

  try {
    const response = await fetch(ROUTE_SERVICE_CONFIG.GOOGLE_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': ROUTE_SERVICE_CONFIG.GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'routes.legs.duration,routes.legs.distance,routes.legs.startAddress,routes.legs.endAddress,routes.legs.steps,routes.polyline',
      },
      body: JSON.stringify({
        origin: {
          location: {
            latLng: {
              latitude: request.origin.lat,
              longitude: request.origin.lng,
            },
          },
        },
        destination: {
          location: {
            latLng: {
              latitude: request.destination.lat,
              longitude: request.destination.lng,
            },
          },
        },
        travelMode: 'TRANSIT', // Para transporte público
        routingPreference: 'TRAFFIC_AWARE',
        computeAlternativeRoutes: true,
        languageCode: 'pt-BR',
        units: 'METRIC',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Google Routes API Error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const googleRoutes = data.routes || [];

    if (googleRoutes.length === 0) {
      throw new Error('Nenhuma rota encontrada');
    }

    // Converter as rotas do Google para o formato interno
    const routes = googleRoutes.map((route: any, index: number) => 
      convertGoogleRouteToRoute(route, request, index)
    );

    return routes;
  } catch (error) {
    console.error('Erro ao calcular rotas com Google Routes API:', error);
    throw error;
  }
}

