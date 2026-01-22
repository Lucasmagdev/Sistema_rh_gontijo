import { Clock, DollarSign, ArrowRight, Award, Bus, MapPin, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Route } from '../../types/route';
import { formatFare } from '../../services/routes/fareCalculator';
import { useState } from 'react';

interface RouteCardProps {
  route: Route;
  onSelect: () => void;
  isSelected: boolean;
  onAssignToEmployee?: (routeType: 'toWork' | 'fromWork') => void;
  showAssignButton?: boolean;
}

// Cores para diferentes tipos de linhas
const getLineColor = (index: number, type: 'urbano' | 'metropolitano'): string => {
  if (type === 'metropolitano') {
    return 'bg-purple-600'; // Roxo para metropolitano
  }
  
  // Cores para linhas urbanas (inspirado no sistema mostrado)
  const colors = [
    'bg-blue-700', // Azul escuro (primeira linha)
    'bg-orange-500', // Laranja
    'bg-gray-600', // Cinza
    'bg-green-600', // Verde
    'bg-indigo-600', // Índigo
  ];
  return colors[index % colors.length];
};

// Formatar horário
const formatTime = (time?: string): string => {
  if (!time) return '';
  try {
    const date = new Date(time);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return time;
  }
};

// Calcular horário de chegada baseado no horário de partida e duração
const calculateArrivalTime = (departureTime: string, durationMinutes: number): string => {
  try {
    const [hours, minutes] = departureTime.split(':').map(Number);
    const departure = new Date();
    departure.setHours(hours, minutes, 0, 0);
    const arrival = new Date(departure.getTime() + durationMinutes * 60000);
    return arrival.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

export function RouteCard({ route, onSelect, isSelected, onAssignToEmployee, showAssignButton }: RouteCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getBadgeInfo = (badge: string) => {
    switch (badge) {
      case 'economico':
        return { label: 'Mais Econômico', color: 'bg-green-500', icon: DollarSign };
      case 'rapido':
        return { label: 'Mais Rápido', color: 'bg-blue-500', icon: Clock };
      case 'equilibrado':
        return { label: 'Equilibrado', color: 'bg-purple-500', icon: Award };
      default:
        return { label: '', color: 'bg-gray-500', icon: Award };
    }
  };

  // Calcular horários se não estiverem disponíveis
  const departureTime = route.departureTime || route.segments[0]?.departureTime || '';
  const arrivalTime = route.arrivalTime || 
    (departureTime ? calculateArrivalTime(departureTime, route.totalDuration) : '');

  // Formatar duração
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={onSelect}
      className={`relative cursor-pointer rounded-xl p-4 transition-all duration-300 border ${
        isSelected
          ? 'bg-gradient-to-br from-[#C4161C]/10 to-[#8B0F14]/5 border-2 border-[#C4161C] shadow-lg'
          : 'bg-white border-gray-200 shadow-sm hover:shadow-md'
      }`}
    >
      {route.badges.length > 0 && (
        <div className="absolute -top-2 -right-2">
          {route.badges.map((badge, index) => {
            const badgeInfo = getBadgeInfo(badge);
            const Icon = badgeInfo.icon;
            return (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`${badgeInfo.color} text-white px-2 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1`}
              >
                <Icon className="w-3 h-3" />
                {badgeInfo.label}
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="space-y-3">
        {/* Cabeçalho: Horários e Duração */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bus className="w-5 h-5 text-[#C4161C]" />
            <div>
              {departureTime && arrivalTime ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {formatTime(departureTime)}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatTime(arrivalTime)}
                  </span>
                </div>
              ) : null}
              <p className="text-xs text-gray-500 mt-0.5">
                {formatDuration(route.totalDuration)}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">{formatFare(route.totalCost)}</p>
            {route.integrations > 0 && (
              <p className="text-xs text-gray-500">
                {route.integrations} {route.integrations === 1 ? 'baldeação' : 'baldeações'}
              </p>
            )}
          </div>
        </div>

        {/* Sequência Visual das Linhas (inspirado no sistema mostrado) */}
        <div className="flex items-center gap-2 flex-wrap">
          {route.segments.map((segment, index) => (
            <div key={index} className="flex items-center gap-2">
              {/* Tempo de caminhada antes (se houver) */}
              {segment.walkingTimeBefore && segment.walkingTimeBefore > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span>{segment.walkingTimeBefore} min</span>
                </div>
              )}

              {/* Ícone de ônibus e número da linha */}
              <div className="flex items-center gap-1.5">
                <Bus className="w-4 h-4 text-gray-600" />
                <div
                  className={`${getLineColor(index, segment.busLine.type)} text-white px-2.5 py-1 rounded text-xs font-bold`}
                >
                  {segment.busLine.number}
                </div>
              </div>

              {/* Seta para próximo segmento */}
              {index < route.segments.length - 1 && (
                <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              )}
            </div>
          ))}

          {/* Tempo de caminhada final (se houver) */}
          {route.segments[route.segments.length - 1]?.walkingTimeAfter && 
           route.segments[route.segments.length - 1].walkingTimeAfter! > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>{route.segments[route.segments.length - 1].walkingTimeAfter} min</span>
            </div>
          )}
        </div>

        {/* Informação de partida (primeira linha) */}
        {route.segments[0]?.departureTime && (
          <div className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
            <span className="font-medium">{formatTime(route.segments[0].departureTime)}</span> saindo de{' '}
            <span className="font-medium">{route.segments[0].from}</span>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(!showDetails);
            }}
            className="flex-1 text-left text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            {showDetails ? 'Ocultar detalhes' : 'Detalhes'}
            <svg
              className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showAssignButton && onAssignToEmployee && (
            <div className="flex gap-1">
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  onAssignToEmployee('toWork');
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-colors"
                title="Atribuir como rota de ida"
              >
                <UserPlus className="w-3 h-3" />
                Ida
              </motion.button>
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  onAssignToEmployee('fromWork');
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-colors"
                title="Atribuir como rota de volta"
              >
                <UserPlus className="w-3 h-3" />
                Volta
              </motion.button>
            </div>
          )}
        </div>

        {/* Detalhes Expandidos */}
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 pt-3 border-t border-gray-200"
          >
            {route.segments.map((segment, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`${getLineColor(index, segment.busLine.type)} text-white px-2.5 py-1 rounded text-xs font-bold`}>
                    {segment.busLine.number}
                  </div>
                  <span className="text-xs text-gray-700">{segment.busLine.name}</span>
                  {segment.departureTime && segment.arrivalTime && (
                    <span className="text-xs text-gray-500 ml-auto">
                      {formatTime(segment.departureTime)} → {formatTime(segment.arrivalTime)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 ml-2">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{segment.from}</span>
                  <ArrowRight className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{segment.to}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 ml-2">
                  <span>⏱️ {segment.duration} min</span>
                  <span>📏 {segment.distance.toFixed(1)} km</span>
                </div>

                {/* Baldeação */}
                {index < route.segments.length - 1 && (
                  <div className="bg-blue-50 border-l-2 border-blue-400 rounded-r px-3 py-2 ml-2">
                    <p className="text-xs font-medium text-blue-900">
                      Baldeação: Descer em <span className="font-bold">{segment.to}</span>
                    </p>
                    <p className="text-xs text-blue-700 mt-0.5">
                      Pegar linha <span className="font-bold">{route.segments[index + 1].busLine.number}</span> - {route.segments[index + 1].busLine.name}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
