import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { motion } from 'framer-motion';
import L from 'leaflet';
import { Route, Location } from '../types/route';
import 'leaflet/dist/leaflet.css';

const originIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const destinationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapViewProps {
  origin?: Location;
  destination?: Location;
  selectedRoute?: Route;
}

function MapController({ origin, destination }: { origin?: Location; destination?: Location }) {
  const map = useMap();

  useEffect(() => {
    if (origin && destination) {
      const bounds = L.latLngBounds(
        [origin.lat, origin.lng],
        [destination.lat, destination.lng]
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [origin, destination, map]);

  return null;
}

export function MapView({ origin, destination, selectedRoute }: MapViewProps) {
  const center: [number, number] = [-19.9167, -43.9345];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white/50"
    >
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {origin && (
          <Marker position={[origin.lat, origin.lng]} icon={originIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-bold text-green-700">Origem</p>
                <p className="text-sm">{origin.name}</p>
                <p className="text-xs text-gray-600">{origin.city}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {destination && (
          <Marker position={[destination.lat, destination.lng]} icon={destinationIcon}>
            <Popup>
              <div className="text-center">
                <p className="font-bold text-red-700">Destino</p>
                <p className="text-sm">{destination.name}</p>
                <p className="text-xs text-gray-600">{destination.city}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {selectedRoute && selectedRoute.path.length > 0 && (
          <Polyline
            positions={selectedRoute.path}
            color="#C4161C"
            weight={5}
            opacity={0.8}
            smoothFactor={1}
          />
        )}

        <MapController origin={origin} destination={destination} />
      </MapContainer>
    </motion.div>
  );
}
