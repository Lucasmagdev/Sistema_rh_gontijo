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
  path?: [number, number][]; // Path específico deste segmento
  fromLocation?: { lat: number; lng: number }; // Coordenadas da origem do segmento
  toLocation?: { lat: number; lng: number }; // Coordenadas do destino do segmento (baldeação)
  departureTime?: string; // Horário de partida (formato HH:mm)
  arrivalTime?: string; // Horário de chegada (formato HH:mm)
  walkingTimeBefore?: number; // Tempo de caminhada antes deste segmento (minutos)
  walkingTimeAfter?: number; // Tempo de caminhada depois deste segmento (minutos)
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
  departureTime?: string; // Horário de partida total (formato HH:mm)
  arrivalTime?: string; // Horário de chegada total (formato HH:mm)
}

export interface RouteRequest {
  origin: Location;
  destination: Location;
}
