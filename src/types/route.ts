export interface Location {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
}

export interface BusLine {
  number: string;
  name: string;
  type: 'urbano' | 'metropolitano';
}

export interface RouteSegment {
  busLine: BusLine;
  from: string;
  to: string;
  duration: number;
  distance: number;
}

export interface Route {
  id: string;
  segments: RouteSegment[];
  totalDuration: number;
  totalDistance: number;
  totalCost: number;
  integrations: number;
  path: [number, number][];
  badges: ('economico' | 'rapido' | 'equilibrado')[];
}

export interface RouteRequest {
  origin: Location;
  destination: Location;
}
