import { useCallback, useMemo, useEffect, useState } from 'react';
import { GoogleMap, MarkerF, PolylineF, useJsApiLoader, InfoWindowF } from '@react-google-maps/api';
import { motion } from 'framer-motion';
import { DriverRoute, PickupPoint } from '../../types/driverRoute';
import { Employee } from '../../types/employee';
import { Car, Users, MapPin } from 'lucide-react';

interface DriverRouteMapProps {
  driverRoutes: DriverRoute[];
  pickupPoints?: PickupPoint[];
  onRouteClick?: (route: DriverRoute) => void;
  selectedRouteId?: string;
}

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '100%',
};

const DEFAULT_CENTER = {
  lat: -19.9167,
  lng: -43.9345,
};

const DEFAULT_ZOOM = 12;

export function DriverRouteMap({ driverRoutes, pickupPoints = [], onRouteClick, selectedRouteId }: DriverRouteMapProps) {
  const [selectedRoute, setSelectedRoute] = useState<DriverRoute | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  
  const apiKey =
    (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) ||
    (import.meta.env.VITE_GOOGLE_ROUTES_API_KEY as string | undefined) ||
    '';

  const { isLoaded } = useJsApiLoader({
    id: 'google-maps-script', // Mesmo ID usado no MapView
    googleMapsApiKey: apiKey,
  });

  // Calcula bounds para ajustar o mapa
  const bounds = useMemo(() => {
    if (driverRoutes.length === 0 && pickupPoints.length === 0) return null;
    
    const allPoints: { lat: number; lng: number }[] = [];
    driverRoutes.forEach(route => {
      if (route.path && route.path.length > 0) {
        route.path.forEach(([lat, lng]) => {
          allPoints.push({ lat, lng });
        });
      }
      if (route.origin) {
        allPoints.push({ lat: route.origin.lat, lng: route.origin.lng });
      }
      if (route.destination) {
        allPoints.push({ lat: route.destination.lat, lng: route.destination.lng });
      }
      // Adicionar paradas
      if (route.stops) {
        route.stops.forEach(stop => {
          allPoints.push({ lat: stop.location.lat, lng: stop.location.lng });
        });
      }
    });
    
    // Adicionar pontos de embarque
    pickupPoints.filter(p => p.isActive).forEach(point => {
      allPoints.push({ lat: point.location.lat, lng: point.location.lng });
    });

    if (allPoints.length === 0) return null;

    const lats = allPoints.map(p => p.lat);
    const lngs = allPoints.map(p => p.lng);
    
    return new google.maps.LatLngBounds(
      new google.maps.LatLng(Math.min(...lats), Math.min(...lngs)),
      new google.maps.LatLng(Math.max(...lats), Math.max(...lngs))
    );
  }, [driverRoutes]);

  // Ajusta o mapa quando bounds mudam
  useEffect(() => {
    if (map && bounds) {
      map.fitBounds(bounds);
    }
  }, [map, bounds]);

  const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const handleRouteClick = useCallback((route: DriverRoute) => {
    setSelectedRoute(route);
    if (onRouteClick) {
      onRouteClick(route);
    }
  }, [onRouteClick]);

  if (!isLoaded) {
    if (!apiKey) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <div className="text-center p-6">
            <p className="text-gray-600 mb-2">Google Maps API Key não configurada</p>
            <p className="text-sm text-gray-500">
              Configure <code className="font-mono bg-gray-200 px-2 py-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code> no arquivo .env
            </p>
            <p className="text-xs text-gray-400 mt-4">
              O mapa será exibido quando a chave for configurada
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#C4161C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        onLoad={onMapLoad}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        {/* Renderiza todas as rotas */}
        {driverRoutes.map((route) => {
          if (!route.path || route.path.length === 0) return null;

          const isSelected = route.id === selectedRouteId;
          const routeColor = route.color || '#3B82F6';
          
          return (
            <div key={route.id}>
              {/* Linha da rota */}
              <PolylineF
                path={route.path.map(([lat, lng]) => ({ lat, lng }))}
                options={{
                  strokeColor: routeColor,
                  strokeOpacity: isSelected ? 1 : 0.6,
                  strokeWeight: isSelected ? 6 : 4,
                  zIndex: isSelected ? 1000 : 1,
                }}
                onClick={() => handleRouteClick(route)}
              />

              {/* Marcador de origem */}
              {route.origin && (
                <MarkerF
                  position={{ lat: route.origin.lat, lng: route.origin.lng }}
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: routeColor,
                    fillOpacity: 1,
                    strokeColor: '#FFFFFF',
                    strokeWeight: 2,
                  }}
                  onClick={() => handleRouteClick(route)}
                  title={`Origem: ${route.origin.name}`}
                />
              )}

              {/* Marcador de destino */}
              {route.destination && (
                <MarkerF
                  position={{ lat: route.destination.lat, lng: route.destination.lng }}
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: routeColor,
                    fillOpacity: 1,
                    strokeColor: '#FFFFFF',
                    strokeWeight: 2,
                  }}
                  onClick={() => handleRouteClick(route)}
                  title={`Destino: ${route.destination.name}`}
                />
              )}

              {/* Marcadores de paradas */}
              {route.stops && route.stops.length > 0 && route.stops.map((stop, index) => (
                <MarkerF
                  key={`stop-${route.id}-${stop.id}`}
                  position={{ lat: stop.location.lat, lng: stop.location.lng }}
                  icon={{
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="16" cy="16" r="14" fill="#F59E0B" stroke="#FFFFFF" stroke-width="2"/>
                        <text x="16" y="22" font-size="18" fill="white" text-anchor="middle">👤</text>
                      </svg>
                    `),
                    scaledSize: new google.maps.Size(32, 32),
                    anchor: new google.maps.Point(16, 16),
                  }}
                  onClick={() => handleRouteClick(route)}
                  title={`Parada ${index + 1}: ${stop.name || stop.location.name}${stop.time ? ` - ${stop.time}` : ''}`}
                />
              ))}

              {/* Marcador do motorista (meio da rota) */}
              {route.path.length > 0 && (
                <MarkerF
                  position={{
                    lat: route.path[Math.floor(route.path.length / 2)][0],
                    lng: route.path[Math.floor(route.path.length / 2)][1],
                  }}
                  icon={{
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="16" cy="16" r="14" fill="${routeColor}" stroke="#FFFFFF" stroke-width="2"/>
                        <text x="16" y="20" font-size="16" fill="white" text-anchor="middle">🚗</text>
                      </svg>
                    `),
                    scaledSize: new google.maps.Size(32, 32),
                  }}
                  onClick={() => handleRouteClick(route)}
                  title={`Motorista: ${route.driver?.name || 'N/A'}`}
                />
              )}

              {/* InfoWindow para rota selecionada */}
              {isSelected && selectedRoute?.id === route.id && route.origin && route.destination && (
                <InfoWindowF
                  position={{
                    lat: route.path[Math.floor(route.path.length / 2)][0],
                    lng: route.path[Math.floor(route.path.length / 2)][1],
                  }}
                  onCloseClick={() => setSelectedRoute(null)}
                >
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-bold text-sm mb-1">{route.name}</h3>
                    <p className="text-xs text-gray-600 mb-2">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {route.origin.name} → {route.destination.name}
                    </p>
                    {route.stops && route.stops.length > 0 && (
                      <div className="mb-2 border-t pt-2">
                        <p className="text-xs font-semibold text-gray-700 mb-1">Paradas:</p>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {route.stops
                            .sort((a, b) => a.order - b.order)
                            .map((stop, idx) => (
                              <div key={stop.id} className="flex items-start gap-1">
                                <span className="text-xs text-gray-600">•</span>
                                <div className="flex-1">
                                  <p className="text-xs text-gray-700 font-medium">
                                    {stop.name || stop.location.name}
                                  </p>
                                  {stop.time && (
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      🕐 {stop.time}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs">
                      <Car className="w-3 h-3" />
                      <span>{route.driver?.name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs mt-1">
                      <Users className="w-3 h-3" />
                      <span>
                        {route.currentPassengers.length}/{route.capacity} passageiros
                      </span>
                    </div>
                  </div>
                </InfoWindowF>
              )}
            </div>
          );
        })}

        {/* Renderiza pontos de embarque */}
        {pickupPoints.filter(p => p.isActive).map((point) => (
          <MarkerF
            key={`pickup-${point.id}`}
            position={{ lat: point.location.lat, lng: point.location.lng }}
            icon={{
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="20" r="18" fill="#10B981" stroke="#FFFFFF" stroke-width="3"/>
                  <circle cx="20" cy="20" r="8" fill="#FFFFFF"/>
                  <text x="20" y="26" font-size="20" fill="#10B981" text-anchor="middle" font-weight="bold">P</text>
                </svg>
              `),
              scaledSize: new google.maps.Size(40, 40),
              anchor: new google.maps.Point(20, 20),
            }}
            title={`Ponto de Embarque: ${point.name}`}
          />
        ))}
      </GoogleMap>
    </div>
  );
}

