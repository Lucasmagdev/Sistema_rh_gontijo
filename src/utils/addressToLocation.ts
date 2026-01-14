import { Address } from '../types/employee';
import { Location } from '../types/route';

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'Belo Horizonte': { lat: -19.9167, lng: -43.9345 },
  'Contagem': { lat: -19.9319, lng: -44.0538 },
  'Betim': { lat: -19.9681, lng: -44.1983 },
  'Ribeirão das Neves': { lat: -19.7669, lng: -44.0869 },
  'Santa Luzia': { lat: -19.7697, lng: -43.8508 },
  'Ibirité': { lat: -20.0219, lng: -44.0589 },
  'Sabará': { lat: -19.8833, lng: -43.8167 },
  'Nova Lima': { lat: -19.9833, lng: -43.8500 },
};

export function addressToLocation(address: Address, employeeName: string): Location {
  const cityKey = address.city.trim();
  const defaultCoords = CITY_COORDINATES[cityKey] || { lat: -19.9167, lng: -43.9345 };
  
  const lat = address.lat ?? defaultCoords.lat;
  const lng = address.lng ?? defaultCoords.lng;
  
  const addressName = `${address.street}, ${address.number}${address.complement ? ` - ${address.complement}` : ''}`;
  
  return {
    id: `employee-${address.id}`,
    name: `${employeeName} - ${addressName}`,
    city: address.city,
    lat,
    lng,
  };
}

