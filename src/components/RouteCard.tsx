import { Clock, DollarSign, ArrowRight, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { Route } from '../types/route';

interface RouteCardProps {
  route: Route;
  onSelect: () => void;
  isSelected: boolean;
}

export function RouteCard({ route, onSelect, isSelected }: RouteCardProps) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      onClick={onSelect}
      className={`relative cursor-pointer rounded-2xl p-6 transition-all duration-300 ${
        isSelected
          ? 'bg-gradient-to-br from-[#C4161C]/10 to-[#8B0F14]/5 border-2 border-[#C4161C] shadow-2xl'
          : 'bg-white/90 backdrop-blur-xl border border-gray-200 shadow-lg hover:shadow-2xl'
      }`}
      style={{
        transform: isSelected ? 'translateZ(20px)' : 'translateZ(0)',
      }}
    >
      {route.badges.length > 0 && (
        <div className="absolute -top-3 -right-3">
          {route.badges.map((badge, index) => {
            const badgeInfo = getBadgeInfo(badge);
            const Icon = badgeInfo.icon;
            return (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className={`${badgeInfo.color} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1`}
              >
                <Icon className="w-3 h-3" />
                {badgeInfo.label}
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#C4161C]/10 p-2 rounded-lg">
              <Clock className="w-5 h-5 text-[#C4161C]" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Duração Total</p>
              <p className="text-xl font-bold text-gray-900">{route.totalDuration} min</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-green-500/10 p-2 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Custo</p>
              <p className="text-xl font-bold text-gray-900">R$ {route.totalCost.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-600 mb-3">Trajeto</p>
          {route.segments.map((segment, index) => (
            <div key={index} className="mb-3 last:mb-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-gradient-to-r from-[#C4161C] to-[#8B0F14] text-white px-3 py-1 rounded-full text-xs font-bold">
                  {segment.busLine.number}
                </div>
                <span className="text-xs text-gray-600">{segment.busLine.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 ml-2">
                <span className="truncate">{segment.from}</span>
                <ArrowRight className="w-4 h-4 flex-shrink-0 text-[#C4161C]" />
                <span className="truncate">{segment.to}</span>
              </div>
            </div>
          ))}
        </div>

        {route.integrations > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
            <p className="text-xs text-yellow-800">
              {route.integrations} {route.integrations === 1 ? 'integração' : 'integrações'}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
