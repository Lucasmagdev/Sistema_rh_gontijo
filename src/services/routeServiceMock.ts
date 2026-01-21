import { Route, RouteRequest, BusLine } from '../types/route';
import { calculateFare, type ServiceType } from './fareCalculator';
import faresData from '../data/fares.json';

const busLines: BusLine[] = [
  { number: '5001', name: 'BH - Contagem', type: 'metropolitano' },
  { number: '5002', name: 'BH - Betim', type: 'metropolitano' },
  { number: '5103', name: 'BH - Ribeirão das Neves', type: 'metropolitano' },
  { number: '5204', name: 'BH - Santa Luzia', type: 'metropolitano' },
  { number: '1201', name: 'Centro - Pampulha', type: 'urbano' },
  { number: '1301', name: 'Centro - Barreiro', type: 'urbano' },
  { number: '9401', name: 'Centro - Savassi', type: 'urbano' },
];

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function generatePath(lat1: number, lng1: number, lat2: number, lng2: number, segments: number = 5): [number, number][] {
  const path: [number, number][] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const lat = lat1 + (lat2 - lat1) * t + (Math.random() - 0.5) * 0.01;
    const lng = lng1 + (lng2 - lng1) * t + (Math.random() - 0.5) * 0.01;
    path.push([lat, lng]);
  }
  return path;
}

export async function calculateRoutesMock(request: RouteRequest): Promise<Route[]> {
  await new Promise(resolve => setTimeout(resolve, 800));

  const distance = calculateDistance(
    request.origin.lat,
    request.origin.lng,
    request.destination.lat,
    request.destination.lng
  );

  const routes: Route[] = [];

  const route1Services: ServiceType[] = ['troncais_convencionais'];
  const route1: Route = {
    id: '1',
    segments: [
      {
        busLine: busLines[0],
        from: request.origin.name,
        to: request.destination.name,
        duration: Math.round(distance * 2.5),
        distance: distance,
      },
    ],
    totalDuration: Math.round(distance * 2.5),
    totalDistance: distance,
    totalCost: busLines[0].type === 'metropolitano'
      ? (faresData.fares?.metropolitan?.base ?? 5.75)
      : calculateFare(route1Services).totalFare,
    integrations: 0,
    path: generatePath(request.origin.lat, request.origin.lng, request.destination.lat, request.destination.lng),
    badges: ['rapido'],
  };

  const route2Services: ServiceType[] = ['troncais_convencionais', 'troncais_convencionais'];
  const route2: Route = {
    id: '2',
    segments: [
      {
        busLine: busLines[1],
        from: request.origin.name,
        to: 'Estação Central',
        duration: Math.round(distance * 1.5),
        distance: distance * 0.6,
      },
      {
        busLine: busLines[2],
        from: 'Estação Central',
        to: request.destination.name,
        duration: Math.round(distance * 2),
        distance: distance * 0.4,
      },
    ],
    totalDuration: Math.round(distance * 3.5),
    totalDistance: distance,
    totalCost: (busLines[1].type === 'metropolitano' || busLines[2].type === 'metropolitano')
      ? (faresData.fares?.metropolitan?.base ?? 5.75)
      : calculateFare(route2Services).totalFare,
    integrations: 1,
    path: [
      ...generatePath(request.origin.lat, request.origin.lng, -19.917, -43.935, 3),
      ...generatePath(-19.917, -43.935, request.destination.lat, request.destination.lng, 3),
    ],
    badges: ['economico'],
  };

  const route3Services: ServiceType[] = ['troncais_convencionais'];
  const route3: Route = {
    id: '3',
    segments: [
      {
        busLine: busLines[3],
        from: request.origin.name,
        to: request.destination.name,
        duration: Math.round(distance * 3),
        distance: distance * 1.1,
      },
    ],
    totalDuration: Math.round(distance * 3),
    totalDistance: distance * 1.1,
    totalCost: busLines[3].type === 'metropolitano'
      ? (faresData.fares?.metropolitan?.base ?? 5.75)
      : calculateFare(route3Services).totalFare,
    integrations: 0,
    path: generatePath(request.origin.lat, request.origin.lng, request.destination.lat, request.destination.lng, 8),
    badges: ['equilibrado'],
  };

  routes.push(route1, route2, route3);

  routes.sort((a, b) => {
    if (a.badges.includes('economico')) return -1;
    if (b.badges.includes('economico')) return 1;
    if (a.badges.includes('rapido')) return -1;
    if (b.badges.includes('rapido')) return 1;
    return 0;
  });

  return routes;
}

