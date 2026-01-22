import { useCallback, useMemo } from 'react';
import { GoogleMap, MarkerF, PolylineF, useJsApiLoader } from '@react-google-maps/api';
import { motion } from 'framer-motion';
import { Route, Location } from '../../types/route';

interface MapViewProps {
  origin?: Location;
  destination?: Location;
  selectedRoute?: Route;
}

export function MapView({ origin, destination, selectedRoute }: MapViewProps) {
  const fallbackCenter = useMemo(() => ({ lat: -19.9167, lng: -43.9345 }), []);
  const center = useMemo(() => {
    if (origin) return { lat: origin.lat, lng: origin.lng };
    if (destination) return { lat: destination.lat, lng: destination.lng };
    return fallbackCenter;
  }, [origin, destination, fallbackCenter]);

  const apiKey =
    (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) ||
    (import.meta.env.VITE_GOOGLE_ROUTES_API_KEY as string | undefined) ||
    '';

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-maps-script',
    googleMapsApiKey: apiKey,
  });

  const mapOptions = useMemo<google.maps.MapOptions>(
    () => ({
      disableDefaultUI: false,
      clickableIcons: false,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      zoomControl: true,
    }),
    []
  );

  // Cores diferentes para cada segmento
  const segmentColors = [
    '#C4161C', // Vermelho (BHTrans)
    '#2563EB', // Azul
    '#10B981', // Verde
    '#F59E0B', // Amarelo/Laranja
    '#8B5CF6', // Roxo
    '#EC4899', // Rosa
    '#06B6D4', // Ciano
    '#F97316', // Laranja
  ];

  // Preparar paths e baldeações dos segmentos
  const segmentPaths = useMemo(() => {
    if (!selectedRoute?.segments) return [];
    
    return selectedRoute.segments.map((segment, index) => {
      // Usar path do segmento se disponível, senão criar path simples
      let path: { lat: number; lng: number }[] = [];
      
      if (segment.path && segment.path.length > 0) {
        path = segment.path.map(([lat, lng]) => ({ lat, lng }));
      } else if (segment.fromLocation && segment.toLocation) {
        // Path simples entre origem e destino do segmento
        path = [
          { lat: segment.fromLocation.lat, lng: segment.fromLocation.lng },
          { lat: segment.toLocation.lat, lng: segment.toLocation.lng },
        ];
      }
      
      return {
        path,
        color: segmentColors[index % segmentColors.length],
        segmentIndex: index + 1,
        busLineNumber: segment.busLine.number,
        toLocation: segment.toLocation,
      };
    });
  }, [selectedRoute, segmentColors]);

  // Pontos de baldeação (onde termina um segmento e começa outro)
  const transferPoints = useMemo(() => {
    if (!selectedRoute?.segments || selectedRoute.segments.length < 2) return [];
    
    return selectedRoute.segments
      .slice(0, -1) // Todos exceto o último
      .map((segment, index) => ({
        location: segment.toLocation,
        fromLine: segment.busLine.number,
        toLine: selectedRoute.segments[index + 1].busLine.number,
        segmentIndex: index + 1,
      }))
      .filter(point => point.location); // Filtrar apenas pontos com coordenadas
  }, [selectedRoute]);

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      if (origin && destination) {
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(new google.maps.LatLng(origin.lat, origin.lng));
        bounds.extend(new google.maps.LatLng(destination.lat, destination.lng));
        map.fitBounds(bounds, 50);
      } else {
        map.setCenter(center);
        map.setZoom(12);
      }
    },
    [origin, destination, center]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white/50"
    >
      {!apiKey ? (
        <div className="h-full w-full flex items-center justify-center bg-white/60">
          <div className="text-center max-w-md px-6">
            <p className="font-semibold text-gray-900">Google Maps não configurado</p>
            <p className="text-sm text-gray-700 mt-2">
              Configure <code className="font-mono">VITE_GOOGLE_MAPS_API_KEY</code> no arquivo{' '}
              <code className="font-mono">.env</code>.
            </p>
          </div>
        </div>
      ) : loadError ? (
        <div className="h-full w-full flex items-center justify-center bg-white/60">
          <div className="text-center max-w-md px-6">
            <p className="font-semibold text-gray-900">Erro ao carregar o Google Maps</p>
            <p className="text-sm text-gray-700 mt-2">
              Verifique se a API Key é válida e se a <strong>Maps JavaScript API</strong> está
              ativada.
            </p>
          </div>
        </div>
      ) : !isLoaded ? (
        <div className="h-full w-full flex items-center justify-center bg-white/60">
          <p className="text-sm text-gray-700">Carregando mapa…</p>
        </div>
      ) : (
        <GoogleMap
          mapContainerStyle={{ height: '100%', width: '100%' }}
          center={center}
          zoom={12}
          options={mapOptions}
          onLoad={onLoad}
        >
          {/* Legenda de cores dos segmentos */}
          {segmentPaths.length > 1 && (
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 z-10 border border-gray-200">
              <p className="text-xs font-semibold text-gray-700 mb-2">Segmentos da Rota</p>
              <div className="space-y-1.5">
                {segmentPaths.map((seg, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div 
                      className="w-4 h-1 rounded-full" 
                      style={{ backgroundColor: seg.color }}
                    />
                    <span className="text-xs text-gray-600">
                      {seg.segmentIndex}. Linha {seg.busLineNumber}
                    </span>
                  </div>
                ))}
              </div>
              {transferPoints.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-400 border-2 border-white" />
                    <span className="text-xs text-gray-600">Baldeação</span>
                  </div>
                </div>
              )}
            </div>
          )}
          {origin && (
            <MarkerF
              position={{ lat: origin.lat, lng: origin.lng }}
              label={{ text: 'O', color: 'white' }}
            />
          )}

          {destination && (
            <MarkerF
              position={{ lat: destination.lat, lng: destination.lng }}
              label={{ text: 'D', color: 'white' }}
            />
          )}

          {/* Desenhar cada segmento com cor diferente */}
          {segmentPaths.map((segmentPath, index) => (
            segmentPath.path.length > 0 && (
              <PolylineF
                key={`segment-${index}`}
                path={segmentPath.path}
                options={{
                  strokeColor: segmentPath.color,
                  strokeOpacity: 0.85,
                  strokeWeight: 6,
                  zIndex: 1000 - index, // Primeiro segmento fica por cima
                }}
              />
            )
          ))}

          {/* Marcadores de baldeação */}
          {transferPoints.map((point, index) => (
            point.location && (
              <MarkerF
                key={`transfer-${index}`}
                position={{ lat: point.location!.lat, lng: point.location!.lng }}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: '#FFD700', // Dourado
                  fillOpacity: 1,
                  strokeColor: '#FFFFFF',
                  strokeWeight: 3,
                }}
                label={{
                  text: `${point.segmentIndex}→${point.segmentIndex + 1}`,
                  color: '#000000',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
                title={`Baldeação: Linha ${point.fromLine} → Linha ${point.toLine}`}
              />
            )
          ))}
        </GoogleMap>
      )}
    </motion.div>
  );
}
