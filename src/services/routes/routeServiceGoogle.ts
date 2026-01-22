import { Route, RouteRequest, BusLine } from '../types/route';
import { calculateFare, getUnitaryFare, type ServiceType, type IntegrationLocation } from './fareCalculator';
import faresData from '../../data/fares.json';
import { ROUTE_SERVICE_CONFIG } from './routeServiceConfig';
import { findBusLines } from './gtfsService';

/**
 * Calcula horário de chegada baseado no horário de partida e duração
 */
function calculateArrivalTime(departureTime: string, durationMinutes: number): string {
  try {
    // Tentar parsear diferentes formatos de horário
    let hours: number, minutes: number;
    
    if (departureTime.includes('T') || departureTime.includes('Z')) {
      // Formato ISO
      const date = new Date(departureTime);
      hours = date.getHours();
      minutes = date.getMinutes();
    } else if (departureTime.includes(':')) {
      // Formato HH:mm
      [hours, minutes] = departureTime.split(':').map(Number);
    } else {
      return '';
    }
    
    const departure = new Date();
    departure.setHours(hours, minutes, 0, 0);
    const arrival = new Date(departure.getTime() + durationMinutes * 60000);
    return arrival.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

/**
 * Decodifica um encoded polyline do Google em uma lista de coordenadas [lat, lng]
 * Implementação baseada no algoritmo oficial da Google Polyline Utility.
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

    // Decodificar latitude
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20 && index < len);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    // Decodificar longitude
    result = 0;
    shift = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20 && index < len);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    coordinates.push([lat / 1e5, lng / 1e5]);
  }

  return coordinates;
}

/**
 * Converte a resposta da API do Google Routes para o formato interno Route
 */
async function convertGoogleRouteToRoute(googleRoute: any, request: RouteRequest, index: number): Promise<Route> {
  const legs = googleRoute.legs || [];
  
  // A API v2 pode retornar duration como objeto com seconds ou como string
  const getDurationSeconds = (duration: any): number => {
    if (typeof duration === 'string') {
      // Formato "3600s" - extrair número
      const match = duration.match(/(\d+)s?/);
      return match ? parseInt(match[1], 10) : 0;
    }
    if (typeof duration === 'number') return duration;
    if (duration?.seconds) return parseInt(duration.seconds, 10);
    if (duration?.value) return parseInt(duration.value, 10);
    return 0;
  };

  // A API v2 retorna distanceMeters como número direto
  const getDistanceMeters = (distance: any): number => {
    if (typeof distance === 'number') return distance;
    if (distance?.distanceMeters) return distance.distanceMeters;
    if (distance?.value) return distance.value;
    return 0;
  };

  // Tentar usar duração e distância totais da rota primeiro
  const routeDuration = getDurationSeconds(googleRoute.duration);
  const routeDistance = getDistanceMeters(googleRoute.distanceMeters || googleRoute.distance);
  
  // Se não estiver disponível na rota, calcular dos legs
  const totalDuration = routeDuration > 0 
    ? routeDuration 
    : legs.reduce((sum: number, leg: any) => {
        return sum + getDurationSeconds(leg.duration);
      }, 0);
  
  const totalDistance = routeDistance > 0
    ? routeDistance / 1000 // Converter metros para km
    : legs.reduce((sum: number, leg: any) => {
        return sum + getDistanceMeters(leg.distanceMeters || leg.distance) / 1000; // Converter metros para km
      }, 0);

  // Extrair TODOS os segmentos de transporte público dos steps do Google
  // O Google pode ter múltiplos steps de transit em um único leg
  const segments: RouteSegment[] = [];
  
  legs.forEach((leg: any, legIndex: number) => {
    if (!leg.steps || !Array.isArray(leg.steps)) {
      return;
    }

    // Extrair TODOS os steps de transporte público deste leg
    leg.steps.forEach((step: any) => {
      if (!step.transitDetails) {
        return; // Pular steps que não são transporte público (ex: caminhada)
      }

      const transitDetails = step.transitDetails;
      
      if (!transitDetails.transitLine) {
        return;
      }
    
      // ✅ Usar informações reais do Google Transit
      const transitLine = transitDetails.transitLine;
      
      // Extrair número e nome da linha
      const lineNumber = transitLine.shortName || 
                        transitLine.name?.text || 
                        transitLine.name || 
                        '';
      const lineName = transitLine.name?.text || 
                      transitLine.name || 
                      transitLine.shortName || 
                      'Linha de Ônibus';
      
      // Detectar tipo de linha: metropolitano ou urbano
      let lineType: 'urbano' | 'metropolitano' = 'urbano';
      
      if (transitLine.vehicle?.type === 'SUBWAY' || transitLine.vehicle?.type === 'TRAIN') {
        lineType = 'metropolitano';
      } else if (transitLine.vehicle?.type === 'BUS') {
        // Se é ônibus, verificar se é rota entre cidades ou longa distância
        const isInterCity = request.origin.city !== request.destination.city;
        lineType = (isInterCity || totalDistance > 30) ? 'metropolitano' : 'urbano';
      } else {
        // Fallback: usar distância ou cidades diferentes
        lineType = (request.origin.city !== request.destination.city || totalDistance > 30) 
          ? 'metropolitano' 
          : 'urbano';
      }
      
      const busLine: BusLine = {
        number: lineNumber || `LINHA-${segments.length + 1}`,
        name: lineName,
        type: lineType,
      };
      
      // Extrair nomes das paradas de partida e chegada
      const fromName = transitDetails.stopDetails?.departureStop?.name || 
                      step.startLocation?.address ||
                      leg.startLocation?.address || 
                      request.origin.name;
      
      const toName = transitDetails.stopDetails?.arrivalStop?.name ||
                    step.endLocation?.address ||
                    leg.endLocation?.address || 
                    request.destination.name;
      
      // Duração e distância do step
      const stepDuration = getDurationSeconds(step.duration);
      const stepDistance = getDistanceMeters(step.distanceMeters || step.distance);
      
      // Extrair coordenadas de origem e destino do step
      const fromLocation = step.startLocation?.latLng || 
                          step.startLocation || 
                          transitDetails.stopDetails?.departureStop?.location ||
                          { latitude: request.origin.lat, longitude: request.origin.lng };
      
      const toLocation = step.endLocation?.latLng || 
                        step.endLocation || 
                        transitDetails.stopDetails?.arrivalStop?.location ||
                        { latitude: request.destination.lat, longitude: request.destination.lng };
      
      // Extrair path do step se disponível
      let segmentPath: [number, number][] | undefined = undefined;
      if (step.polyline?.encodedPolyline) {
        try {
          segmentPath = decodePolyline(step.polyline.encodedPolyline);
        } catch (e) {
          console.warn('Erro ao decodificar polyline do segmento:', e);
        }
      }
      
      // Se não tem polyline, criar path simples com origem e destino
      if (!segmentPath || segmentPath.length === 0) {
        segmentPath = [
          [fromLocation.latitude || fromLocation.lat, fromLocation.longitude || fromLocation.lng],
          [toLocation.latitude || toLocation.lat, toLocation.longitude || toLocation.lng],
        ];
      }
      
      // Extrair horários de partida e chegada
      let departureTime: string | undefined = undefined;
      let arrivalTime: string | undefined = undefined;
      
      if (transitDetails.stopDetails) {
        // Tentar extrair horários das paradas
        if (transitDetails.stopDetails.departureStop?.departureTime) {
          departureTime = transitDetails.stopDetails.departureStop.departureTime;
        }
        if (transitDetails.stopDetails.arrivalStop?.arrivalTime) {
          arrivalTime = transitDetails.stopDetails.arrivalStop.arrivalTime;
        }
      }

      // Calcular horário de caminhada antes (se houver step de caminhada anterior)
      let walkingTimeBefore: number | undefined = undefined;
      // Nota: O Google pode ter steps de caminhada separados, mas por enquanto vamos assumir 0
      
      segments.push({
        busLine,
        from: fromName,
        to: toName,
        duration: Math.round(stepDuration / 60), // Converter segundos para minutos
        distance: stepDistance / 1000, // Converter metros para km
        path: segmentPath,
        fromLocation: {
          lat: fromLocation.latitude || fromLocation.lat,
          lng: fromLocation.longitude || fromLocation.lng,
        },
        toLocation: {
          lat: toLocation.latitude || toLocation.lat,
          lng: toLocation.longitude || toLocation.lng,
        },
        departureTime,
        arrivalTime,
        walkingTimeBefore,
      });
      
      console.log(`✅ Segmento ${segments.length}: ${busLine.number} - ${busLine.name}`, {
        from: fromName,
        to: toName,
        duration: Math.round(stepDuration / 60) + ' min',
        distance: (stepDistance / 1000).toFixed(2) + ' km',
      });
    });
  });

  // Se não encontrou nenhum segmento de transporte público, criar um fallback
  if (segments.length === 0) {
    console.warn('⚠️ Nenhum segmento de transporte público encontrado, usando fallback');
    
    legs.forEach((leg: any, legIndex: number) => {
      const isInterCity = request.origin.city !== request.destination.city;
      const lineType: 'urbano' | 'metropolitano' = (isInterCity || totalDistance > 30) ? 'metropolitano' : 'urbano';
      
      const legStartLocation = leg.startLocation?.latLng || leg.startLocation || { latitude: request.origin.lat, longitude: request.origin.lng };
      const legEndLocation = leg.endLocation?.latLng || leg.endLocation || { latitude: request.destination.lat, longitude: request.destination.lng };
      
      segments.push({
        busLine: {
          number: `LINHA-${legIndex + 1}`,
          name: legIndex === 0 
            ? `${request.origin.city} - ${request.destination.city}` 
            : isInterCity 
              ? `Integração Metropolitana` 
              : 'Integração',
          type: lineType,
        },
        from: leg.startLocation?.address || request.origin.name,
        to: leg.endLocation?.address || request.destination.name,
        duration: Math.round(getDurationSeconds(leg.duration) / 60),
        distance: getDistanceMeters(leg.distanceMeters || leg.distance) / 1000,
        path: [[
          legStartLocation.latitude || legStartLocation.lat || request.origin.lat,
          legStartLocation.longitude || legStartLocation.lng || request.origin.lng,
        ], [
          legEndLocation.latitude || legEndLocation.lat || request.destination.lat,
          legEndLocation.longitude || legEndLocation.lng || request.destination.lng,
        ]],
        fromLocation: {
          lat: legStartLocation.latitude || legStartLocation.lat || request.origin.lat,
          lng: legStartLocation.longitude || legStartLocation.lng || request.origin.lng,
        },
        toLocation: {
          lat: legEndLocation.latitude || legEndLocation.lat || request.destination.lat,
          lng: legEndLocation.longitude || legEndLocation.lng || request.destination.lng,
        },
      });
    });
  }

  // Detectar se é rota entre cidades diferentes (metropolitana)
  const isInterCityRoute = request.origin.city !== request.destination.city;
  const isMetropolitanDistance = totalDistance > 30;
  
  // Calcular custo (BH) usando matriz de integração
  // Detectar se precisa de integração (2+ ônibus)
  const needsIntegration = segments.length > 1;
  const hasMetropolitan = segments.some((s) => s.busLine.type === 'metropolitano') || 
                          isInterCityRoute || 
                          isMetropolitanDistance;
  
  // Log para debug de rotas metropolitanas
  if (isInterCityRoute || isMetropolitanDistance) {
    console.log(`🌆 Rota Metropolitana detectada:`, {
      origin: request.origin.city,
      destination: request.destination.city,
      distance: totalDistance.toFixed(2) + ' km',
      isInterCity: isInterCityRoute,
      isLongDistance: isMetropolitanDistance,
      segments: segments.length,
    });
  }
  
  let totalCost = faresData.fares?.metropolitan?.base ?? 5.75;

  // Calcular custo SOMANDO cada segmento usando a lógica do Google Maps
  // Identificar tipo de serviço de cada segmento
  const services: ServiceType[] = segments.map((seg) => {
    // Se é metropolitano, usar tarifa metropolitana
    if (seg.busLine.type === 'metropolitano') {
      return 'metro'; // Usar metro como base para metropolitano
    }
    
    // Tentar identificar o tipo de serviço baseado no número da linha
    const lineNum = seg.busLine.number;
    if (lineNum.match(/^(10|[1-9][0-9]|30[0-9]|32[0-9]|33[0-9]|34[0-9]|50[0-9]|51[0-9]|52[0-9]|60[0-9]|61[0-9]|62[0-9]|63[0-9]|64[0-9]|70[0-9]|71[0-9]|72[0-9]|73[0-9]|74[0-9]|80[0-9]|81[0-9]|82[0-9]|83[0-9]|84[0-9]|85[0-9])$/)) {
      return 'troncais_convencionais';
    } else if (lineNum.match(/^[1-9][0-9]{3}$/)) {
      return 'estruturais';
    } else if (lineNum.toLowerCase().includes('circular')) {
      return 'circular';
    } else {
      return 'troncais_convencionais'; // Padrão
    }
  });

  // Calcular custo total usando matriz de integração
  if (segments.length === 1) {
    // Viagem única sem integração
    const serviceType = services[0];
    if (segments[0].busLine.type === 'metropolitano') {
      totalCost = faresData.fares?.metropolitan?.base ?? 5.75;
    } else {
      totalCost = getUnitaryFare(serviceType);
    }
    console.log(`💰 Custo único (${serviceType}): R$ ${totalCost.toFixed(2)}`);
  } else {
    // Viagem com integrações: usar matriz de tarifas
    // Assumir integração fora da estação (pior caso)
    const integrationLocations: IntegrationLocation[] = new Array(segments.length - 1).fill('outside_station');
    const fareResult = calculateFare(services, integrationLocations);
    totalCost = fareResult.totalFare;
    
    console.log(`💰 Custo total com ${segments.length - 1} integração(ões): R$ ${totalCost.toFixed(2)}`, {
      services,
      breakdown: fareResult.breakdown,
      totalFare: fareResult.totalFare,
    });
  }

  // Extrair o polyline da rota
  const path: [number, number][] = [];

  // 1. Tentar decodificar o encodedPolyline completo da rota
  if (googleRoute.polyline?.encodedPolyline) {
    try {
      const decoded = decodePolyline(googleRoute.polyline.encodedPolyline);
      if (decoded.length > 0) {
        path.push(...decoded);
      }
    } catch (e) {
      console.error('Erro ao decodificar polyline do Google Routes:', e);
    }
  }

  // 2. Se por algum motivo o polyline não trouxe pontos, tentar montar pelos steps
  if (path.length === 0 && legs.length > 0) {
    const steps = legs.flatMap((leg: any) => leg.steps || []);
    steps.forEach((step: any) => {
      // API v2 pode ter startLocation/endLocation com latLng ou direto
      if (step.startLocation) {
        const latLng = step.startLocation.latLng || step.startLocation;
        if (latLng?.latitude && latLng?.longitude) {
          path.push([latLng.latitude, latLng.longitude]);
        }
      }
      if (step.endLocation) {
        const latLng = step.endLocation.latLng || step.endLocation;
        if (latLng?.latitude && latLng?.longitude) {
          path.push([latLng.latitude, latLng.longitude]);
        }
      }
    });
  }

  // 3. Fallback final: se ainda não há pontos, usar apenas origem e destino
  if (path.length === 0) {
    path.push([request.origin.lat, request.origin.lng]);
    path.push([request.destination.lat, request.destination.lng]);
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

  // Calcular número de integrações (troca de ônibus)
  // Integração = quando há mais de 1 segmento de transporte público
  const integrations = Math.max(0, segments.length - 1);
  
  // Log para debug
  if (integrations > 0) {
    console.log(`🚌 Rota requer ${integrations} integração(ões):`, {
      totalSegments: segments.length,
      segments: segments.map(s => `${s.busLine.number} (${s.from} → ${s.to})`),
    });
  }

  // Calcular horários totais
  const routeDepartureTime = segments[0]?.departureTime;
  const routeArrivalTime = segments[segments.length - 1]?.arrivalTime || 
    (routeDepartureTime ? calculateArrivalTime(routeDepartureTime, Math.round(totalDuration / 60)) : undefined);

  return {
    id: `google-${index}`,
    segments,
    totalDuration: Math.round(totalDuration / 60), // Converter segundos para minutos
    totalDistance,
    totalCost,
    integrations,
    path,
    badges,
    departureTime: routeDepartureTime,
    arrivalTime: routeArrivalTime,
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

  // Rate limiting
  const { canMakeRequest, recordRequest } = await import('../shared/rateLimiter');
  if (!canMakeRequest()) {
    throw new Error('Muitas requisições. Aguarde alguns segundos antes de tentar novamente.');
  }

  try {
    recordRequest();
    const response = await fetch(ROUTE_SERVICE_CONFIG.GOOGLE_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': ROUTE_SERVICE_CONFIG.GOOGLE_API_KEY,
        // FieldMask simplificado - apenas campos essenciais e válidos
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline,routes.legs',
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
        computeAlternativeRoutes: false, // Desabilitar rotas alternativas para evitar erros
        languageCode: 'pt-BR',
        units: 'METRIC',
        // Formato correto para departureTime: deve ser um timestamp RFC3339
        departureTime: new Date().toISOString(), // Necessário para TRANSIT
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = response.statusText;
      let errorDetails: any = null;
      try {
        errorDetails = JSON.parse(errorText);
        errorMessage = errorDetails.error?.message || errorDetails.message || errorMessage;
        
        // Log detalhado do erro
        console.error('❌ Google Routes API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorDetails,
          errorDetailsFull: JSON.stringify(errorDetails, null, 2),
          requestBody: {
            origin: { lat: request.origin.lat, lng: request.origin.lng },
            destination: { lat: request.destination.lat, lng: request.destination.lng },
            travelMode: 'TRANSIT',
            departureTime: new Date().toISOString(),
          },
        });
        
        // Se houver detalhes específicos do erro, mostrar
        if (errorDetails.error?.details) {
          console.error('Detalhes do erro:', errorDetails.error.details);
        }
      } catch (e) {
        console.error('❌ Google Routes API Error (não JSON):', errorText);
      }
      throw new Error(`Google Routes API Error: ${errorMessage}`);
    }

    const data = await response.json();
    const googleRoutes = data.routes || [];

    if (googleRoutes.length === 0) {
      throw new Error('Nenhuma rota encontrada');
    }

    // Converter as rotas do Google para o formato interno (agora é async)
    const routes = await Promise.all(
      googleRoutes.map((route: any, index: number) => 
        convertGoogleRouteToRoute(route, request, index)
      )
    );

    return routes;
  } catch (error) {
    console.error('Erro ao calcular rotas com Google Routes API:', error);
    throw error;
  }
}

