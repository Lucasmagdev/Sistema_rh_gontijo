import { Location } from './route';
import { Employee } from './employee';

/**
 * Parada na rota do motorista
 */
export interface RouteStop {
  id: string;
  location: Location; // Localização da parada
  name: string; // Nome da parada (ex: "Parada Shopping")
  order: number; // Ordem na rota (0 = primeira parada após origem)
  isPickupPoint: boolean; // Se é um ponto de embarque fixo
  time?: string; // Horário da parada (HH:mm) - opcional
}

/**
 * Ponto de embarque fixo
 * Local onde pessoas podem pegar carona
 */
export interface PickupPoint {
  id: string;
  location: Location; // Localização do ponto
  name: string; // Nome do ponto (ex: "Ponto Shopping")
  description?: string; // Descrição opcional
  driverRouteIds: string[]; // IDs das rotas que passam por este ponto
  isActive: boolean; // Se o ponto está ativo
  createdAt: string;
  updatedAt: string;
}

/**
 * Rota de motorista (carona)
 * Representa uma rota fixa de um colaborador motorista
 */
export interface DriverRoute {
  id: string;
  driverId: string; // ID do colaborador motorista
  driver?: Employee; // Dados completos do motorista
  name: string; // Nome da rota (ex: "Rota Centro - Pampulha")
  origin: Location; // Origem da rota
  destination: Location; // Destino da rota
  stops: RouteStop[]; // Paradas na rota (waypoints)
  path: [number, number][]; // Caminho fixo da rota (coordenadas)
  color: string; // Cor da rota no mapa (hex)
  capacity: number; // Capacidade de passageiros
  currentPassengers: string[]; // IDs dos colaboradores que usam esta rota
  isActive: boolean; // Se a rota está ativa
  schedule?: {
    // Horários opcionais
    departureTime?: string; // Horário de partida (HH:mm)
    returnTime?: string; // Horário de retorno (HH:mm)
    daysOfWeek?: number[]; // Dias da semana (0-6, domingo = 0)
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Dados para criar/editar uma rota de motorista
 */
export interface DriverRouteFormData {
  driverId: string;
  name: string;
  origin: Location;
  destination: Location;
  stops?: RouteStop[]; // Paradas na rota
  path: [number, number][];
  color: string;
  capacity: number;
  schedule?: {
    departureTime?: string;
    returnTime?: string;
    daysOfWeek?: number[];
  };
}

/**
 * Associação de colaborador a uma rota de motorista
 */
export interface DriverRouteAssignment {
  id: string;
  employeeId: string;
  driverRouteId: string;
  assignedAt: string;
  isActive: boolean;
}

